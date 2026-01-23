import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';

@Component({
  selector: 'app-smart-suggestions',
  imports: [],
  templateUrl: './smart-suggestions.html',
  styleUrl: './smart-suggestions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartSuggestionsComponent {

  smartSuggestions = [
    {
      icon: '💎',
      text: 'Hidden Gems in Europe',
      value: 'Hidden gems in Europe for a budget summer trip'
    },
    {
      icon: '🌴',
      text: 'Cheap Tropical Getaways',
      value: 'Cheap tropical getaways for 4 people in March'
    },
    {
      icon: '🏔️',
      text: 'Solo Adventure in Asia',
      value: 'Best adventure trips for solo travelers in Asia'
    }
  ]
  nlpQuery = input.required<string>();
  selectSuggestion = output<string>();
}
