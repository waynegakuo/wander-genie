import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { TravelPreferences, Itinerary } from '../../models/travel.model';

@Injectable({
  providedIn: 'root',
})
export class TravelService {
  private readonly functions = inject(Functions);

  async planTrip(preferences: TravelPreferences): Promise<Itinerary> {
    const planTripFn = httpsCallable<TravelPreferences, Itinerary>(this.functions, 'planTripFlow');
    const result = await planTripFn(preferences);
    return result.data;
  }
}
