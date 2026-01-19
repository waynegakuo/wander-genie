import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planning-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './planning-form.html',
  styleUrl: './planning-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningFormComponent {
  travelForm = input.required<FormGroup>();
  isLoading = input.required<boolean>();
  canSubmit = input.required<boolean>();
  budgetRanges = input.required<{ value: string; label: string }[]>();
  travelStyles = input.required<{ value: string; label: string }[]>();
  interestOptions = input.required<string[]>();
  accommodationTypes = input.required<{ value: string; label: string }[]>();
  transportationOptions = input.required<{ value: string; label: string }[]>();

  generateItinerary = output<void>();
  resetForm = output<void>();
  interestChange = output<{ interest: string; event: Event }>();

  isInterestSelected(interest: string): boolean {
    const selectedInterests = this.travelForm().get('interests')?.value as string[];
    return selectedInterests?.includes(interest) || false;
  }
}
