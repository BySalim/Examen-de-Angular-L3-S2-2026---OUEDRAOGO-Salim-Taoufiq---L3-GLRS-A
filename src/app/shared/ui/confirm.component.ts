import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../core/confirm/confirm.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-confirm-host',
  standalone: true,
  imports: [ModalComponent],
  template: `
    @if (request(); as r) {
      <app-modal [open]="true" [title]="r.title" [maxWidth]="420" (closed)="confirm.cancel()">
        <p class="text-sm text-content-muted">{{ r.message }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="btn-subtle" (click)="confirm.cancel()">{{ r.cancelLabel ?? 'Annuler' }}</button>
          <button type="button" [class]="r.danger ? 'btn-danger' : 'btn-primary'" (click)="confirm.confirm()">
            {{ r.confirmLabel ?? 'Confirmer' }}
          </button>
        </div>
      </app-modal>
    }
  `,
})
export class ConfirmHostComponent {
  protected readonly confirm = inject(ConfirmService);
  protected readonly request = this.confirm.request;
}
