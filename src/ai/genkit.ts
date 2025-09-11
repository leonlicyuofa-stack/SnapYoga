import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// By removing the googleAI plugin and default model, we prevent Genkit
// from requiring an API key on startup, which was causing the error.
// The analyzeYogaPose flow will continue to work as it calls an
// external service directly and does not depend on this configuration.
export const ai = genkit({
  plugins: [],
});
