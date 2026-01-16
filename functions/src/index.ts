import { defineSecret } from 'firebase-functions/params';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import {onCallGenkit} from 'firebase-functions/v2/https';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from "genkit";

import { SYSTEM_PROMPT } from './system-prompt';

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

enableFirebaseTelemetry();

// Configure Genkit
const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
  ],
  model: googleAI.model('gemini-3-flash-preview'), // Using a stable model name
});

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
});

const ItinerarySchema = z.object({
  tripSummary: z.string().describe('A brief summary of the trip'),
  flightOptions: z.array(z.object({
    title: z.string().describe('A descriptive title for the flight option'),
    googleFlightsUrl: z.string().describe('A URL to Google Flights search results for this flight option'),
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

export const _planTripFlowLogic = ai.defineFlow({
  name: 'planTripFlow',
  inputSchema: TravelPreferencesSchema,
  outputSchema: ItinerarySchema,
},
  async (input) => {
  const response = await ai.generate({
    prompt: SYSTEM_PROMPT(input),
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

// Export as a standard Firebase Function that uses Genkit
export const planTripFlow = onCallGenkit(
  {
    secrets: [GEMINI_API_KEY],
    region: 'africa-south1', // Set your desired region
    cors: true
  },
  _planTripFlowLogic
)
