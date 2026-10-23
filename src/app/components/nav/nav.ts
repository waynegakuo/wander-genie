import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserAuth } from '../../shared/user-auth/user-auth';

@Component({
  selector: 'app-nav',
  imports: [UserAuth],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent {}
