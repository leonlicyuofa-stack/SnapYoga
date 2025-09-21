
'use server';

/**
 * @fileOverview Analyzes a video of a user performing a yoga pose by uploading it to storage
 * and calling a custom Python analysis service.
 *
 * - analyzeYogaPose - A function that handles the yoga pose analysis process.
 * - AnalyzeYogaPoseInput - The input type for the analyzeYogaPose function.
 * - AnalyzeYogaPoseOutput - The return type for the analyzeYogaPose function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { app } from '@/lib/firebase/clientApp'; // Import the initialized app
import { GoogleAuth } from 'google-auth-library';


const AnalyzeYogaPoseInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of the user performing a yoga pose, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userId: z.string().describe("The UID of the user uploading the video."),
});
export type AnalyzeYogaPoseInput = z.infer<typeof AnalyzeYogaPoseInputSchema>;

const AnalyzeYogaPoseOutputSchema = z.object({
  feedback: z.string().describe('Feedback on the user\'s yoga pose, including areas for improvement.'),
  score: z.number().min(0).max(100).describe('A score from 0 to 100 representing the quality of the yoga pose.'),
  identifiedPose: z.string().describe('The name of the identified yoga pose.'),
  videoUrl: z.string().describe('The public URL of the video stored in Cloud Storage.')
});
export type AnalyzeYogaPoseOutput = z.infer<typeof AnalyzeYogaPoseOutputSchema>;


// This is a new helper function to upload the video to Firebase Storage
async function uploadVideoToStorage(videoDataUri: string, userId: string): Promise<string> {
    // Pass the initialized 'app' to getStorage to ensure it works on the server
    const storage = getStorage(app);
    const videoId = uuidv4();
    // Assumes the data URI is in the format 'data:video/mp4;base64,....'
    // We extract the mime type for the storage metadata.
    const mimeType = videoDataUri.match(/data:(.*);base64,/)?.[1] || 'video/mp4';
    const storageRef = ref(storage, `user-videos/${userId}/${videoId}.${mimeType.split('/')[1]}`);
    
    // Upload the base64 string directly.
    await uploadString(storageRef, videoDataUri, 'data_url', {
        contentType: mimeType,
    });

    // Get the public URL for the uploaded file.
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
}

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


export async function analyzeYogaPose(input: AnalyzeYogaPoseInput): Promise<AnalyzeYogaPoseOutput> {
  return analyzeYogaPoseFlow(input);
}

const analyzeYogaPoseFlow = ai.defineFlow(
  {
    name: 'analyzeYogaPoseFlow',
    inputSchema: AnalyzeYogaPoseInputSchema,
    outputSchema: AnalyzeYogaPoseOutputSchema,
  },
  async (input) => {
    // Step 1: Upload video to Firebase Storage
    const videoUrl = await uploadVideoToStorage(input.videoDataUri, input.userId);
    
    // Step 2: Call the external Python service on Cloud Run
    const baseUrl = process.env.ANALYSIS_SERVICE_URL;
    if (!baseUrl) {
        throw new Error("ANALYSIS_SERVICE_URL environment variable is not set.");
    }
    
    // Construct the URL safely
    const analysisServiceUrl = new URL('/analyze-video-comprehensive/', baseUrl).toString();
    
    console.log(`Calling analysis service at: ${analysisServiceUrl} for video: ${videoUrl}`);

    // Generate an identity token to authenticate to the private Cloud Run service.
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
    
    // Step 3: Return the combined result
    return {
        ...analysisResult,
        videoUrl: videoUrl, // Add the video URL to the final output
    };
  }
);
