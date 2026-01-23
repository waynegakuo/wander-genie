import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Itinerary, WishlistItem } from '../../models/travel.model';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { AuthService } from '../../services/core/auth/auth.service';

@Component({
  selector: 'app-itinerary-results',
  imports: [CommonModule],
  templateUrl: './itinerary-results.html',
  styleUrl: './itinerary-results.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItineraryResultsComponent {
  itinerary = input.required<Itinerary | null>();
  destination = input<string | undefined>();
  searchMetadata = input<{ prompt: string; budget: string; passengers: number }>();

  printItinerary = output<void>();
  saveToWishlist = output<void>();

  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);

  isSaving = signal(false);

  isSaved() {
    const itinerary = this.itinerary();
    if (!itinerary) return false;
    return this.wishlistService.isSaved(itinerary.destination, itinerary.tripSummary);
  }

  async onToggleWishlist() {
    if (!this.authService.isAuthenticated()) {
      // Trigger login or show message
      alert('Please sign in to save to your wishlist');
      return;
    }

    const itinerary = this.itinerary();
    if (!itinerary) return;

    this.isSaving.set(true);
    try {
      const wishlistItem: Omit<WishlistItem, 'id' | 'createdAt'> = {
        userId: '', // Will be set by service
        destination: itinerary.destination,
        itineraryTitle: itinerary.tripSummary,
        flightData: {
          price: itinerary.flightOptions?.[0]?.price || 'N/A',
          airline: itinerary.flightOptions?.[0]?.title || 'Multiple Airlines',
          departureDate: itinerary.days[0]?.date || '',
          returnDate: itinerary.days[itinerary.days.length - 1]?.date || '',
          googleFlightsUrl: itinerary.flightOptions?.[0]?.googleFlightsUrl,
        },
        itinerary: itinerary,
        searchMetadata: this.searchMetadata() || {
          prompt: '',
          budget: 'mid-range',
          passengers: 1,
        },
        imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(itinerary.destination)}`, // Fallback image logic
      };

      await this.wishlistService.toggleWishlist(wishlistItem);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
