'use server';

/**
 * @fileOverview Server action to analyze a yoga pose video.
 * This action handles the secure communication between the client, 
 * Firebase Storage, and the external Python analysis service on Cloud Run.
 */

import { z } from 'zod';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { app, firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuth } from 'google-auth-library';

/** Default v2 route; must match your Cloud Run app. */
const DEFAULT_VISION_PATH = '/v2/analyze-video-vision';

const DEFAULT_ANALYSIS_SERVICE_URL = `https://gcloud-yoga-pose-test-526785842170.asia-east2.run.app${DEFAULT_VISION_PATH}`;

/**
 * ANALYSIS_SERVICE_URL is often set to the Cloud Run origin only in Firebase/GCP.
 * POST to `/` returns 405 if the handler lives under `/v2/...` only.
 */
function resolveAnalysisServiceUrl(): string {
  const raw = process.env.ANALYSIS_SERVICE_URL?.trim();
  if (!raw) return DEFAULT_ANALYSIS_SERVICE_URL;

  try {
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(withScheme);
    const normalizedPath = (u.pathname.replace(/\/+$/, '') || '') || '/';
    // Origin-only → use full vision path (POST / alone causes 405 on many FastAPI apps).
    if (normalizedPath === '' || normalizedPath === '/') {
      return new URL(DEFAULT_VISION_PATH, `${u.origin}/`).toString();
    }
    return u.toString();
  } catch {
    console.warn('Invalid ANALYSIS_SERVICE_URL, using default vision URL.');
    return DEFAULT_ANALYSIS_SERVICE_URL;
  }
}

// Define the schema for the action's input
const AnalyzePoseInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe("A video of the user performing a yoga pose, as a data URI."),
  userId: z.string().describe("The UID of the user uploading the video."),
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

const AnalysisServiceRawOutputSchema = z
  .object({
    identified_pose: z.string(),
    pose_confidence: z.string(),
    identification_reasoning: z.string(),
    joint_assessment: z.array(JointAssessmentEntrySchema),
    overall_score: z.number(),
    performance_grade: z.string(),
    overall_feedback: z.string(),
    priority_corrections: z.array(PriorityCorrectionEntrySchema),
    strengths: z.array(z.string()),
    recommended_preparatory_poses: z.array(RecommendedPreparatoryPoseSchema),
    progression_path: z.string(),
    motivational_note: z.string(),
  })
  .passthrough();

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
  return {
    feedback: raw.overall_feedback,
    score: raw.overall_score,
    identifiedPose: raw.identified_pose,
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

  // Error-ish payloads (no usable analysis fields)
  const hasVisionHint =
    'identified_pose' in o ||
    'overall_feedback' in o ||
    'identifiedPose' in o ||
    'overallFeedback' in o;
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

  // Unwrap common envelopes
  const innerCandidates = [o.analysis, o.data, o.result, o.payload, o.body, o.output];
  let merged: Record<string, unknown> = { ...o };
  for (const inner of innerCandidates) {
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      merged = { ...merged, ...(inner as Record<string, unknown>) };
    }
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


// Helper to upload video to Firebase Storage
async function uploadVideoToStorage(videoDataUri: string, userId: string, videoId: string, mimeType: string): Promise<string> {
    const storage = getStorage(app);
    const storageRef = ref(storage, `user-videos/${userId}/${videoId}.${mimeType.split('/')[1]}`);
    
    await uploadString(storageRef, videoDataUri, 'data_url', { contentType: mimeType });
    return getDownloadURL(storageRef);
}

/**
 * The main server action to perform pose analysis.
 */
export async function performPoseAnalysis(input: AnalyzePoseInput): Promise<AnalysisServiceOutput> {
  // Validate input from client
  const validatedInput = AnalyzePoseInputSchema.parse(input);
  const { userId, videoDataUri } = validatedInput;

  const videoId = uuidv4();
  const mimeType = videoDataUri.match(/data:(.*);base64,/)?.[1] || 'video/mp4';
  
  // 1. Upload to Storage
  const videoUrl = await uploadVideoToStorage(videoDataUri, userId, videoId, mimeType);
  
  // 2. Prepare for Cloud Run call
  const storage = getStorage(app);
  const storageRef = ref(storage, `user-videos/${userId}/${videoId}.${mimeType.split('/')[1]}`);
  const gsPath = `gs://${storageRef.bucket}/${storageRef.fullPath}`;
  
  const analysisServiceUrl = resolveAnalysisServiceUrl();

  console.log(`Calling analysis service at: ${analysisServiceUrl} for video: ${gsPath}`);

  let response: Response = new Response(null, { status: 500 });
  let rawAnalysisResult: Record<string, unknown> | { error: string } = {};
  let responseStatus = 500;
  let responseOk = false;
  let errorBody = '';

  try {
      // Authenticate with Cloud Run
      const auth = new GoogleAuth();
      const client = await auth.getIdTokenClient(analysisServiceUrl);
      const headers = await client.getRequestHeaders();

      const formData = new FormData();
      formData.append('storage_url', gsPath);
      formData.append('filename', `video_${videoId}.mp4`);

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
          throw new Error(`Analysis service failed with status ${response.status}: ${errorBody}`);
      }
      
      rawAnalysisResult = await response.json();

  } catch(e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Error calling analysis service:", e);
      rawAnalysisResult = { error: message };
  } finally {
      try {
        const logCollectionRef = collection(firestore, 'users', userId, 'poseAnalysisRawLogs');
        await addDoc(logCollectionRef, {
          rawResponse: rawAnalysisResult,
          videoUrl: videoUrl,
          gsPath: gsPath,
          createdAt: serverTimestamp(),
          isError: !responseOk,
          responseStatus,
          errorBody: errorBody || null,
        });
      } catch (logError) {
        console.error("Failed to log API response to Firestore:", logError);
      }
  }

  if (!responseOk) {
      throw new Error(`Analysis service failed with status ${responseStatus}: ${errorBody}`);
  }
  
  const finalResult = parseAnalysisServiceResponse(rawAnalysisResult, videoUrl);

  return AnalysisServiceOutputSchema.parse(finalResult);
}
