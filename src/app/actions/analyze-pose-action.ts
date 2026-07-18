'use server';

/**
 * @fileOverview Server action to analyze a yoga pose (video or image).
 * This action handles the secure communication between the client, 
 * Firebase Storage, and the external Python analysis service on Cloud Run.
 */

import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { createGoogleAuth } from '@/lib/gcp/credentials';
import { getAdminFirestore, getAdminStorageBucket } from '@/lib/firebase/adminApp';

/** Default v2 route; must match your Cloud Run app (see /openapi.json on the service). */
const DEFAULT_VISION_PATH = '/v2/analyze-video-vision';

const DEFAULT_ANALYSIS_SERVICE_ORIGIN =
  'https://gcloud-yoga-pose-test-526785842170.asia-east2.run.app';

const DEFAULT_ANALYSIS_SERVICE_URL = `${DEFAULT_ANALYSIS_SERVICE_ORIGIN}${DEFAULT_VISION_PATH}`;

function resolveVisionPath(): string {
  const customPath = process.env.ANALYSIS_SERVICE_PATH?.trim();
  if (!customPath) return DEFAULT_VISION_PATH;
  return customPath.startsWith('/') ? customPath : `/${customPath}`;
}

/** Normalize path: collapse slashes, drop trailing slash (FastAPI 404/307 on mismatch). */
function normalizeServiceUrl(url: string): string {
  const u = new URL(url);
  u.pathname = u.pathname.replace(/\/+/g, '/').replace(/\/+$/, '') || '/';
  return u.toString();
}

/**
 * ANALYSIS_SERVICE_URL is often set to the Cloud Run origin only in Firebase/GCP.
 * ANALYSIS_SERVICE_PATH can override the POST path (default: /v2/analyze-video-vision).
 */
function resolveAnalysisServiceUrl(): string {
  const raw = process.env.ANALYSIS_SERVICE_URL?.trim();
  if (!raw) return normalizeServiceUrl(DEFAULT_ANALYSIS_SERVICE_URL);

  try {
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(withScheme);
    const normalizedPath = u.pathname.replace(/\/+$/, '') || '/';

    // Origin-only → attach vision path.
    if (normalizedPath === '/') {
      return normalizeServiceUrl(new URL(resolveVisionPath(), `${u.origin}/`).toString());
    }

    return normalizeServiceUrl(u.toString());
  } catch {
    console.warn('Invalid ANALYSIS_SERVICE_URL, using default vision URL.');
    return normalizeServiceUrl(DEFAULT_ANALYSIS_SERVICE_URL);
  }
}

/**
 * Last line of defense: if anything above produced a root URL, always attach the vision route.
 */
function ensurePostTargetsVisionRoute(url: string): string {
  try {
    const u = new URL(url);
    const pathOnly = u.pathname.replace(/\/+$/, '') || '/';
    if (pathOnly === '/') {
      const fixed = normalizeServiceUrl(new URL(resolveVisionPath(), `${u.origin}/`).toString());
      console.warn(
        `[pose-analysis] ANALYSIS_SERVICE_URL resolved to root; forcing path ${resolveVisionPath()}. Now: ${fixed}`
      );
      return fixed;
    }
    return normalizeServiceUrl(url);
  } catch {
    return normalizeServiceUrl(DEFAULT_ANALYSIS_SERVICE_URL);
  }
}

function cloudRunOrigin(serviceUrl: string): string {
  return new URL(serviceUrl).origin;
}

// Define the schema for the action's input.
// Media is uploaded to Firebase Storage directly from the browser; the action
// only receives the resulting storage path (no large payload through Vercel).
const AnalyzePoseInputSchema = z.object({
  userId: z.string().min(1).describe("The UID of the user uploading the media."),
  objectPath: z
    .string()
    .min(1)
    .describe("Storage object path, e.g. user-media/{uid}/{id}.mp4."),
  mediaUrl: z
    .string()
    .url()
    .describe("Public download URL for the uploaded media (from getDownloadURL)."),
  mimeType: z.string().min(1).describe("MIME type of the uploaded media."),
  userNotes: z.string().optional().describe("Optional context or questions from the user."),
});

export type AnalyzePoseInput = z.infer<typeof AnalyzePoseInputSchema>;

// --- Raw JSON from POST /v2/analyze-video-vision (snake_case) ---

const JointAssessmentEntrySchema = z.object({
  joint: z.string(),
  observation: z.string(),
  status: z.string(),
  correction: z.string().nullable(),
});

const PriorityCorrectionEntrySchema = z.object({
  joint: z.string(),
  issue: z.string(),
  correction: z.string(),
  cue: z.string(),
});

