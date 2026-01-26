import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/core/toast/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class]="'toast-' + toast.type"
          role="alert"
        >
          <div class="toast-content">
            <span class="toast-message">{{ toast.message }}</span>
          </div>
          <button
            type="button"
            class="toast-close"
            (click)="toastService.remove(toast.id)"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 24rem;
      width: calc(100% - 2rem);
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      background-color: var(--color-white);
      box-shadow: var(--shadow-lg);
      font-family: var(--font-body);
      animation: toast-in 0.3s ease-out;
      border-left: 4px solid transparent;
    }

    .toast-success {
      border-left-color: var(--color-success);
    }

    .toast-error {
      border-left-color: var(--color-error);
    }

    .toast-info {
      border-left-color: var(--color-accent);
    }

    .toast-warning {
      border-left-color: var(--color-warning);
    }

    .toast-content {
      flex: 1;
      margin-right: 1rem;
    }

    .toast-message {
      font-size: 0.875rem;
      color: var(--color-gray-800);
      line-height: 1.25rem;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: var(--color-gray-400);
      font-size: 1.25rem;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;

      &:hover {
        color: var(--color-gray-600);
      }
    }

    @keyframes toast-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
