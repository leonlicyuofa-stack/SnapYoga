'use server';

/**
 * @fileOverview AI flow to analyze and categorize monthly journal reflections into themes.
 *
 * - analyzeReflectionThemes - Extracts recurring themes and keywords from user reflections.
 * - ReflectionThemesInput - Array of reflection strings.
 * - ReflectionThemesOutput - Structured theme groups with colors and keyword counts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReflectionThemesInputSchema = z.object({
  reflections: z.array(z.string()).describe('An array of reflection text strings from the user journal.'),
});
export type ReflectionThemesInput = z.infer<typeof ReflectionThemesInputSchema>;

const ThemeGroupSchema = z.object({
  theme: z.string().describe('The name of the theme (e.g., Gratitude, Stress, Growth, Calm).'),
  color: z.string().describe('The CSS rgba color string assigned to this theme.'),
  keywords: z.array(z.object({
    word: z.string().describe('The keyword found in reflections.'),
    count: z.number().describe('Approximate frequency of this concept.'),
  })),
});

const ReflectionThemesOutputSchema = z.object({
  themes: z.array(ThemeGroupSchema),
});
export type ReflectionThemesOutput = z.infer<typeof ReflectionThemesOutputSchema>;

export async function analyzeReflectionThemes(input: ReflectionThemesInput): Promise<ReflectionThemesOutput> {
  return analyzeReflectionThemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReflectionThemesPrompt',
  input: {schema: ReflectionThemesInputSchema},
  output: {schema: ReflectionThemesOutputSchema},
  prompt: `You are an empathetic mindfulness assistant. Analyze the following journal reflections and group them into 3-5 recurring themes.

  Reflections:
  {{#each reflections}}
  - {{{this}}}
  {{/each}}

  Instructions:
  1. Identify recurring topics and group them into named themes such as "Gratitude", "Stress", "Growth", "Calm", or "Focus".
  2. For each theme, provide the top 3-5 keywords associated with it and an approximate count of how often that concept appeared.
  3. Assign colors based on these rules:
     - Gratitude: rgba(160,195,130,0.85)
     - Stress: rgba(200,140,90,0.85)
     - Growth: rgba(167,139,200,0.85)
     - Calm: rgba(100,160,200,0.85)
     - Any other theme: rgba(193,154,107,0.85)

  Return the result as a structured JSON object.`,
});

const analyzeReflectionThemesFlow = ai.defineFlow(
  {
    name: 'analyzeReflectionThemesFlow',
    inputSchema: ReflectionThemesInputSchema,
    outputSchema: ReflectionThemesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
