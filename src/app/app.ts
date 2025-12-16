import { Component, signal } from '@angular/core';
import {Home} from './pages/home/home';

@Component({
  selector: 'app-root',
  imports: [Home],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('wander-genie');
}
