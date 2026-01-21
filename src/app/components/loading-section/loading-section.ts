import { ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core';

@Component({
  selector: 'app-loading-section',
  imports: [],
  templateUrl: './loading-section.html',
  styleUrl: './loading-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSectionComponent {
  loadingMessage = input.required<string>();
  sectionRef = viewChild<ElementRef>('loadingSection');
}