const RecommendedPreparatoryPoseSchema = z.object({
  pose: z.string(),
  reason: z.string(),
});

/** Vision payload: strict v2 example OR nested `{ response: { ... } }` with abbreviated keys (feedback, score, …). */
const AnalysisServiceRawOutputSchema = z
  .object({
    identified_pose: z.string().optional(),
    pose_confidence: z.string().optional(),
    identification_reasoning: z.string().optional(),
    joint_assessment: z.array(JointAssessmentEntrySchema).optional(),
    overall_score: z.number().optional(),
    performance_grade: z.string().optional(),
    overall_feedback: z.string().optional(),
    /** API shorthand (merged from nested `response`) */
    feedback: z.string().optional(),
    score: z.number().optional(),
    priority_corrections: z.array(PriorityCorrectionEntrySchema).optional(),
    strengths: z.array(z.string()).optional(),
    recommended_preparatory_poses: z.array(RecommendedPreparatoryPoseSchema).optional(),
    progression_path: z.string().optional(),
    motivational_note: z.string().optional(),
  })
  .passthrough()
  .superRefine((val, ctx) => {
    const fb = String(val.overall_feedback ?? val.feedback ?? '').trim();
    const pose = String(val.identified_pose ?? '').trim();
    const sc = val.overall_score ?? val.score;
    if (!fb.length && !pose.length && typeof sc !== 'number') {
      ctx.addIssue({
        code: 'custom',
        message: 'Vision payload has no usable feedback, pose, or score after unwrapping `response`.',
      });
    }
  });

/** Older `/analyze-video-comprehensive/` style JSON (still supported for migration). */
const AnalysisServiceLegacyRawSchema = z
  .object({
    message: z.string(),
    result_id: z.string(),
    summary: z.object({
      total_frames_analyzed: z.number(),
      primary_pose_detected: z.string(),
      average_performance_score: z.number(),
      performance_grade: z.string(),
    }),
    overall_performance: z.object({
      average_score: z.number(),
      overall_grade: z.string(),
      primary_pose: z.string(),
      pose_distribution: z.record(z.number()),
      total_frames: z.number(),
    }),
  })
  .passthrough();

export type JointAssessmentEntry = z.infer<typeof JointAssessmentEntrySchema>;
export type PriorityCorrectionEntry = z.infer<typeof PriorityCorrectionEntrySchema>;
export type RecommendedPreparatoryPose = z.infer<typeof RecommendedPreparatoryPoseSchema>;

// App-facing shape (camelCase); core fields keep existing UI contract.
const AnalysisServiceOutputSchema = z.object({
  feedback: z.string(),
  score: z.number(),
  identifiedPose: z.string(),
  videoUrl: z.string(),
  poseConfidence: z.string().optional(),
  identificationReasoning: z.string().optional(),
  jointAssessment: z.array(JointAssessmentEntrySchema).optional(),
  performanceGrade: z.string().optional(),
  priorityCorrections: z.array(PriorityCorrectionEntrySchema).optional(),
  strengths: z.array(z.string()).optional(),
  recommendedPreparatoryPoses: z.array(RecommendedPreparatoryPoseSchema).optional(),
  progressionPath: z.string().optional(),
  motivationalNote: z.string().optional(),
});

export type AnalysisServiceOutput = z.infer<typeof AnalysisServiceOutputSchema>;

function mapVisionResponseToOutput(
  raw: z.infer<typeof AnalysisServiceRawOutputSchema>,
  videoUrl: string
): AnalysisServiceOutput {
  const feedback = (raw.overall_feedback ?? raw.feedback ?? 'Analysis completed.').trim();
  const score = raw.overall_score ?? raw.score ?? 0;
  const identifiedPose = (raw.identified_pose ?? 'Yoga pose').trim();
  return {
    feedback,
    score,
    identifiedPose,
    videoUrl,
    poseConfidence: raw.pose_confidence,
    identificationReasoning: raw.identification_reasoning,
    jointAssessment: raw.joint_assessment,
    performanceGrade: raw.performance_grade,
    priorityCorrections: raw.priority_corrections,
    strengths: raw.strengths,
    recommendedPreparatoryPoses: raw.recommended_preparatory_poses,
    progressionPath: raw.progression_path,
    motivationalNote: raw.motivational_note,
  };
}

function mapLegacyResponseToOutput(
  raw: z.infer<typeof AnalysisServiceLegacyRawSchema>,
  videoUrl: string
): AnalysisServiceOutput {
  const { summary } = raw;
  const feedback = `Analysis complete for ${summary.primary_pose_detected}. Your average performance score was ${summary.average_performance_score.toFixed(1)} with a grade of ${summary.performance_grade}. A total of ${summary.total_frames_analyzed} frames were analyzed.`;
  return {
    feedback,
    score: summary.average_performance_score,
    identifiedPose: summary.primary_pose_detected,
    videoUrl,
    performanceGrade: summary.performance_grade,
  };
}

