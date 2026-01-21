import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-nav',
  imports: [],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent {
  activeTab = input<'genie' | 'deep'>('genie');
  tabChange = output<'genie' | 'deep'>();
}
