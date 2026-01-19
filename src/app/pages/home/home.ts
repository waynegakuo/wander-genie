
import { Component, signal, computed, ChangeDetectionStrategy, inject, PLATFORM_ID, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TravelPreferences, Itinerary } from '../../models/travel.model';
import { TravelService } from '../../services/travel/travel.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {
  private fb = new FormBuilder();
  private platformId = inject(PLATFORM_ID);
  private travelService = inject(TravelService);

  // Signals for state management
  isLoading = signal(false);
  showForm = signal(true); // NLP first, so show form area
  generatedItinerary = signal<Itinerary | null>(null);
  nlpQuery = signal('');

  placeholders = [
    'Find me a romantic weekend in Paris...',
    'Budget beach trip for 5 friends in June...',
    'Family of 4 to Tokyo for 10 days to see cherry blossoms...',
    'Adventurous solo trip to Patagonia for hiking...'
  ];
  currentPlaceholder = signal(this.placeholders[0]);

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
        index = (index + 1) % this.placeholders.length;
        this.currentPlaceholder.set(this.placeholders[index]);
      }, 4000);
    }

    // Effect to parse NLP query
    effect(() => {
      const query = this.nlpQuery();
      if (query) {
        const parsed = this.travelService.parseTravelQuery(query);
        this.travelForm.patchValue(parsed, { emitEvent: false });
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
      this.activeChip.set(chip);
    }
  }

  updateQuery(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nlpQuery.set(target.value);
  }

  selectSuggestion(suggestion: string): void {
    this.nlpQuery.set(suggestion);
    // Explicitly trigger parsing
    const parsed = this.travelService.parseTravelQuery(suggestion);
    this.travelForm.patchValue(parsed, { emitEvent: false });
  }

  // Options for dropdowns
  readonly budgetRanges = [
    { value: 'budget', label: '$0 - $1,000 (Budget)' },
    { value: 'mid-range', label: '$1,000 - $3,000 (Mid-range)' },
    { value: 'luxury', label: '$3,000 - $10,000 (Luxury)' },
    { value: 'ultra-luxury', label: '$10,000+ (Ultra Luxury)' }
  ];

  readonly travelStyles = [
    { value: 'adventure', label: 'Adventure & Outdoor' },
    { value: 'cultural', label: 'Cultural & Historical' },
    { value: 'relaxation', label: 'Relaxation & Wellness' },
    { value: 'food', label: 'Food & Culinary' },
    { value: 'nightlife', label: 'Nightlife & Entertainment' },
    { value: 'family', label: 'Family Friendly' },
    { value: 'romantic', label: 'Romantic Getaway' },
    { value: 'business', label: 'Business TravelService' }
  ];

  readonly interestOptions = [
    'Museums & Art',
    'Historical Sites',
    'Nature & Parks',
    'Food & Restaurants',
    'Shopping',
    'Nightlife',
    'Adventure Sports',
    'Photography',
    'Local Culture',
    'Architecture',
    'Music & Festivals',
    'Beaches',
    'Mountains',
    'Wildlife'
  ];

  readonly accommodationTypes = [
    { value: 'hotel', label: 'Hotels' },
    { value: 'hostel', label: 'Hostels' },
    { value: 'airbnb', label: 'Vacation Rentals' },
    { value: 'resort', label: 'Resorts' },
    { value: 'boutique', label: 'Boutique Hotels' },
    { value: 'luxury', label: 'Luxury Hotels' },
    { value: 'camping', label: 'Camping' }
  ];

  readonly transportationOptions = [
    { value: 'flight', label: 'Flight' },
    { value: 'car', label: 'Car/Road Trip' },
    { value: 'train', label: 'Train' },
    { value: 'bus', label: 'Bus' },
    { value: 'mixed', label: 'Mixed Transportation' }
  ];

  // Methods
  showPlanningForm(): void {
    this.showForm.set(true);
    // Smooth scroll to form
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const formElement = document.getElementById('planning-form');
        formElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  onInterestChange(interest: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentInterests = this.travelForm.get('interests')?.value || [];

    if (target.checked) {
      this.travelForm.patchValue({
        interests: [...currentInterests, interest]
      });
    } else {
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
      // Create a preferences object from the NLP query if available
      let formData: TravelPreferences;

      if (this.nlpQuery().length > 10) {
        const parsed = this.travelService.parseTravelQuery(this.nlpQuery());
        // Merge with existing form values
        formData = { ...this.travelForm.value, ...parsed };
      } else {
        formData = this.travelForm.value;
      }

      // Call the Genkit flow via TravelService
      const itinerary = await this.travelService.planTrip(formData);

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
      window.print();
    }
  }

  resetForm(): void {
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
    this.showForm.set(true);
    this.generatedItinerary.set(null);

    // Scroll to top
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
