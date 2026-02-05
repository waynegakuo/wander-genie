import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Itinerary, WishlistItem } from '../../models/travel.model';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { AuthService } from '../../services/core/auth/auth.service';
import { ToastService } from '../../services/core/toast/toast.service';

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
  searchMetadata = input<{ prompt: string; budget: string; passengers: number | string }>();

  printItinerary = output<void>();
  saveToWishlist = output<void>();

  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isSaving = signal(false);

  isSaved() {
    const itinerary = this.itinerary();
    if (!itinerary) return false;
    return this.wishlistService.isSaved(itinerary.destination, itinerary.tripSummary);
  }

  async onToggleWishlist() {
    if (!this.authService.isAuthenticated()) {
      this.toastService.warning('Please sign in to save to your wishlist');
      return;
    }

    const itinerary = this.itinerary();
    if (!itinerary) return;

    this.isSaving.set(true);
    try {
      const firstFlight = itinerary.flightOptions?.[0];
      const priceDisplay = firstFlight?.priceKsh
        ? `KSh ${firstFlight.priceKsh.toLocaleString()} ($${firstFlight.priceUsd})`
        : (firstFlight?.price || 'N/A');

      const wishlistItem: Omit<WishlistItem, 'id' | 'createdAt'> = {
        userId: '', // Will be set by service
        destination: itinerary.destination,
        itineraryTitle: itinerary.tripSummary,
        flightData: {
          price: priceDisplay,
          airline: firstFlight?.title || 'Multiple Airlines',
          departureDate: itinerary.days[0]?.date || '',
          returnDate: itinerary.days[itinerary.days.length - 1]?.date || '',
          googleFlightsUrl: firstFlight?.googleFlightsUrl,
        },
        itinerary: itinerary,
        searchMetadata: this.searchMetadata() || {
          prompt: '',
          budget: 'mid-range',
          passengers: 1,
        },
        imageUrl: `https://tse3.mm.bing.net/th?q=${encodeURIComponent(itinerary.destination)}%20travel%20landmark%2025&w=600&h=300&c=7&rs=1`, // Fallback image logic
      };

      await this.wishlistService.toggleWishlist(wishlistItem);
      this.toastService.success(this.isSaved() ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      this.toastService.error('Failed to update wishlist');
    } finally {
      this.isSaving.set(false);
    }
  }
}
