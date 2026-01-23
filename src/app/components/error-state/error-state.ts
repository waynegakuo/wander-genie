import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  imports: [CommonModule],
  template: `
    <div class="error-container glass-effect rounded-3xl p-8 max-w-lg mx-auto mt-12 mb-12 text-center">
      <div class="error-icon-wrapper mb-6">
        <span class="material-icons text-5xl text-error">error_outline</span>
      </div>
      <h3 class="text-brand text-2xl mb-4 text-note">Oops! The Genie is a bit tired</h3>
      <p class="text-ui text-gray-900 mb-8 leading-relaxed">
        I encountered an unexpected error while crafting your perfect itinerary.
        Don't worry, even magic has its off days! Please try again.
      </p>
      <button (click)="onRetry()" class="btn btn-primary btn-large w-full flex items-center justify-center gap-2">
        <span class="material-icons">refresh</span>
        Try Again
      </button>
    </div>
  `,
  styles: [`
    .error-container {
      background: rgba(220, 38, 38, 0.1); /* Very subtle red background */
      border: 1px solid rgba(220, 38, 38, 0.2);
      animation: fadeIn 0.5s ease-out;
    }

    .error-icon-wrapper {
      display: inline-flex;
      padding: 1.5rem;
      background: rgba(220, 38, 38, 0.15);
      border-radius: 50%;
      color: #ef4444;
    }

    .text-error {
      color: #ef4444;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  retry = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
