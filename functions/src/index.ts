import { defineSecret } from 'firebase-functions/params';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import {onCallGenkit} from 'firebase-functions/v2/https';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from "genkit";

import { SYSTEM_PROMPT, GENIE_SYSTEM_PROMPT } from './system-prompt';

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

enableFirebaseTelemetry();

// Configure Genkit
const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
  ],
  model: googleAI.model('gemini-3-flash-preview'), // Using a stable model name
});

// Detect if the function is running in the Firebase Emulator Suite.
const isEmulated = process.env.FUNCTIONS_EMULATOR === 'true' || process.env.NODE_ENV === 'development';

// Define schemas
const TravelPreferencesSchema = z.object({
  departureLocation: z.string().describe('The departure location of the trip'),
  destination: z.string().describe('The destination of the trip'),
  startDate: z.string().describe('The start date of the trip in YYYY-MM-DD format'),
  endDate: z.string().describe('The end date of the trip in YYYY-MM-DD format'),
  budget: z.string().describe('The budget for the trip (e.g., budget, mid-range, luxury)'),
  travelStyle: z.string().describe('The preferred style of travel (e.g., adventure, relaxation, cultural)'),
  interests: z.array(z.string()).describe('A list of interests for the trip'),
  groupSize: z.number().describe('The number of people traveling'),
  accommodation: z.string().describe('The preferred type of accommodation'),
  transportation: z.string().describe('The preferred mode of transportation'),
  travelClass: z.string().describe('The travel class (e.g., economy, business, first)').optional(),
  flexibility: z.string().describe('Date flexibility').optional(),
  nlpQuery: z.string().describe('The original natural language query from the user').optional(),
});

const ItinerarySchema = z.object({
  destination: z.string().describe('The destination of the trip'),
  tripSummary: z.string().describe('A brief summary of the trip'),
  flightOptions: z.array(z.object({
    title: z.string().describe('A descriptive title for the flight option'),
    googleFlightsUrl: z.string().describe('A URL to Google Flights search results for this flight option'),
    priceKsh: z.number().describe('Estimated price in Kenyan Shillings (KShs)'),
    priceUsd: z.number().describe('Estimated price in US Dollars (USD)'),
    description: z.string().describe('A brief description of why this flight option might be good (e.g., "Fastest option", "Cheapest option")'),
  })).describe('Suggested flight search links on Google Flights').optional(),
  days: z.array(z.object({
    day: z.number().describe('The day number'),
    date: z.string().describe('The date of the day'),
    activities: z.object({
      morning: z.string().describe('Activities for the morning'),
      afternoon: z.string().describe('Activities for the afternoon'),
      evening: z.string().describe('Activities for the evening'),
    }).describe('The activities for the day'),
  })).describe('A day-by-day breakdown of the itinerary'),
  travelTips: z.array(z.string()).describe('Practical travel tips for the destination'),
  htmlContent: z.string().describe('The full itinerary formatted as a clean HTML snippet'),
});

export type TravelPreferences = z.infer<typeof TravelPreferencesSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;

export const _generateItineraryLogic = ai.defineFlow({
  name: 'generateItineraryFlow',
  inputSchema: TravelPreferencesSchema,
  outputSchema: ItinerarySchema,
},
  async (input: any) => {
    const today = new Date().toISOString().split('T')[0];
    const response = await ai.generate({
      prompt: SYSTEM_PROMPT({ ...input, today }),
      output: { schema: ItinerarySchema },
      config: {
        temperature: 0.7,
      },
    });

  if (!response.output) {
    throw new Error('No output from AI');
  }

  return response.output;
});

export const _genieItineraryLogic = ai.defineFlow({
  name: 'genieItineraryFlow',
  inputSchema: z.object({
    query: z.string(),
    departureLocation: z.string().optional(),
  }),
  outputSchema: ItinerarySchema,
},
  async (input: { query: string; departureLocation?: string; today?: string; }) => {
    const today = new Date().toISOString().split('T')[0];
    const response = await ai.generate({
      prompt: GENIE_SYSTEM_PROMPT({ ...input, today }),
      output: { schema: ItinerarySchema },
      config: {
        temperature: 0.7,
      },
    });

    if (!response.output) {
      throw new Error('No output from AI');
    }

    return response.output;
  }
);

// Export as a standard Firebase Function that uses Genkit
export const generateItineraryFlow = onCallGenkit(
  {
    secrets: [GEMINI_API_KEY],
    region: 'africa-south1', // Set your desired region
    // Allow all origins in the emulator, but restrict to your domain in production.
    cors: isEmulated
      ? true
      : [
        'http://localhost:4200',
        /^https:\/\/wandersgenie(--[a-z0-9-]+)?\.web\.app$/, // Matches live site (wandersgenie.web.app) and previews (wandersgenie--<channel>.web.app)
      ],
  },
  _generateItineraryLogic
)

export const genieItineraryFlow = onCallGenkit(
  {
    secrets: [GEMINI_API_KEY],
    region: 'africa-south1',
    // Allow all origins in the emulator, but restrict to your domain in production.
    cors: isEmulated
      ? true
      : [
        'http://localhost:4200',
        /^https:\/\/wandersgenie(--[a-z0-9-]+)?\.web\.app$/, // Matches live site (wandersgenie.web.app) and previews (wandersgenie--<channel>.web.app)
      ],
  },
  _genieItineraryLogic
)
