import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { TravelPreferences, Itinerary } from '../../models/travel.model';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { extractPreferences } from '../../utils/utility-methods';

@Injectable({
  providedIn: 'root',
})
export class TravelService {
  private readonly functions = inject(Functions);
  private fireAnalytics = inject(Analytics);

  async generateItinerary(preferences: TravelPreferences): Promise<Itinerary> {
    logEvent(this.fireAnalytics, 'generate_itinerary', {
      destination: preferences.destination,
      budget: preferences.budget,
      travel_class: preferences.travelClass,
      group_size: preferences.groupSize,
    });

    try {
      const planTripFn = httpsCallable<TravelPreferences, Itinerary>(this.functions, 'generateItineraryFlow');
      const result = await planTripFn(preferences);

      logEvent(this.fireAnalytics, 'itinerary_generated_success', {
        destination: result.data.destination,
      });

      return result.data;
    } catch (error: any) {
      logEvent(this.fireAnalytics, 'itinerary_generated_error', {
        error: error.message || 'Unknown error',
      });
      throw error;
    }
  }

  async generateGenieItinerary(text: string, preferences?: Partial<TravelPreferences>): Promise<Itinerary> {
    logEvent(this.fireAnalytics, 'generate_genie_itinerary', {
      query_length: text.length,
      has_departure: !!preferences?.departureLocation,
    });

    try {
      const genieFn = httpsCallable<{ query: string; preferences?: Partial<TravelPreferences> }, Itinerary>(
        this.functions,
        'genieItineraryFlow'
      );
      const result = await genieFn({ query: text, preferences });

      logEvent(this.fireAnalytics, 'itinerary_generated_success', {
        destination: result.data.destination,
        flow: 'genie',
      });

      return result.data;
    } catch (error: any) {
      logEvent(this.fireAnalytics, 'itinerary_generated_error', {
        error: error.message || 'Unknown error',
        flow: 'genie',
      });
      throw error;
    }
  }

  logPrintItinerary(destination?: string): void {
    logEvent(this.fireAnalytics, 'print_itinerary', { destination });
  }

  logResetForm(): void {
    logEvent(this.fireAnalytics, 'reset_form');
  }

  logTabChange(tab: 'genie' | 'deep'): void {
    logEvent(this.fireAnalytics, 'tab_change', { tab });
  }

  logSelectSuggestion(suggestion: string): void {
    logEvent(this.fireAnalytics, 'select_suggestion', { suggestion });
  }

  logEvent(eventName: string, params?: { [key: string]: any }): void {
    logEvent(this.fireAnalytics, eventName, params);
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
    return extractPreferences(text);
  }
}
