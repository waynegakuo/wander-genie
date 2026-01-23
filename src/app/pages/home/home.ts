
import {
  Component,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  effect,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TravelPreferences, Itinerary } from '../../models/travel.model';
import { TravelService } from '../../services/travel/travel.service';
import { LoadingMessageService } from '../../services/loading/loading-message.service';
import { NavComponent } from '../../components/nav/nav';
import { HeroComponent } from '../../components/hero/hero';
import { GenieBarComponent } from '../../components/genie-bar/genie-bar';
import { PlanningFormComponent } from '../../components/planning-form/planning-form';
import { LoadingSectionComponent } from '../../components/loading-section/loading-section';
import { ItineraryResultsComponent } from '../../components/itinerary-results/itinerary-results';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavComponent,
    HeroComponent,
    GenieBarComponent,
    PlanningFormComponent,
    LoadingSectionComponent,
    ItineraryResultsComponent,
    FooterComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private fb = new FormBuilder();
  private platformId = inject(PLATFORM_ID);
  private travelService = inject(TravelService);
  private loadingMessageService = inject(LoadingMessageService);
  loadingSection = viewChild(LoadingSectionComponent);

  // Signals for state management
  isLoading = signal(false);
  activeTab = signal<'genie' | 'deep'>('genie');
  generatedItinerary = signal<Itinerary | null>(null);
  nlpQuery = signal('');
  loadingMessage = this.loadingMessageService.currentMessage;

  placeholders = [
    'Find me a romantic weekend in Paris...',
    'Budget beach trip for 5 friends in June...',
    'Family of 4 to Tokyo for 10 days to see cherry blossoms...',
    'Adventurous solo trip to Patagonia for hiking...'
  ];
  currentPlaceholder = signal(this.placeholders[0]);
  nextPlaceholder = signal(this.placeholders[1]);
  isTransitioning = signal(false);

  // Form setup
  travelForm: FormGroup = this.fb.group({
    departureLocation: [''],
    destination: ['', [Validators.required]],
    startDate: [''],
    endDate: [''],
    budget: ['mid-range'],
    travelStyle: ['adventure'],
    interests: [[]],
    groupSize: [1, [Validators.min(1), Validators.max(20)]],
    accommodation: ['hotel'],
    transportation: ['flight'],
    travelClass: ['economy'],
    flexibility: ['flexible']
  });

  constructor() {
    // Cycling placeholder effect
    if (isPlatformBrowser(this.platformId)) {
      let index = 0;
      setInterval(() => {
        this.isTransitioning.set(true);

        setTimeout(() => {
          index = (index + 1) % this.placeholders.length;
          this.currentPlaceholder.set(this.placeholders[index]);
          this.nextPlaceholder.set(this.placeholders[(index + 1) % this.placeholders.length]);
          this.isTransitioning.set(false);
        }, 600); // Match SCSS transition time
      }, 4000);
    }

    // Effect to parse NLP query
    effect(() => {
      const query = this.nlpQuery();
      if (query) {
        const parsed = this.travelService.extractPreferences(query);
        this.travelForm.patchValue(parsed, { emitEvent: false });
      }
    });

    // Loading messages effect
    effect(() => {
      if (this.isLoading()) {
        this.loadingMessageService.startCycling();
      } else {
        this.loadingMessageService.stopCycling();
      }
    });

  // Smooth scroll to results/loading
  effect(() => {
    const section = this.loadingSection()?.sectionRef();
    if (section && this.isLoading() && isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        section.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  });

  // Effect to handle tab changes and potential scrolling
  effect(() => {
    if (this.activeTab() === 'deep' && isPlatformBrowser(this.platformId)) {
      // Small delay to ensure the DOM is updated before we might want to do something
      // But we probably don't need to scroll anymore since it's in the hero
    }
  });
  }

  // Computed properties
  private formStatus = toSignal(this.travelForm.statusChanges, { initialValue: this.travelForm.status });
  private formValid = computed(() => this.formStatus() === 'VALID');
  canSubmit = computed(() => (this.formValid() || this.nlpQuery().length > 10) && !this.isLoading());

  // Options for chips
  readonly travelClasses = [
    { value: 'economy', label: 'Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First' }
  ];

  readonly flexibilityOptions = [
    { value: 'exact', label: 'Exact Dates' },
    { value: 'flexible', label: 'Flexible' },
    { value: 'anytime', label: 'Anytime' }
  ];



  activeChip = signal<string | null>(null);

  toggleChip(chip: string): void {
    if (this.activeChip() === chip) {
      this.activeChip.set(null);
    } else {
      this.travelService.logEvent('open_chip_dropdown', { chip });
      this.activeChip.set(chip);
    }
  }

  updateQuery(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.nlpQuery.set(value);

    // If "from [City]" is in the query, we don't want to override if user manually typed in departure
    // Actually, the effect handles patching. If we want to allow manual override to stick,
    // we might need more complex logic, but for now, simple patching is fine.
  }

  selectSuggestion(suggestion: string): void {
    this.travelService.logSelectSuggestion(suggestion);
    this.nlpQuery.set(suggestion);
    // Explicitly trigger parsing using local extraction for suggestions
    const parsed = this.travelService.extractPreferences(suggestion);
    this.travelForm.patchValue(parsed, { emitEvent: false });
  }

  // Options for dropdowns
  budgetRanges = [
    { value: 'budget', label: '💰 $0 - $1,000 (Budget)' },
    { value: 'mid-range', label: '💸 $1,000 - $3,000 (Mid-range)' },
    { value: 'luxury', label: '💎 $3,000 - $10,000 (Luxury)' },
    { value: 'ultra-luxury', label: '✨ $10,000+ (Ultra Luxury)' },
  ];

  travelStyles = [
    { value: 'adventure', label: '🏔️ Adventure & Outdoor' },
    { value: 'cultural', label: '🏛️ Cultural & Historical' },
    { value: 'relaxation', label: '🧘 Relaxation & Wellness' },
    { value: 'food', label: '🍳 Food & Culinary' },
    { value: 'nightlife', label: '💃 Nightlife & Entertainment' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family Friendly' },
    { value: 'romantic', label: '👩‍❤️‍👨 Romantic Getaway' },
    { value: 'business', label: '💼 Business Travel' },
  ];

  interestOptions = [
    '🖼️ Museums & Art',
    '🏰 Historical Sites',
    '🌳 Nature & Parks',
    '🍕 Food & Restaurants',
    '🛍️ Shopping',
    '🍺 Nightlife',
    '🏂 Adventure Sports',
    '📸 Photography',
    '🎎 Local Culture',
    '🏛️ Architecture',
    '🎶 Music & Festivals',
    '🏖️ Beaches',
    '🏔️ Mountains',
    '🦒 Wildlife',
    '🌌 Stargazing',
    '🧘 Yoga & Wellness',
    '🍷 Wine Tasting',
    '🎭 Theatre & Shows',
  ];

  accommodationTypes = [
    { value: 'hotel', label: '🏨 Hotels' },
    { value: 'hostel', label: '🛌 Hostels' },
    { value: 'airbnb', label: '🏠 Vacation Rentals' },
    { value: 'resort', label: '🏖️ Resorts' },
    { value: 'boutique', label: '✨ Boutique Hotels' },
    { value: 'luxury', label: '💎 Luxury Hotels' },
    { value: 'camping', label: '⛺ Camping' },
  ];

  transportationOptions = [
    { value: 'flight', label: '✈️ Flight' },
    { value: 'car', label: '🚗 Car/Road Trip' },
    { value: 'train', label: '🚆 Train' },
    { value: 'bus', label: '🚌 Bus' },
    { value: 'mixed', label: '🔄 Mixed Transportation' },
  ];

  // Methods
  showPlanningForm(): void {
    this.activeTab.set('deep');
  }

  onTabChange(tab: 'genie' | 'deep'): void {
    this.travelService.logTabChange(tab);
    this.activeTab.set(tab);
  }

  onInterestChange(interest: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentInterests = this.travelForm.get('interests')?.value || [];

    if (target.checked) {
      this.travelService.logEvent('select_interest', { interest });
      this.travelForm.patchValue({
        interests: [...currentInterests, interest]
      });
    } else {
      this.travelService.logEvent('deselect_interest', { interest });
      this.travelForm.patchValue({
        interests: currentInterests.filter((i: string) => i !== interest)
      });
    }
  }

  isInterestSelected(interest: string): boolean {
    const interests = this.travelForm.get('interests')?.value || [];
    return interests.includes(interest);
  }

  async generateItinerary(): Promise<void> {
    if (!this.canSubmit()) return;

    this.isLoading.set(true);

    try {
      let itinerary: Itinerary;

      // If we have an NLP query that is long enough, use the Genie flow directly
      if (this.nlpQuery().length > 10) {
        const departureLocation = this.travelForm.get('departureLocation')?.value;
        itinerary = await this.travelService.generateGenieItinerary(this.nlpQuery(), departureLocation);
      } else {
        // Create a preferences object from the form values
        const formData: TravelPreferences = {
          ...this.travelForm.value,
          nlpQuery: this.nlpQuery()
        };

        // Call the Genkit flow via TravelService
        itinerary = await this.travelService.generateItinerary(formData);
      }

      this.generatedItinerary.set(itinerary);

      // Scroll to results
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          const resultsElement = document.getElementById('itinerary-results');
          resultsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }

    } catch (error) {
      console.error('Error generating itinerary:', error);
      // Handle error (show notification, etc.)
    } finally {
      this.isLoading.set(false);
    }
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  printItinerary(): void {
    if (isPlatformBrowser(this.platformId)) {
      const itinerary = this.generatedItinerary();
      this.travelService.logPrintItinerary(itinerary?.destination || this.travelForm.get('destination')?.value);
      window.print();
    }
  }

  resetForm(): void {
    this.travelService.logResetForm();
    this.travelForm.reset({
      groupSize: 1,
      interests: [],
      budget: 'mid-range',
      travelStyle: 'adventure',
      accommodation: 'hotel',
      transportation: 'flight',
      travelClass: 'economy',
      flexibility: 'flexible'
    });
    this.nlpQuery.set('');
    this.generatedItinerary.set(null);

    // Scroll to top
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
