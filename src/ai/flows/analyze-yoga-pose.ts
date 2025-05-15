'use server';

/**
 * @fileOverview Analyzes a video of a user performing a yoga pose and provides feedback, including a score.
 *
 * - analyzeYogaPose - A function that handles the yoga pose analysis process.
 * - AnalyzeYogaPoseInput - The input type for the analyzeYogaPose function.
 * - AnalyzeYogaPoseOutput - The return type for the analyzeYogaPose function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeYogaPoseInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of the user performing a yoga pose, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeYogaPoseInput = z.infer<typeof AnalyzeYogaPoseInputSchema>;

const AnalyzeYogaPoseOutputSchema = z.object({
  feedback: z.string().describe('Feedback on the user\'s yoga pose, including areas for improvement.'),
  score: z.number().min(0).max(100).describe('A score from 0 to 100 representing the quality of the yoga pose.'),
});
export type AnalyzeYogaPoseOutput = z.infer<typeof AnalyzeYogaPoseOutputSchema>;

export async function analyzeYogaPose(input: AnalyzeYogaPoseInput): Promise<AnalyzeYogaPoseOutput> {
  return analyzeYogaPoseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeYogaPosePrompt',
  input: {schema: AnalyzeYogaPoseInputSchema},
  output: {schema: AnalyzeYogaPoseOutputSchema},
  prompt: `You are an expert yoga instructor. Analyze the user's yoga pose in the provided video.
Provide feedback on their form, including specific areas for improvement.
Also, provide a score from 0 to 100 representing the quality of the yoga pose, where 100 is a perfect pose.

Video: {{media url=videoDataUri}}`,
});

const analyzeYogaPoseFlow = ai.defineFlow(
  {
    name: 'analyzeYogaPoseFlow',
    inputSchema: AnalyzeYogaPoseInputSchema,
    outputSchema: AnalyzeYogaPoseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      // Handle cases where the AI might not return the expected output structure
      // or if there's an error in the generation process.
      // Returning a default/error structure.
      console.error("AI did not return the expected output structure for analyzeYogaPoseFlow");
      return {
        feedback: "Analysis could not be completed. The AI did not return structured output.",
        score: 0, // Default score
      };
    }
    // Ensure score is within range, although Zod schema should handle this at output validation
    if (typeof output.score !== 'number' || output.score < 0 || output.score > 100) {
        console.warn(`AI returned an invalid score: ${output.score}. Clamping to 0-100 range.`);
        output.score = Math.max(0, Math.min(100, Number(output.score) || 0));
    }

    return output;
  }
);
