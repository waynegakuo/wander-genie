import { TravelPreferences } from '../models/travel.model';

/**
 * Extracts travel preferences from natural language text using pattern matching.
 *
 * @param text - The natural language query string to parse for travel preferences
 * @returns A partial TravelPreferences object containing extracted information such as
 *          destination, departure location, group size, budget, travel class, and duration
 */
export function extractPreferences(text: string): Partial<TravelPreferences> {
  const preferences: Partial<TravelPreferences> = {};

  // Destination detection
  const toMatch = text.match(/to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (toMatch) preferences.destination = toMatch[1];

  // Origin detection
  const fromMatch = text.match(/from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (fromMatch) preferences.departureLocation = fromMatch[1];

  // Passenger count (digits or words)
  // We use a simplified regex that captures either digits or words followed by keywords
  // This allows the AI to handle the actual parsing of the groupSize string later
  const numPattern = `\\d+|(?:[a-zA-Z]+(?:[\\s-][a-zA-Z]+)*)`;

  const passengerMatch = text.match(
    new RegExp(
      `(?:\\b(${numPattern})\\b\\s*(?:people|passengers|adults|friends|travelers)|family of\\s*(${numPattern}))`,
      'i'
    )
  );

  if (passengerMatch) {
    const rawVal = passengerMatch[1] || passengerMatch[2];

    if (rawVal) {
      if (/^\d+$/.test(rawVal)) {
        preferences.groupSize = parseInt(rawVal, 10);
      } else {
        // Keep it as a string (e.g., "five", "twenty five")
        preferences.groupSize = rawVal.trim();
      }
    }
  }

  // Budget detection
  if (text.toLowerCase().includes('budget')) preferences.budget = 'budget';
  if (text.toLowerCase().includes('luxury')) preferences.budget = 'luxury';

  // Travel Class
  if (text.toLowerCase().includes('business')) preferences.travelClass = 'business';
  if (text.toLowerCase().includes('first class')) preferences.travelClass = 'first';
  if (text.toLowerCase().includes('economy')) preferences.travelClass = 'economy';

  // Duration / Dates (simple extraction)
  const dayMatch = text.match(/(\d+)\s*days/i);
  if (dayMatch) {
    // Logic could be added to set start/end dates if a month is mentioned
  }

  return preferences;
}
