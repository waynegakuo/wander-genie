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

  // Helper: Convert all price patterns within a given text to the selected currency (single display value)
  private convertTextPrices(text: string): string {
    if (!text) return text;

    const selectedCurrency = this.currencyService.selectedCurrency();

    // 1) Collapse comparison forms like "$1,000 / KSh 130,000" or "$1,000 or KSh 130,000" into a single converted value
    const comparisonRegex = /((?:KShs?|KES|USD|\$|€|EUR|£|GBP)\s*[\d,]+)\s*(?:\/|or)\s*((?:KShs?|KES|USD|\$|€|EUR|£|GBP)\s*[\d,]+)/gi;
    const collapseComparison = (segment: string) => {
      return segment.replace(comparisonRegex, (match, left, right) => {
        const pickBase = (part: string): { amount: number | null; currency: string | null } => {
          const mUsd = part.match(/(?:USD|\$)\s*([\d,]+)/i);
          const mKes = part.match(/(?:KShs?|KES)\s*([\d,]+)/i);
          const mEur = part.match(/(?:EUR|€)\s*([\d,]+)/i);
          const mGbp = part.match(/(?:GBP|£)\s*([\d,]+)/i);
          if (mUsd) return { amount: parseFloat(mUsd[1].replace(/,/g, '')), currency: 'USD' };
          if (mKes) return { amount: parseFloat(mKes[1].replace(/,/g, '')), currency: 'KES' };
          if (mEur) return { amount: parseFloat(mEur[1].replace(/,/g, '')), currency: 'EUR' };
          if (mGbp) return { amount: parseFloat(mGbp[1].replace(/,/g, '')), currency: 'GBP' };
          const mNum = part.match(/[\d,]+/);
          return { amount: mNum ? parseFloat(mNum[0].replace(/,/g, '')) : null, currency: null };
        };

        const leftBase = pickBase(left);
        const rightBase = pickBase(right);

        // Prefer USD if present, otherwise KES, then fallback to the first side with a number
        const base = leftBase.currency === 'USD' || rightBase.currency === 'USD'
          ? (leftBase.currency === 'USD' ? leftBase : rightBase)
          : (leftBase.currency === 'KES' || rightBase.currency === 'KES'
              ? (leftBase.currency === 'KES' ? leftBase : rightBase)
              : (leftBase.amount != null ? leftBase : rightBase));

        if (base.amount != null) {
          const converted = this.currencyService.convert(base.amount, base.currency || 'USD', selectedCurrency);
          return this.currencyService.formatAmount(converted, selectedCurrency);
        }
        return match;
      });
    };

    let output = collapseComparison(text);

    // 2) Replace single or parenthesized comparison like "KSh 130,000 ($1,000)" with a single converted value
    const priceRegex = /(?:KShs?|KES|USD|\$|€|EUR|£|GBP)\s*[\d,]+(?:\s*\(\s*(?:KShs?|KES|USD|\$|€|EUR|£|GBP)\s*[\d,]+\s*\))?/gi;

    output = output.replace(priceRegex, (match) => {
      // Extract preferred base in priority: USD, then KES, then EUR/GBP, else first number
      const pickBase = (segment: string): { amount: number | null; currency: string } => {
        const mUsd = segment.match(/(?:USD|\$)\s*([\d,]+)/i);
        const mKes = segment.match(/(?:KShs?|KES)\s*([\d,]+)/i);
        const mEur = segment.match(/(?:EUR|€)\s*([\d,]+)/i);
        const mGbp = segment.match(/(?:GBP|£)\s*([\d,]+)/i);
        if (mUsd) return { amount: parseFloat(mUsd[1].replace(/,/g, '')), currency: 'USD' };
        if (mKes) return { amount: parseFloat(mKes[1].replace(/,/g, '')), currency: 'KES' };
        if (mEur) return { amount: parseFloat(mEur[1].replace(/,/g, '')), currency: 'EUR' };
        if (mGbp) return { amount: parseFloat(mGbp[1].replace(/,/g, '')), currency: 'GBP' };
        const mNum = segment.match(/[\d,]+/);
        return { amount: mNum ? parseFloat(mNum[0].replace(/,/g, '')) : null, currency: 'USD' };
      };

      const base = pickBase(match);
      if (base.amount !== null) {
        const converted = this.currencyService.convert(base.amount, base.currency, selectedCurrency);
        return this.currencyService.formatAmount(converted, selectedCurrency);
      }

      return match;
    });

    return output;
  }

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
        convertedTitle: this.convertTextPrices(flight.title),
        convertedDescription: this.convertTextPrices(flight.description),
      };
    });
  });

  /**
   * Computed signal that updates prices in the HTML content based on selected currency
   */
  displayHtmlContent = computed(() => {
    const html = this.itinerary()?.htmlContent;
    if (!html) return '';

    return this.convertTextPrices(html);
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
      const flights = this.flightsWithConvertedPrices();
      const firstFlight = flights?.[0];

      let priceDisplay = 'Price not available';
      if (firstFlight?.convertedPrice) {
        priceDisplay = this.currencyService.formatAmount(
          firstFlight.convertedPrice,
          firstFlight.convertedCurrency
        );
      }

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

    if (this.isCurrencyMenuOpen()) {
      // Find the index of the selected currency
      const currentIndex = this.currencyService.SUPPORTED_CURRENCIES.findIndex(
        (c) => c.code === this.currencyService.selectedCurrency()
      );

      if (currentIndex !== -1) {
        // Use a small timeout to ensure the DOM is updated (the menu is rendered)
        setTimeout(() => {
          const dropdown = document.querySelector('.currency-dropdown');
          const options = dropdown?.querySelectorAll('.currency-option');
          if (options && options[currentIndex]) {
            options[currentIndex].scrollIntoView({ block: 'nearest', behavior: 'instant' });
          }
        }, 0);
      }
    }
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
