
import { Component, signal, computed, ChangeDetectionStrategy, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

interface TravelPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelStyle: string;
  interests: string[];
  groupSize: number;
  accommodation: string;
  transportation: string;
}

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

  // Signals for state management
  isLoading = signal(false);
  showForm = signal(false);
  generatedItinerary = signal<string | null>(null);

  // Form setup
  travelForm: FormGroup = this.fb.group({
    destination: ['', [Validators.required, Validators.minLength(2)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    budget: ['', Validators.required],
    travelStyle: ['', Validators.required],
    interests: [[], Validators.required],
    groupSize: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    accommodation: ['', Validators.required],
    transportation: ['', Validators.required]
  });

  // Computed properties
  private formStatus = toSignal(this.travelForm.statusChanges, { initialValue: this.travelForm.status });
  private formValid = computed(() => this.formStatus() === 'VALID');
  canSubmit = computed(() => this.formValid() && !this.isLoading());



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
    { value: 'business', label: 'Business Travel' }
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
      const formData: TravelPreferences = this.travelForm.value;

      // TODO: Replace with actual Gemini AI service call
      await this.simulateAIResponse();

      // Mock response for now
      const mockItinerary = this.generateMockItinerary(formData);
      this.generatedItinerary.set(mockItinerary);

      // Scroll to results
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          const resultsElement = document.getElementById('itinerary-results');
          resultsElement?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }

    } catch (error) {
      console.error('Error generating itinerary:', error);
      // Handle error (show notification, etc.)
    } finally {
      this.isLoading.set(false);
    }
  }

  private async simulateAIResponse(): Promise<void> {
    // Simulate API call delay
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  private generateMockItinerary(preferences: TravelPreferences): string {
    const days = this.calculateDays(preferences.startDate, preferences.endDate);
    const budgetLabel = this.budgetRanges.find(b => b.value === preferences.budget)?.label;
    const styleLabel = this.travelStyles.find(s => s.value === preferences.travelStyle)?.label;

    return `Your Personalized ${preferences.destination} Itinerary

Trip Duration: ${days} days
Budget: ${budgetLabel}
Travel Style: ${styleLabel}
Group Size: ${preferences.groupSize} ${preferences.groupSize === 1 ? 'person' : 'people'}

Day 1: Arrival & First Impressions
• Morning: Arrive in ${preferences.destination}
• Afternoon: Check into your ${preferences.accommodation} accommodation
• Evening: Welcome dinner at a local restaurant

Day 2: Cultural Exploration
• Morning: Visit top historical sites
• Afternoon: Museum tour based on your interests: ${preferences.interests.join(', ')}
• Evening: Traditional cultural experience

Day 3: Adventure & Activities
• Morning: Outdoor adventure activities
• Afternoon: Local market exploration and shopping
• Evening: Sunset viewing at the best local spot

${days > 3 ? `Day 4: ${this.generateAdditionalDayContent(preferences)}` : ''}

This is a sample itinerary. The actual AI-powered version will be much more detailed and personalized!`;
  }

  private generateAdditionalDayContent(preferences: TravelPreferences): string {
    const activities = [
      'Free day for personal exploration',
      'Day trip to nearby attractions',
      'Food tour and culinary experiences',
      'Relaxation and leisure activities'
    ];
    return activities[Math.floor(Math.random() * activities.length)];
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
      interests: []
    });
    this.showForm.set(false);
    this.generatedItinerary.set(null);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
