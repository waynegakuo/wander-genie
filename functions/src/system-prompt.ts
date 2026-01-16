import { TravelPreferences } from './index';

export const SYSTEM_PROMPT = (input: TravelPreferences) => `
    Create a detailed travel itinerary for a trip from ${input.departureLocation} to ${input.destination}.

    Details:
    - Departure: ${input.departureLocation}
    - Destination: ${input.destination}
    - Dates: From ${input.startDate} to ${input.endDate}
    - Budget: ${input.budget}
    - Travel Style: ${input.travelStyle}
    - Interests: ${input.interests.join(', ')}
    - Group Size: ${input.groupSize}
    - Accommodation Preference: ${input.accommodation}
    - Transportation: ${input.transportation}

    The itinerary should include:
    - A header with a summary of the trip.
    - Suggested flight options with direct links to Google Flights search results.
      Use the format: https://www.google.com/travel/flights?q=Flights%20to%20[Destination]%20from%20[Departure]%20on%20[Date]%20through%20[ReturnDate]
      Make sure to provide at least 2-3 logical flight search options (e.g., best, cheapest, fastest).
    - A day-by-day breakdown with specific activities for morning, afternoon, and evening.
    - Practical travel tips for ${input.destination}.

    Format the response to match the output schema.
    Provide an "htmlContent" field which is a clean HTML snippet (without <html> or <body> tags) that can be directly injected into a web page. Use Tailwind CSS-like classes if necessary or just semantic HTML.
  `;
