import {defineSecret} from 'firebase-functions/params';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase'; // <-- NEW IMPORT
import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from "genkit";

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

enableFirebaseTelemetry();

// Configure Genkit
const ai = genkit({
  plugins: [
    googleAI({apiKey: process.env.GEMINI_API_KEY }),
  ],
  model: googleAI.model('gemini-3-flash-preview'), // Specify your Gemini model
});
