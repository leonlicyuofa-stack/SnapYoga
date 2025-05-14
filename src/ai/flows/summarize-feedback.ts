'use server';

/**
 * @fileOverview Summarizes user feedback on yoga suggestions to track progress and identify areas for improvement.
 *
 * - summarizeFeedback - A function that summarizes the feedback.
 * - SummarizeFeedbackInput - The input type for the summarizeFeedback function.
 * - SummarizeFeedbackOutput - The return type for the summarizeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFeedbackInputSchema = z.object({
  feedback: z
    .string()
    .describe('The user feedback provided on previous yoga suggestions.'),
});
export type SummarizeFeedbackInput = z.infer<typeof SummarizeFeedbackInputSchema>;

const SummarizeFeedbackOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the user feedback, highlighting progress and areas for consistent improvement.'
    ),
});
export type SummarizeFeedbackOutput = z.infer<typeof SummarizeFeedbackOutputSchema>;

export async function summarizeFeedback(input: SummarizeFeedbackInput): Promise<SummarizeFeedbackOutput> {
  return summarizeFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFeedbackPrompt',
  input: {schema: SummarizeFeedbackInputSchema},
  output: {schema: SummarizeFeedbackOutputSchema},
  prompt: `You are an AI assistant that summarizes user feedback on yoga suggestions.

  Summarize the following feedback, highlighting progress and areas for consistent improvement:

  Feedback: {{{feedback}}}
  `,
});

const summarizeFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackFlow',
    inputSchema: SummarizeFeedbackInputSchema,
    outputSchema: SummarizeFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
