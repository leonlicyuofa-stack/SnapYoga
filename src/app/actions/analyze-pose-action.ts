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

<<<<<<< HEAD
// 1. INPUT SCHEMA
// This validates the data coming from the frontend (Video Data URI)
=======
/** Full URL to the v2 vision analysis endpoint (override with ANALYSIS_SERVICE_URL). */
const DEFAULT_ANALYSIS_SERVICE_URL =
  'https://gcloud-yoga-pose-test-526785842170.asia-east2.run.app/v2/analyze-video-vision';

// Define the schema for the action's input
>>>>>>> bb90bfdc5eed7794e3b64f9dfecc9aa44ca7c44b
const AnalyzePoseInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe("A video of the user performing a yoga pose, as a data URI."),
  userId: z.string().describe("The UID of the user uploading the video."),
});

export type AnalyzePoseInput = z.infer<typeof AnalyzePoseInputSchema>;

<<<<<<< HEAD
/**
 * 2. NEW RAW OUTPUT SCHEMA
 * CHANGE THIS: Update this schema to match the EXACT JSON response 
 * structure from your new Cloud Run service.
 */
const AnalysisServiceRawOutputSchema = z.object({
  message: z.string().optional(),
  result_id: z.string(),
  summary: z.object({
    primary_pose: z.string(),
    score: z.number(),
    status: z.string().optional(),
  }),
  details: z.any().optional(), // For any additional complex metadata
});

// 3. CLEAN UI SCHEMA
// This is what the frontend components (cards, charts) actually use.
=======
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
>>>>>>> bb90bfdc5eed7794e3b64f9dfecc9aa44ca7c44b
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

<<<<<<< HEAD
/**
 * Helper to upload video to Firebase Storage
 */
=======
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

function parseAnalysisServiceResponse(
  raw: unknown,
  videoUrl: string
): AnalysisServiceOutput {
  const vision = AnalysisServiceRawOutputSchema.safeParse(raw);
  if (vision.success) {
    return mapVisionResponseToOutput(vision.data, videoUrl);
  }

  const legacy = AnalysisServiceLegacyRawSchema.safeParse(raw);
  if (legacy.success) {
    return mapLegacyResponseToOutput(legacy.data, videoUrl);
  }

  const detail = [`vision: ${vision.error.message}`, `legacy: ${legacy.error.message}`].join('\n');
  throw new Error(`Analysis response did not match vision API or legacy format.\n${detail}`);
}


// Helper to upload video to Firebase Storage
>>>>>>> bb90bfdc5eed7794e3b64f9dfecc9aa44ca7c44b
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
  
<<<<<<< HEAD
  const baseUrl = process.env.ANALYSIS_SERVICE_URL;
  if (!baseUrl) {
      throw new Error("ANALYSIS_SERVICE_URL environment variable is not set.");
  }
  
  // Update this path if your new endpoint changed (e.g., /analyze)
  const analysisServiceUrl = new URL('v2/analyze-video-vision', baseUrl).toString();
  
  let response: Response;
  let rawAnalysisResult: any = {};
=======
  const analysisServiceUrl =
    process.env.ANALYSIS_SERVICE_URL?.trim() || DEFAULT_ANALYSIS_SERVICE_URL;
  
  console.log(`Calling analysis service at: ${analysisServiceUrl} for video: ${gsPath}`);

  let response: Response = new Response(null, { status: 500 });
  let rawAnalysisResult: Record<string, unknown> | { error: string } = {};
>>>>>>> bb90bfdc5eed7794e3b64f9dfecc9aa44ca7c44b
  let responseStatus = 500;
  let responseOk = false;
  let errorBody = '';

  try {
      // Authenticate with Cloud Run
      const auth = new GoogleAuth();
      const client = await auth.getIdTokenClient(analysisServiceUrl);
      const headers = await client.getRequestHeaders();

<<<<<<< HEAD
      /**
       * 3. CALL EXTERNAL SERVICE
       * CHANGE THIS: If your service expects a JSON body instead of FormData, 
       * swap the body to JSON.stringify and add the Content-Type header.
       */
      const payload = {
          storage_url: gsPath,
          filename: `video_${videoId}.mp4`,
          userId: userId
      };
=======
      const formData = new FormData();
      formData.append('storage_url', gsPath);
      formData.append('filename', `video_${videoId}.mp4`);
>>>>>>> bb90bfdc5eed7794e3b64f9dfecc9aa44ca7c44b

      response = await fetch(analysisServiceUrl, {
          method: 'POST',
          headers: {
<<<<<<< HEAD
              ...headers,
              'Content-Type': 'application/json',
=======
              'Authorization': headers.Authorization,
>>>>>>> bb90bfdc5eed7794e3b64f9dfecc9aa44ca7c44b
          },
          body: JSON.stringify(payload),
      });

      responseStatus = response.status;
      responseOk = response.ok;

      if (!response.ok) {
          errorBody = await response.text();
          throw new Error(`Analysis service failed (${response.status}): ${errorBody}`);
      }
      
      rawAnalysisResult = await response.json();

  } catch(e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Error calling analysis service:", e);
      rawAnalysisResult = { error: message };
  } finally {
<<<<<<< HEAD
      // 4. LOG TO FIRESTORE
      // This saves a record of every API attempt for debugging and audit purposes.
=======
>>>>>>> bb90bfdc5eed7794e3b64f9dfecc9aa44ca7c44b
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
<<<<<<< HEAD
        console.error("Failed to log raw API response:", logError);
=======
        console.error("Failed to log API response to Firestore:", logError);
>>>>>>> bb90bfdc5eed7794e3b64f9dfecc9aa44ca7c44b
      }
  }

  if (!responseOk) {
      throw new Error(`Analysis failed. Details logged to your profile.`);
  }
  
<<<<<<< HEAD
  // 5. PARSE AND TRANSFORM
  // Parse the raw JSON using the schema defined above.
  const parsedResult = AnalysisServiceRawOutputSchema.parse(rawAnalysisResult);

  /**
   * 6. UI TRANSFORMATION
   * CHANGE THIS: Logic to turn your raw data into a string feedback and 0-100 score.
   */
  const finalResult = {
      feedback: `Great job on your ${parsedResult.summary.primary_pose}! You earned a score of ${parsedResult.summary.score.toFixed(1)}.`,
      score: parsedResult.summary.score,
      identifiedPose: parsedResult.summary.primary_pose,
      videoUrl: videoUrl,
  };

=======
  const finalResult = parseAnalysisServiceResponse(rawAnalysisResult, videoUrl);

>>>>>>> bb90bfdc5eed7794e3b64f9dfecc9aa44ca7c44b
  return AnalysisServiceOutputSchema.parse(finalResult);
}
