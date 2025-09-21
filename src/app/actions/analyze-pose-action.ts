
'use server';

/**
 * @fileOverview Server action to analyze a yoga pose video.
 * This action uploads a video to Firebase Storage and calls an external
 * Python service on Cloud Run for analysis, returning the result directly.
 */

import { z } from 'zod';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { app } from '@/lib/firebase/clientApp';
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

// Define the expected output from the analysis service
const AnalysisServiceOutputSchema = z.object({
  feedback: z.string(),
  score: z.number(),
  identifiedPose: z.string(),
});

export type AnalysisServiceOutput = z.infer<typeof AnalysisServiceOutputSchema> & {
    videoUrl: string;
};


// Helper to upload video to Firebase Storage
async function uploadVideoToStorage(videoDataUri: string, userId: string): Promise<string> {
    const storage = getStorage(app);
    const videoId = uuidv4();
    const mimeType = videoDataUri.match(/data:(.*);base64,/)?.[1] || 'video/mp4';
    const storageRef = ref(storage, `user-videos/${userId}/${videoId}.${mimeType.split('/')[1]}`);
    
    await uploadString(storageRef, videoDataUri, 'data_url', { contentType: mimeType });
    return getDownloadURL(storageRef);
}

// Helper to get an auth token for Cloud Run
async function getAuthToken(audience: string): Promise<string> {
    const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });
    const client = await auth.getIdTokenClient(audience);
    const res = await client.getRequestHeaders();
    if (!res.Authorization) {
        throw new Error('Could not generate authorization token for Cloud Run service.');
    }
    return res.Authorization;
}

/**
 * The main server action to analyze a yoga pose.
 * @param input The user's video data and user ID.
 * @returns The analysis result from the Python service.
 */
export async function performPoseAnalysis(input: AnalyzePoseInput): Promise<AnalysisServiceOutput> {
  // Validate input
  const validatedInput = AnalyzePoseInputSchema.parse(input);

  // 1. Upload video to Firebase Storage
  const videoUrl = await uploadVideoToStorage(validatedInput.videoDataUri, validatedInput.userId);
  
  // 2. Call the external Python service on Cloud Run
  const baseUrl = process.env.ANALYSIS_SERVICE_URL;
  if (!baseUrl) {
      throw new Error("ANALYSIS_SERVICE_URL environment variable is not set.");
  }
  
  const analysisServiceUrl = new URL('/analyze-video-comprehensive/', baseUrl).toString();
  
  console.log(`Calling analysis service at: ${analysisServiceUrl} for video: ${videoUrl}`);

  const authToken = await getAuthToken(baseUrl);

  const response = await fetch(analysisServiceUrl, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': authToken,
      },
      body: JSON.stringify({ videoUrl: videoUrl }),
  });

  if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error from analysis service:", errorBody);
      throw new Error(`Analysis service failed with status ${response.status}: ${errorBody}`);
  }

  const analysisResult = await response.json();
  
  // 3. Validate and return the combined result
  const finalResult = {
      ...analysisResult,
      videoUrl: videoUrl,
  };

  return AnalysisServiceOutputSchema.extend({ videoUrl: z.string() }).parse(finalResult);
}
