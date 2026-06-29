import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4">
        <div class="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm" (click)="closed.emit()"></div>
        <div class="card relative z-10 w-full animate-scale-in p-5" [style.maxWidth.px]="maxWidth">
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 class="text-base font-semibold text-content">{{ title }}</h2>
              @if (subtitle) {
                <p class="mt-0.5 text-sm text-content-muted">{{ subtitle }}</p>
              }
            </div>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-lg text-content-subtle transition-colors hover:bg-surface-2 hover:text-content"
              (click)="closed.emit()"
              aria-label="Fermer"
            >
              <app-icon name="close" [size]="18" />
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() maxWidth = 460;
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.closed.emit();
    }
  }
}
