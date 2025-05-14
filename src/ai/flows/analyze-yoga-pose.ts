// 'use server'
'use server';

/**
 * @fileOverview Analyzes a video of a user performing a yoga pose and provides feedback.
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
});
export type AnalyzeYogaPoseOutput = z.infer<typeof AnalyzeYogaPoseOutputSchema>;

export async function analyzeYogaPose(input: AnalyzeYogaPoseInput): Promise<AnalyzeYogaPoseOutput> {
  return analyzeYogaPoseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeYogaPosePrompt',
  input: {schema: AnalyzeYogaPoseInputSchema},
  output: {schema: AnalyzeYogaPoseOutputSchema},
  prompt: `You are an expert yoga instructor. Analyze the user's yoga pose in the provided video and provide feedback on their form, including specific areas for improvement.

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
    return output!;
  }
);
