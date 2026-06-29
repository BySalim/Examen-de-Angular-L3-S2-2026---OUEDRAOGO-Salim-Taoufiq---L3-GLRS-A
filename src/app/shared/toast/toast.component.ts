import { Component, inject } from '@angular/core';
import { IconComponent } from '../ui/icon.component';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="card pointer-events-auto flex animate-slide-in items-start gap-3 border-l-4 p-3.5"
          [class.border-l-success]="toast.type === 'success'"
          [class.border-l-danger]="toast.type === 'error'"
          [class.border-l-warning]="toast.type === 'warning'"
          [class.border-l-info]="toast.type === 'info'"
        >
          <span
            [class.text-success]="toast.type === 'success'"
            [class.text-danger]="toast.type === 'error'"
            [class.text-warning]="toast.type === 'warning'"
            [class.text-info]="toast.type === 'info'"
          >
            <app-icon [name]="iconFor(toast.type)" />
          </span>
          <p class="flex-1 text-sm leading-snug text-content">{{ toast.message }}</p>
          <button
            type="button"
            class="text-content-subtle transition-colors hover:text-content"
            (click)="toasts.dismiss(toast.id)"
            aria-label="Fermer"
          >
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  protected readonly toasts = inject(ToastService);

  iconFor(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'check',
      error: 'alert',
      warning: 'warning',
      info: 'info',
    };
    return map[type];
  }
}