/**
 * FastAPI/Starlette errors, nested payloads, or camelCase keys from some gateways.
 */
function normalizeAnalysisJsonBody(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return raw;
  }

  const o = raw as Record<string, unknown>;

  const responseObj =
    o.response && typeof o.response === 'object' && !Array.isArray(o.response)
      ? (o.response as Record<string, unknown>)
      : null;

  // Error-ish payloads (no usable analysis fields)
  const hasVisionHint =
    'identified_pose' in o ||
    'overall_feedback' in o ||
    'identifiedPose' in o ||
    'overallFeedback' in o ||
    'feedback' in o ||
    typeof o.score === 'number' ||
    !!(responseObj &&
      ('identified_pose' in responseObj ||
        'overall_feedback' in responseObj ||
        'feedback' in responseObj ||
        'pose_name' in responseObj ||
        typeof responseObj.score === 'number' ||
        typeof responseObj.overall_score === 'number'));
  const hasLegacyHint = 'summary' in o && o.summary && typeof o.summary === 'object';
  if (!hasVisionHint && !hasLegacyHint && 'detail' in o) {
    const d = o.detail;
    const msg =
      typeof d === 'string'
        ? d
        : Array.isArray(d)
          ? JSON.stringify(d)
          : JSON.stringify(d);
    throw new Error(
      `Analysis API returned an error (detail): ${msg}. Check Cloud Run route and request body (POST must hit /v2/analyze-video-vision, not POST /).`
    );
  }

  // Unwrap common envelopes (API returns { message, result_id, view_url, response: { ... } })
  const innerCandidates = [o.response, o.analysis, o.data, o.result, o.payload, o.body, o.output];
  let merged: Record<string, unknown> = { ...o };
  for (const inner of innerCandidates) {
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      merged = { ...merged, ...(inner as Record<string, unknown>) };
    }
  }

  // Short keys from Cloud Run → vision schema field names
  if (merged.overall_feedback == null && typeof merged.feedback === 'string') {
    merged.overall_feedback = merged.feedback;
  }
  if (merged.overall_score == null && typeof merged.score === 'number') {
    merged.overall_score = merged.score;
  }
  if (merged.identified_pose == null && typeof merged.pose === 'string') {
    merged.identified_pose = merged.pose;
  }
  if (merged.identified_pose == null && typeof merged.primary_pose === 'string') {
    merged.identified_pose = merged.primary_pose;
  }
  if (merged.identified_pose == null && typeof merged.pose_name === 'string') {
    merged.identified_pose = merged.pose_name;
  }

  // camelCase → snake_case for vision fields missing on API
  const alias: [string, string][] = [
    ['identifiedPose', 'identified_pose'],
    ['poseConfidence', 'pose_confidence'],
    ['identificationReasoning', 'identification_reasoning'],
    ['jointAssessment', 'joint_assessment'],
    ['overallScore', 'overall_score'],
    ['performanceGrade', 'performance_grade'],
    ['overallFeedback', 'overall_feedback'],
    ['priorityCorrections', 'priority_corrections'],
    ['recommendedPreparatoryPoses', 'recommended_preparatory_poses'],
    ['progressionPath', 'progression_path'],
    ['motivationalNote', 'motivational_note'],
  ];
  for (const [camel, snake] of alias) {
    if (merged[snake] == null && merged[camel] != null) {
      merged[snake] = merged[camel];
    }
  }

  return merged;
}

function parseAnalysisServiceResponse(
  raw: unknown,
  videoUrl: string
): AnalysisServiceOutput {
  let payload = raw;
  try {
    payload = normalizeAnalysisJsonBody(raw);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }

  const vision = AnalysisServiceRawOutputSchema.safeParse(payload);
  if (vision.success) {
    return mapVisionResponseToOutput(vision.data, videoUrl);
  }

  const legacy = AnalysisServiceLegacyRawSchema.safeParse(payload);
  if (legacy.success) {
    return mapLegacyResponseToOutput(legacy.data, videoUrl);
  }

  const keys =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? Object.keys(payload as object).slice(0, 25)
      : [];
  const preview =
    payload && typeof payload === 'object'
      ? JSON.stringify(payload).slice(0, 500)
      : String(payload);

  const detail = [`vision: ${vision.error.message}`, `legacy: ${legacy.error.message}`].join('\n');
  throw new Error(
    `Analysis response did not match vision API or legacy format. Top-level keys: [${keys.join(', ')}]. Preview: ${preview}\n${detail}`
  );
}


