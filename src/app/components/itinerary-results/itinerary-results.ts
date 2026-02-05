import { ChangeDetectionStrategy, Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Itinerary, WishlistItem } from '../../models/travel.model';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { AuthService } from '../../services/core/auth/auth.service';
import { ToastService } from '../../services/core/toast/toast.service';
import { CurrencyService } from '../../services/currency/currency.service';

@Component({
  selector: 'app-itinerary-results',
  imports: [CommonModule],
  templateUrl: './itinerary-results.html',
  styleUrl: './itinerary-results.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
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
  currencyService = inject(CurrencyService);

  isSaving = signal(false);
  isCurrencyMenuOpen = signal(false);

  // Computed signal for flights with converted prices
  flightsWithConvertedPrices = computed(() => {
    const itinerary = this.itinerary();
    const selectedCurrency = this.currencyService.selectedCurrency();

    if (!itinerary?.flightOptions) {
      return [];
    }

    return itinerary.flightOptions.map((flight) => {
      // Determine base currency and price
      let baseCurrency = flight.baseCurrency || 'USD';
      let basePrice = flight.basePrice;

      // Fallback: extract from existing fields if basePrice not set
      if (!basePrice) {
        if (flight.priceUsd) {
          baseCurrency = 'USD';
          basePrice = flight.priceUsd;
        } else if (flight.priceKsh) {
          baseCurrency = 'KES';
          basePrice = flight.priceKsh;
        }
      }

      // Convert to selected currency
      const convertedPrice = basePrice
        ? this.currencyService.convert(basePrice, baseCurrency, selectedCurrency)
        : null;

      return {
        ...flight,
        convertedPrice,
        convertedCurrency: selectedCurrency,
      };
    });
  });

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

  protected readonly HTMLSelectElement = HTMLSelectElement;

  toggleCurrencyMenu() {
    this.isCurrencyMenuOpen.update((v) => !v);
  }

  selectCurrency(code: string, closeMenu = true) {
    this.currencyService.setSelectedCurrency(code);
    if (closeMenu) {
      this.isCurrencyMenuOpen.set(false);
    }
  }

  getCurrencySymbol(code: string): string {
    return this.currencyService.SUPPORTED_CURRENCIES.find((c) => c.code === code)?.symbol || '';
  }

  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-container')) {
      this.isCurrencyMenuOpen.set(false);
    }
  }

  onKeydown(event: KeyboardEvent) {
    const isCharacterKey = event.key.length === 1 && /^[a-zA-Z]$/.test(event.key);
    if (!this.isCurrencyMenuOpen() && event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && !isCharacterKey) {
      return;
    }

    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-container')) {
      return;
    }

    if (event.key === 'Escape') {
      this.isCurrencyMenuOpen.set(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isCurrencyMenuOpen()) {
        this.isCurrencyMenuOpen.set(true);
        return;
      }
      this.navigateOptions(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.isCurrencyMenuOpen()) {
        this.isCurrencyMenuOpen.set(true);
      } else {
        this.isCurrencyMenuOpen.set(false);
      }
      return;
    }

    // Handle character input for searching
    if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
      const char = event.key.toUpperCase();
      const currentIndex = this.currencyService.SUPPORTED_CURRENCIES.findIndex(
        (c) => c.code === this.currencyService.selectedCurrency()
      );

      // Find all matches
      const matches = this.currencyService.SUPPORTED_CURRENCIES.map((c, i) => ({ code: c.code, index: i }))
        .filter(c => c.code.startsWith(char));

      if (matches.length > 0) {
        // Find the next match after the current index
        let nextMatch = matches.find(m => m.index > currentIndex);
        // If no more matches after current, wrap around to the first match
        if (!nextMatch) {
          nextMatch = matches[0];
        }

        const index = nextMatch.index;

        if (!this.isCurrencyMenuOpen()) {
          this.isCurrencyMenuOpen.set(true);
        }

        this.selectCurrency(this.currencyService.SUPPORTED_CURRENCIES[index].code, false);

        // Use a small timeout to ensure the DOM is updated
        setTimeout(() => {
          const dropdown = document.querySelector('.currency-dropdown');
          const options = dropdown?.querySelectorAll('.currency-option');
          if (options && options[index]) {
            options[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }, 0);
      }
    }
  }

  private navigateOptions(direction: number) {
    const currentIndex = this.currencyService.SUPPORTED_CURRENCIES.findIndex(
      (c) => c.code === this.currencyService.selectedCurrency()
    );
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= this.currencyService.SUPPORTED_CURRENCIES.length) {
      nextIndex = this.currencyService.SUPPORTED_CURRENCIES.length - 1;
    }

    if (nextIndex !== currentIndex) {
      this.selectCurrency(this.currencyService.SUPPORTED_CURRENCIES[nextIndex].code, false);

      // Scroll into view
      setTimeout(() => {
        const dropdown = document.querySelector('.currency-dropdown');
        const options = dropdown?.querySelectorAll('.currency-option');
        if (options && options[nextIndex]) {
          options[nextIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, 0);
    }
  }
}
