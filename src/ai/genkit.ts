import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * Genkit configuration for SnapYoga.
 * We include the googleAI plugin to enable text analysis and summarization features.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});
