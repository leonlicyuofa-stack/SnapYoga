
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

// Define the NEW expected output from the analysis service
const AnalysisServiceRawOutputSchema = z.object({
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
});

// This is the clean output format that the frontend components will use
const AnalysisServiceOutputSchema = z.object({
  feedback: z.string(),
  score: z.number(),
  identifiedPose: z.string(),
  videoUrl: z.string(),
});

export type AnalysisServiceOutput = z.infer<typeof AnalysisServiceOutputSchema>;


// Helper to upload video to Firebase Storage
async function uploadVideoToStorage(videoDataUri: string, userId: string): Promise<string> {
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!storageBucket) {
        throw new Error("Firebase Storage bucket name is not configured in environment variables.");
    }
    const storage = getStorage(app, storageBucket);
    const videoId = uuidv4();
    const mimeType = videoDataUri.match(/data:(.*);base64,/)?.[1] || 'video/mp4';
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

  // 1. Upload video to Firebase Storage
  const videoUrl = await uploadVideoToStorage(videoDataUri, userId);
  
  // 2. Call the external Python service on Cloud Run
  const baseUrl = process.env.ANALYSIS_SERVICE_URL;
  if (!baseUrl) {
      throw new Error("ANALYSIS_SERVICE_URL environment variable is not set.");
  }
  
  const analysisServiceUrl = new URL('/analyze-video-comprehensive/', baseUrl).toString();
  
  console.log(`Calling analysis service at: ${analysisServiceUrl} for video: ${videoUrl}`);

  let response: Response;
  let rawAnalysisResult: any = {};
  let responseStatus = 500;
  let responseOk = false;
  let errorBody = '';

  try {
      // Get authentication token for Cloud Run
      const auth = new GoogleAuth();
      const client = await auth.getIdTokenClient(analysisServiceUrl);
      const headers = await client.getRequestHeaders();

      response = await fetch(analysisServiceUrl, {
          method: 'POST',
          headers: {
              ...headers,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoUrl }),
      });

      responseStatus = response.status;
      responseOk = response.ok;

      if (!response.ok) {
          errorBody = await response.text();
          throw new Error(`Analysis service failed with status ${response.status}: ${errorBody}`);
      }
      
      rawAnalysisResult = await response.json();

  } catch(e: any) {
      console.error("Error calling analysis service:", e);
      rawAnalysisResult = { error: e.message };
  } finally {
      // Save the raw JSON or error to Firestore for review
      try {
        const logCollectionRef = collection(firestore, 'users', userId, 'poseAnalysisRawLogs');
        await addDoc(logCollectionRef, {
          rawResponse: rawAnalysisResult,
          videoUrl: videoUrl,
          createdAt: serverTimestamp(),
          isError: !responseOk,
          responseStatus: responseStatus,
          errorBody: errorBody || null,
        });
        console.log("Successfully logged API response/error to Firestore.");
      } catch (logError) {
        console.error("Failed to log API response to Firestore:", logError);
        // We don't throw here, as logging is a secondary concern.
      }
  }

  // If the initial request failed, throw an error to notify the frontend
  if (!responseOk) {
      throw new Error(`Analysis service failed with status ${responseStatus}: ${errorBody}`);
  }
  
  // 3. Parse the new, complex structure
  const parsedResult = AnalysisServiceRawOutputSchema.parse(rawAnalysisResult);

  // 4. Transform the complex result into the simple format our app uses
  const { summary } = parsedResult;
  const feedback = `Analysis complete for ${summary.primary_pose_detected}. Your average performance score was ${summary.average_performance_score.toFixed(1)} with a grade of ${summary.performance_grade}. A total of ${summary.total_frames_analyzed} frames were analyzed.`;
  
  const finalResult = {
      feedback: feedback,
      score: summary.average_performance_score,
      identifiedPose: summary.primary_pose_detected,
      videoUrl: videoUrl,
  };

  // 5. Validate and return the simplified result
  return AnalysisServiceOutputSchema.parse(finalResult);
}
