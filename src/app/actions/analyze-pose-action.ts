
'use server';

/**
 * @fileOverview Server action to analyze a yoga pose video.
 * This action uploads a video to Firebase Storage and calls an external
 * Python service on Cloud Run for analysis, returning the result directly.
 */

import { z } from 'zod';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { app, firestore } from '@/lib/firebase/clientApp'; // Import firestore
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import firestore functions
import { GoogleAuth } from 'google-auth-library';

/** Full URL to the v2 vision analysis endpoint (override with ANALYSIS_SERVICE_URL). */
const DEFAULT_ANALYSIS_SERVICE_URL =
  'https://gcloud-yoga-pose-test-526785842170.asia-east2.run.app/v2/analyze-video-vision';

// Define the schema for the action's input
const AnalyzePoseInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of the user performing a yoga pose, as a data URI."
    ),
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


// Helper to upload video to Firebase Storage
async function uploadVideoToStorage(videoDataUri: string, userId: string, videoId: string, mimeType: string): Promise<string> {
    const storage = getStorage(app);
    const storageRef = ref(storage, `user-videos/${userId}/${videoId}.${mimeType.split('/')[1]}`);
    
    await uploadString(storageRef, videoDataUri, 'data_url', { contentType: mimeType });
    return getDownloadURL(storageRef);
}

/**
 * The main server action to analyze a yoga pose.
 * @param input The user's video data and user ID.
 * @returns The analysis result from the Python service.
 */
export async function performPoseAnalysis(input: AnalyzePoseInput): Promise<AnalysisServiceOutput> {
  // Validate input
  const validatedInput = AnalyzePoseInputSchema.parse(input);
  const { userId, videoDataUri } = validatedInput;

  // 1. Generate videoId and mimeType once
  const videoId = uuidv4();
  const mimeType = videoDataUri.match(/data:(.*);base64,/)?.[1] || 'video/mp4';
  
  // 2. Upload video to Firebase Storage
  const videoUrl = await uploadVideoToStorage(videoDataUri, userId, videoId, mimeType);
  
  // 3. Get the gs:// path for the API call (using same videoId)
  const storage = getStorage(app);
  const storageRef = ref(storage, `user-videos/${userId}/${videoId}.${mimeType.split('/')[1]}`);
  const gsPath = `gs://${storageRef.bucket}/${storageRef.fullPath}`;
  
  const analysisServiceUrl =
    process.env.ANALYSIS_SERVICE_URL?.trim() || DEFAULT_ANALYSIS_SERVICE_URL;
  
  console.log(`Calling analysis service at: ${analysisServiceUrl} for video: ${gsPath}`);

  let response: Response = new Response(null, { status: 500 });
  let rawAnalysisResult: Record<string, unknown> | { error: string } = {};
  let responseStatus = 500;
  let responseOk = false;
  let errorBody = '';

  try {
      // Get authentication token for Cloud Run
      const auth = new GoogleAuth();
      const client = await auth.getIdTokenClient(analysisServiceUrl);
      const headers = await client.getRequestHeaders();

      const formData = new FormData();
      formData.append('storage_url', gsPath);
      formData.append('filename', `video_${videoId}.mp4`);

      response = await fetch(analysisServiceUrl, {
          method: 'POST',
          headers: {
              'Authorization': headers.Authorization,
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
          responseStatus: responseStatus,
          errorBody: errorBody || null,
        });
        console.log("Successfully logged API response/error to Firestore.");
      } catch (logError) {
        console.error("Failed to log API response to Firestore:", logError);
      }
  }

  if (!responseOk) {
      throw new Error(`Analysis service failed with status ${responseStatus}: ${errorBody}`);
  }
  
  const parsedResult = AnalysisServiceRawOutputSchema.parse(rawAnalysisResult);
  const finalResult = mapVisionResponseToOutput(parsedResult, videoUrl);

  return AnalysisServiceOutputSchema.parse(finalResult);
}
