import { TravelPreferences } from './index';

export const SYSTEM_PROMPT = (input: TravelPreferences) => `
    Create a detailed travel itinerary for a trip to ${input.destination}.

    Details:
    - Dates: From ${input.startDate} to ${input.endDate}
    - Budget: ${input.budget}
    - Travel Style: ${input.travelStyle}
    - Interests: ${input.interests.join(', ')}
    - Group Size: ${input.groupSize}
    - Accommodation Preference: ${input.accommodation}
    - Transportation: ${input.transportation}

    The itinerary should include:
    - A header with a summary of the trip.
    - A day-by-day breakdown with specific activities for morning, afternoon, and evening.
    - Practical travel tips for ${input.destination}.

    Format the response to match the output schema.
    Provide an "htmlContent" field which is a clean HTML snippet (without <html> or <body> tags) that can be directly injected into a web page. Use Tailwind CSS-like classes if necessary or just semantic HTML.
  `;
