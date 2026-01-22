import { TravelPreferences } from './index';

export const SYSTEM_PROMPT = (input: TravelPreferences & { today?: string }) => `
    Create a detailed travel itinerary for a trip from ${input.departureLocation} to ${input.destination}.

    Details:
    - Departure: ${input.departureLocation}
    - Destination: ${input.destination}
    - Dates: From ${input.startDate} to ${input.endDate}
    - Budget: ${input.budget}
    - Travel Style: ${input.travelStyle}
    - Interests: ${input.interests.join(', ')}
    - GroupSize: ${input.groupSize}
    - Accommodation Preference: ${input.accommodation}
    - Transportation: ${input.transportation}
    ${input.travelClass ? `- Travel Class: ${input.travelClass}` : ''}
    ${input.flexibility ? `- Date Flexibility: ${input.flexibility}` : ''}
    ${input.nlpQuery ? `- User's Natural Language Request: "${input.nlpQuery}"` : ''}
    - Reference Date: ${input.today || new Date().toISOString().split('T')[0]}

    IMPORTANT: If there is a "User's Natural Language Request" provided, use it to refine the itinerary details while respecting the specific filters provided above. The natural query might contain specific destination requests, activities, or constraints not captured in the structured filters.

    The itinerary should include:
    - The "destination" field: Use "${input.destination}".
    - A header with a summary of the trip.
    - Suggested flight options with direct links to Google Flights search results.
      Use the format: https://www.google.com/travel/flights?q=Flights%20to%20[Destination]%20from%20[Departure]%20on%20[Date]%20through%20[ReturnDate]
      Make sure to provide at least 2-3 logical flight search options (e.g., best, cheapest, fastest).
    - A beautified "User Journey" visualization including:
      - Flight details (outbound and return).
      - Accommodation/Hotel recommendations if applicable.
      - A day-by-day timeline of the trip.
    - High-quality images for the destination and major locations/activities mentioned.
      Use: <img src="https://tse3.mm.bing.net/th?q=[LocationName]%20travel%20landmark%2025&w=600&h=300&c=7&rs=1" alt="[LocationName]">
    - Practical travel tips for ${input.destination}.

    Format the response to match the output schema.
    Provide an "htmlContent" field which is a clean HTML snippet (without <html> or <body> tags) that can be directly injected into a web page.
    Design the "htmlContent" to look like a modern, vertical timeline "User Journey":
    - Use a 'journey-timeline' class container for the main sequence.
    - Each major step (Flight, Hotel, Day) should be a 'journey-step' class.
    - Use EXACTLY ONE unique emoji per stage (e.g., ✈️ for flights, 🏨 for hotels, 🗓️ for days). DO NOT repeat the same emoji twice in a row or within the same section.
    - Ensure the timeline is well-structured:
        1. Trip Summary (Header)
        2. Flight Search Options (with links)
        3. Day-by-Day Journey (with images)
        4. Travel Tips
    - Include large, beautiful images for each day or major city using the provided img tag format.
    - Make it visually engaging with cards, borders, and spacing.
    - Use 'flight-card' and 'hotel-card' classes for those specific details.
    - Use <h3> for Day titles, <h4> for activity titles.
  `;

export const GENIE_SYSTEM_PROMPT = (input: { query: string; departureLocation?: string; today?: string }) => `
    You are an expert travel planner. A user has provided a natural language request for a trip: "${input.query}".
    ${input.departureLocation ? `The user is departing from: "${input.departureLocation}".` : ''}

    Your task is to:
    1. Parse the key details from the request (Departure, Destination, Dates, Budget, etc.).
    2. Create a detailed travel itinerary based on these details.

    IMPORTANT:
    - Be careful to distinguish between the departure city (where they are coming from) and the destination (where they want to go).
    - If the user provided a "departing from" location separately, prioritize it, but also check if they mention a different origin in their natural language query.
    - If any critical details are missing (like departure city or specific dates), make reasonable assumptions based on today's date (${input.today || new Date().toISOString().split('T')[0]}) and provide a comprehensive plan.

    The itinerary MUST include:
    - The "destination" field: The name of the primary destination city or region.
    - A header with a summary of the trip.
    - Suggested flight options with direct links to Google Flights search results.
      Use the format: https://www.google.com/travel/flights?q=Flights%20to%20[Destination]%20from%20[Departure]%20on%20[Date]%20through%20[ReturnDate]
      Even if the user didn't specify a departure, assume a major hub or clearly state you've used a placeholder.
      Make sure to provide at least 2-3 logical flight search options (e.g., best, cheapest, fastest).
    - A beautified "User Journey" visualization including:
      - Flight details (outbound and return).
      - Accommodation/Hotel recommendations if applicable.
      - A day-by-day timeline of the trip.
    - High-quality images for the destination and major locations/activities mentioned.
      Use: <img src="https://tse3.mm.bing.net/th?q=[LocationName]%20travel%20landmark%202024%202025&w=600&h=300&c=7&rs=1" alt="[LocationName]">
    - Practical travel tips for the destination.

    Format the response to match the output schema.
    Provide an "htmlContent" field which is a clean HTML snippet (without <html> or <body> tags) that can be directly injected into a web page.
    Design the "htmlContent" to look like a modern, vertical timeline "User Journey":
    - Use a 'journey-timeline' class container for the main sequence.
    - Each major step (Flight, Hotel, Day) should be a 'journey-step' class.
    - Use EXACTLY ONE unique emoji per stage (e.g., ✈️ for flights, 🏨 for hotels, 🗓️ for days). DO NOT repeat the same emoji twice in a row or within the same section.
    - Ensure the timeline is well-structured:
        1. Trip Summary (Header)
        2. Flight Search Options (with links)
        3. Day-by-Day Journey (with images)
        4. Travel Tips
    - Include large, beautiful images for each day or major city using the provided img tag format.
    - Make it visually engaging with cards, borders, and spacing.
    - Use 'flight-card' and 'hotel-card' classes for those specific details.
    - Use <h3> for Day titles, <h4> for activity titles.
`;
