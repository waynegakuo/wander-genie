import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Itinerary } from '../../models/travel.model';

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
  printItinerary = output<void>();
}
