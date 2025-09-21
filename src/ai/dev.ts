
import { config } from 'dotenv';
config();

// The analyze-yoga-pose flow is no longer used, so we can remove the import.
// import '@/ai/flows/analyze-yoga-pose.ts';
import '@/ai/flows/summarize-feedback.ts';
