import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UserAuth } from '../../shared/user-auth/user-auth';

@Component({
  selector: 'app-nav',
  imports: [UserAuth],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent {
  activeTab = input<'genie' | 'deep'>();
  showTabs = input<boolean>(true);
  tabChange = output<'genie' | 'deep'>();
}
