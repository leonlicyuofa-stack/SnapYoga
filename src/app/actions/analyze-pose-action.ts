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

// 1. INPUT SCHEMA
// This validates the data coming from the frontend (Video Data URI)
const AnalyzePoseInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe("A video of the user performing a yoga pose, as a data URI."),
  userId: z.string().describe("The UID of the user uploading the video."),
});

export type AnalyzePoseInput = z.infer<typeof AnalyzePoseInputSchema>;

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
const AnalysisServiceOutputSchema = z.object({
  feedback: z.string(),
  score: z.number(),
  identifiedPose: z.string(),
  videoUrl: z.string(),
});

export type AnalysisServiceOutput = z.infer<typeof AnalysisServiceOutputSchema>;

/**
 * Helper to upload video to Firebase Storage
 */
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
  
  const baseUrl = process.env.ANALYSIS_SERVICE_URL;
  if (!baseUrl) {
      throw new Error("ANALYSIS_SERVICE_URL environment variable is not set.");
  }
  
  // Update this path if your new endpoint changed (e.g., /analyze)
  const analysisServiceUrl = new URL('v2/analyze-video-vision', baseUrl).toString();
  
  let response: Response;
  let rawAnalysisResult: any = {};
  let responseStatus = 500;
  let responseOk = false;
  let errorBody = '';

  try {
      // Authenticate with Cloud Run
      const auth = new GoogleAuth();
      const client = await auth.getIdTokenClient(analysisServiceUrl);
      const headers = await client.getRequestHeaders();

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

      response = await fetch(analysisServiceUrl, {
          method: 'POST',
          headers: {
              ...headers,
              'Content-Type': 'application/json',
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

  } catch(e: any) {
      console.error("Error calling analysis service:", e);
      rawAnalysisResult = { error: e.message };
  } finally {
      // 4. LOG TO FIRESTORE
      // This saves a record of every API attempt for debugging and audit purposes.
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
        console.error("Failed to log raw API response:", logError);
      }
  }

  if (!responseOk) {
      throw new Error(`Analysis failed. Details logged to your profile.`);
  }
  
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

  return AnalysisServiceOutputSchema.parse(finalResult);
}
