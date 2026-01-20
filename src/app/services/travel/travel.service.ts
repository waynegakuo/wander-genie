import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { TravelPreferences, Itinerary } from '../../models/travel.model';

@Injectable({
  providedIn: 'root',
})
export class TravelService {
  private readonly functions = inject(Functions);

  async generateItinerary(preferences: TravelPreferences): Promise<Itinerary> {
    const planTripFn = httpsCallable<TravelPreferences, Itinerary>(this.functions, 'generateItineraryFlow');
    const result = await planTripFn(preferences);
    return result.data;
  }

  async planTrip(text: string): Promise<Partial<TravelPreferences>> {
    const parseFn = httpsCallable<string, Partial<TravelPreferences>>(this.functions, 'geniePlanTripFlow');
    const result = await parseFn(text);
    return result.data;
  }

  async generateGenieItinerary(text: string, departureLocation?: string): Promise<Itinerary> {
    const genieFn = httpsCallable<{ query: string; departureLocation?: string }, Itinerary>(
      this.functions,
      'genieItineraryFlow'
    );
    const result = await genieFn({ query: text, departureLocation });
    return result.data;
  }

  /**
   * Extracts travel preferences from natural language text using pattern matching.
   *
   * @param text - The natural language query string to parse for travel preferences
   * @returns A partial TravelPreferences object containing extracted information such as
   *          destination, departure location, group size, budget, travel class, and duration
   *
   * @example
   * ```typescript
   * const prefs = extractPreferences("I want to travel from New York to Paris for 5 people on a budget");
   * // Returns: { departureLocation: "New York", destination: "Paris", groupSize: 5, budget: "budget" }
   * ```
   */
  extractPreferences(text: string): Partial<TravelPreferences> {
    const preferences: Partial<TravelPreferences> = {};

    // Destination detection
    const toMatch = text.match(/to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (toMatch) preferences.destination = toMatch[1];

    // Origin detection
    const fromMatch = text.match(/from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (fromMatch) preferences.departureLocation = fromMatch[1];

    // Passenger count
    const passengerMatch = text.match(/(\d+)\s*(?:people|passengers|adults|friends|family of (\d+))/i);
    if (passengerMatch) {
      preferences.groupSize = parseInt(passengerMatch[1] || passengerMatch[2], 10);
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
}
