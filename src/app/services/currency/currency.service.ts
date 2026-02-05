import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {CURRENCIES, FALLBACK_RATES, CurrencyInfo, ExchangeRatesResponse} from '../../models/currency.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // All available currencies imported from utils
  readonly SUPPORTED_CURRENCIES: CurrencyInfo[] = CURRENCIES;

  private readonly API_BASE = 'https://open.er-api.com/v6/latest';
  private readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly STORAGE_KEY = 'wg_exchange_rates';
  private readonly STORAGE_TIMESTAMP_KEY = 'wg_exchange_rates_timestamp';
  private readonly SELECTED_CURRENCY_KEY = 'wg_selected_currency';

  // Signals
  private exchangeRates = signal<Map<string, number>>(new Map());
  private baseCurrency = signal<string>('USD');
  selectedCurrency = signal<string>(this.loadSelectedCurrency());
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed
  selectedCurrencyInfo = computed(() => {
    const code = this.selectedCurrency();
    return this.SUPPORTED_CURRENCIES.find((c) => c.code === code) || this.SUPPORTED_CURRENCIES[0];
  });

  constructor() {
    this.initializeRates();
  }

  /**
   * Initialize exchange rates from cache or API
   */
  private async initializeRates(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const cachedRates = this.loadFromCache();
    if (cachedRates) {
      this.exchangeRates.set(cachedRates);
      return;
    }

    await this.fetchRates();
  }

  /**
   * Load selected currency from localStorage
   */
  private loadSelectedCurrency(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return 'USD';
    }

    try {
      return localStorage.getItem(this.SELECTED_CURRENCY_KEY) || 'USD';
    } catch {
      return 'USD';
    }
  }

  /**
   * Save selected currency to localStorage
   */
  setSelectedCurrency(code: string): void {
    this.selectedCurrency.set(code);

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.SELECTED_CURRENCY_KEY, code);
      } catch (error) {
        console.warn('Failed to save selected currency to localStorage:', error);
      }
    }
  }

  /**
   * Load exchange rates from cache
   */
  private loadFromCache(): Map<string, number> | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const timestamp = localStorage.getItem(this.STORAGE_TIMESTAMP_KEY);
      const cachedData = localStorage.getItem(this.STORAGE_KEY);

      if (!timestamp || !cachedData) {
        return null;
      }

      const age = Date.now() - parseInt(timestamp, 10);
      if (age > this.CACHE_DURATION_MS) {
        return null;
      }

      const rates = JSON.parse(cachedData);
      return new Map(Object.entries(rates));
    } catch (error) {
      console.warn('Failed to load exchange rates from cache:', error);
      return null;
    }
  }

  /**
   * Save exchange rates to cache
   */
  private saveToCache(rates: Map<string, number>): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const ratesObject = Object.fromEntries(rates);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ratesObject));
      localStorage.setItem(this.STORAGE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to save exchange rates to cache:', error);
    }
  }

  /**
   * Fetch exchange rates from API
   */
  async fetchRates(baseCurrency: string = 'USD'): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<ExchangeRatesResponse>(`${this.API_BASE}/${baseCurrency}`)
      );

      if (response.result === 'success') {
        const rates = new Map(Object.entries(response.rates));
        this.exchangeRates.set(rates);
        this.baseCurrency.set(baseCurrency);
        this.saveToCache(rates);
      } else {
        throw new Error('Failed to fetch exchange rates');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      this.error.set('Failed to fetch exchange rates. Using default values.');

      // Fallback rates if API fails
      this.setFallbackRates();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Set fallback rates for basic conversions using imported FALLBACK_RATES
   */
  private setFallbackRates(): void {
    this.exchangeRates.set(FALLBACK_RATES);
    this.baseCurrency.set('USD');
  }

  /**
   * Convert amount from one currency to another
   */
  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    const rates = this.exchangeRates();

    if (fromCurrency === toCurrency) {
      return amount;
    }

    const fromRate = rates.get(fromCurrency) || 1;
    const toRate = rates.get(toCurrency) || 1;

    // Convert to base currency first, then to target currency
    const baseAmount = amount / fromRate;
    const convertedAmount = baseAmount * toRate;

    return Math.round(convertedAmount);
  }

  /**
   * Format amount with currency symbol
   */
  formatAmount(amount: number, currencyCode?: string): string {
    const code = currencyCode || this.selectedCurrency();
    const currency = this.SUPPORTED_CURRENCIES.find((c) => c.code === code);

    if (!currency) {
      return `${code} ${amount.toLocaleString()}`;
    }

    // For currencies that typically show symbol after amount (like KES)
    if (code === 'KES') {
      return `${currency.symbol} ${amount.toLocaleString()}`;
    }

    // For most currencies, show symbol before amount
    return `${currency.symbol}${amount.toLocaleString()}`;
  }

  /**
   * Get exchange rate between two currencies
   */
  getExchangeRate(fromCurrency: string, toCurrency: string): number {
    const rates = this.exchangeRates();
    const fromRate = rates.get(fromCurrency) || 1;
    const toRate = rates.get(toCurrency) || 1;

    return toRate / fromRate;
  }

  /**
   * Refresh exchange rates (force fetch)
   */
  async refreshRates(): Promise<void> {
    await this.fetchRates(this.baseCurrency());
  }
}