function extensionFromMimeType(mimeType: string): string {
  let extension = mimeType.split('/')[1] ?? 'mp4';
  if (extension === 'jpeg') extension = 'jpg';
  if (extension === 'quicktime') extension = 'mov';
  return extension;
}

/**
 * Ensure the client-supplied object path belongs to the calling user and lives
 * under the expected media prefix, then resolve it to a gs:// URL using the
 * server's authoritative bucket name.
 */
function resolveUserMediaGsPath(userId: string, objectPath: string): string {
  const normalized = objectPath.replace(/^\/+/, '');
  const expectedPrefix = `user-media/${userId}/`;

  if (!normalized.startsWith(expectedPrefix)) {
    throw new Error(
      `Invalid media path for this user. Expected it to start with "${expectedPrefix}".`
    );
  }
  if (normalized.includes('..')) {
    throw new Error('Invalid media path.');
  }

  const bucketName = getAdminStorageBucket().bucket().name;
  return `gs://${bucketName}/${normalized}`;
}

/**
 * The main server action to perform pose analysis.
 * Bundles media and text notes together for the API call.
 */
export async function performPoseAnalysis(input: AnalyzePoseInput): Promise<AnalysisServiceOutput> {
  // Validate input from client
  const validatedInput = AnalyzePoseInputSchema.parse(input);
  const { userId, objectPath, mediaUrl, mimeType, userNotes } = validatedInput;

  const mediaId = uuidv4();
  const extension = extensionFromMimeType(mimeType);

  // Media is already in Storage (uploaded directly from the browser).
  // Validate ownership and resolve the gs:// path from the server's bucket.
  const gsPath = resolveUserMediaGsPath(userId, objectPath);

  const analysisServiceUrl = ensurePostTargetsVisionRoute(resolveAnalysisServiceUrl());
  console.info(`[pose-analysis] POST ${analysisServiceUrl} for ${gsPath}`);

  let response: Response = new Response(null, { status: 500 });
  let rawAnalysisResult: Record<string, unknown> | { error: string } = {};
  let responseStatus = 500;
  let responseOk = false;
  let errorBody = '';

  try {
      // Cloud Run ID token audience is the service origin (not the path).
      const auth = createGoogleAuth();
      const client = await auth.getIdTokenClient(cloudRunOrigin(analysisServiceUrl));
      const headers = await client.getRequestHeaders();

      // 3. Bundle everything for the API request
      const formData = new FormData();
      formData.append('storage_url', gsPath);
      formData.append('filename', `media_${mediaId}.${extension}`);
      if (userNotes) {
        formData.append('user_notes', userNotes);
      }

      response = await fetch(analysisServiceUrl, {
          method: 'POST',
          headers: {
              Authorization: headers.Authorization!,
          },
          body: formData,
      });

      responseStatus = response.status;
      responseOk = response.ok;

      if (!response.ok) {
          errorBody = await response.text();
          const hint =
            response.status === 404
              ? ` Route not found on Cloud Run. Verify ANALYSIS_SERVICE_URL is your *.run.app origin ` +
                `(e.g. ${DEFAULT_ANALYSIS_SERVICE_ORIGIN}) or set ANALYSIS_SERVICE_PATH=/v2/analyze-video-vision. ` +
                `Check routes at {origin}/openapi.json. Called: ${analysisServiceUrl}`
              : '';
          throw new Error(
            `Analysis service failed with status ${response.status}: ${errorBody}.${hint}`
          );
      }
      
      rawAnalysisResult = await response.json();

  } catch(e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Error calling analysis service:", e);
      rawAnalysisResult = { error: message };
  } finally {
      // 4. Log the interaction to Firestore (Admin SDK)
      try {
        await getAdminFirestore()
          .collection('users')
          .doc(userId)
          .collection('poseAnalysisRawLogs')
          .add({
            rawResponse: rawAnalysisResult,
            mediaUrl,
            gsPath,
            userNotes: userNotes || null,
            createdAt: FieldValue.serverTimestamp(),
            isError: !responseOk,
            responseStatus,
            errorBody: errorBody || null,
          });
      } catch (logError) {
        console.error("Failed to log API response to Firestore:", logError);
      }
  }

  if (!responseOk) {
      const hint =
        responseStatus === 404
          ? ` (POST ${analysisServiceUrl} — check ANALYSIS_SERVICE_URL on Vercel)`
          : '';
      throw new Error(
        `Analysis service failed with status ${responseStatus}: ${errorBody}${hint}`
      );
  }
  
  const finalResult = parseAnalysisServiceResponse(rawAnalysisResult, mediaUrl);

  return AnalysisServiceOutputSchema.parse(finalResult);
}
