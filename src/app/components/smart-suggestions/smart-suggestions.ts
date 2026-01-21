import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';

@Component({
  selector: 'app-smart-suggestions',
  imports: [],
  templateUrl: './smart-suggestions.html',
  styleUrl: './smart-suggestions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartSuggestionsComponent {
  nlpQuery = input.required<string>();
  selectSuggestion = output<string>();
}
