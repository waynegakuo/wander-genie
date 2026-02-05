import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { SmartSuggestionsComponent } from '../smart-suggestions/smart-suggestions';
import { SpeechRecognitionService } from '../../services/core/speech-recognition.service';

@Component({
  selector: 'app-genie-bar',
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe, SmartSuggestionsComponent],
  templateUrl: './genie-bar.html',
  styleUrl: './genie-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenieBarComponent {
  travelForm = input.required<FormGroup>();
  isLoading = input.required<boolean>();
  canSubmit = input.required<boolean>();
  nlpQuery = input.required<string>();
  currentPlaceholder = input.required<string>();
  nextPlaceholder = input.required<string>();
  isTransitioning = input.required<boolean>();

  // Options for chips (keeping these in component for cleaner template)
  budgetRanges = [
    { value: 'budget', label: '💰 $0 - $1,000 (Budget)' },
    { value: 'mid-range', label: '💸 $1,000 - $3,000 (Mid-range)' },
    { value: 'luxury', label: '💎 $3,000 - $10,000 (Luxury)' },
    { value: 'ultra-luxury', label: '✨ $10,000+ (Ultra Luxury)' },
  ];

  travelClasses = [
    { value: 'economy', label: 'Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First' }
  ];

  flexibilityOptions = [
    { value: 'exact', label: 'Exact Dates' },
    { value: 'flexible', label: 'Flexible' },
    { value: 'anytime', label: 'Anytime' }
  ];

  activeChip = signal<string | null>(null);

  updateQuery = output<Event>();
  generateItinerary = output<void>();
  selectSuggestion = output<string>();

  toggleChip(chip: string): void {
    if (this.activeChip() === chip) {
      this.activeChip.set(null);
    } else {
      this.activeChip.set(chip);
    }
  }

  onUpdateQuery(event: Event): void {
    this.updateQuery.emit(event);
  }

  onGenerateItinerary(): void {
    this.generateItinerary.emit();
  }

  onSelectSuggestion(suggestion: string): void {
    this.selectSuggestion.emit(suggestion);
  }

  setFormControlValue(controlName: string, value: any): void {
    this.travelForm().get(controlName)?.setValue(value);
    this.activeChip.set(null);
  }

  // Speech Recognition
  speech = inject(SpeechRecognitionService);

  constructor() {
    // Effect to update nlpQuery when transcript changes
    effect(() => {
      const text = this.speech.transcript();
      // Only emit if we have text and it's a new transcript from valid speech
      // We check isListening to ensure we are in a session, but also we might get a final result after stop?
      // Actually usually we want to see text as it comes in.
      if (text) {
        // Create a mock event to be compatible with onUpdateQuery's expectation
        const mockEvent = { target: { value: text } } as unknown as Event;
        this.onUpdateQuery(mockEvent);
      }
    });
  }

  toggleSpeech(): void {
    this.speech.toggle();
  }
}
