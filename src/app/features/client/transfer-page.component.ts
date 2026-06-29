import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WalletApiService } from '../../core/api/wallet-api.service';
import { SessionService } from '../../core/session/session.service';
import { BalanceStore } from '../../core/state/balance.store';
import { ToastService } from '../../shared/toast/toast.service';
import { IconComponent } from '../../shared/ui/icon.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';
import { differentPhoneValidator, phoneValidator, recipientExistsValidator } from '../../shared/validators/phone.validators';

@Component({
  selector: 'app-transfer-page',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, XofPipe],
  template: `
    <header class="mb-6">
      <h1 class="text-xl font-semibold tracking-tight text-content">Transfert d'argent</h1>
      <p class="mt-1 text-sm text-content-muted">Envoyez de l'argent vers un autre portefeuille BadWallet.</p>
    </header>

    <div class="mx-auto max-w-lg">
      <div class="card p-6">
        <div class="mb-5 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
          <span class="text-sm text-content-muted">Solde disponible</span>
          <span class="text-sm font-semibold text-content tabular">{{ balance.balance() | xof }}</span>
        </div>

        <form [formGroup]="transferForm" (ngSubmit)="submit()" class="flex flex-col gap-4">
          <div>
            <label class="label" for="destination">Téléphone du destinataire</label>
            <input id="destination" type="tel" formControlName="destination" placeholder="+221770000002" class="input tabular"
              [class.input-error]="dest.touched && (dest.invalid || transferForm.hasError('samePhone'))" />
            <div class="mt-1.5 min-h-[18px] text-xs">
              @if (dest.pending) {
                <span class="flex items-center gap-1.5 text-content-subtle"><span class="h-3 w-3 animate-spin rounded-full border-2 border-content-subtle/40 border-t-content-subtle"></span> Vérification…</span>
              } @else if (dest.touched && dest.hasError('required')) {
                <span class="text-danger">Numéro requis.</span>
              } @else if (dest.touched && dest.hasError('phone')) {
                <span class="text-danger">Format attendu : +221 et 9 chiffres.</span>
              } @else if (dest.touched && dest.hasError('recipientNotFound')) {
                <span class="text-danger">Ce numéro ne correspond à aucun portefeuille.</span>
              } @else if (transferForm.hasError('samePhone')) {
                <span class="text-danger">Vous ne pouvez pas vous transférer à vous-même.</span>
              } @else if (dest.valid && dest.value) {
                <span class="flex items-center gap-1 text-success"><app-icon name="check" [size]="14" /> Destinataire trouvé.</span>
              }
            </div>
          </div>

          <div>
            <label class="label" for="amount">Montant</label>
            <input id="amount" type="number" formControlName="amount" placeholder="2000" class="input tabular"
              [class.input-error]="amount.touched && amount.invalid" />
            @if (amount.touched && amount.invalid) {
              <p class="field-error">Montant supérieur à 0 requis.</p>
            }
          </div>

          <div>
            <label class="label" for="description">Description <span class="font-normal text-content-subtle">(optionnel)</span></label>
            <input id="description" type="text" formControlName="description" placeholder="Motif du transfert" class="input" />
          </div>

          <button type="submit" class="btn-primary mt-1" [disabled]="submitting() || transferForm.pending">
            @if (submitting()) {
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-primary-fg/40 border-t-primary-fg"></span>
            } @else {
              <app-icon name="send" [size]="18" />
            }
            Envoyer
          </button>
        </form>
      </div>
    </div>
  `,
})
export class TransferPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(WalletApiService);
  private readonly session = inject(SessionService);
  protected readonly balance = inject(BalanceStore);
  private readonly toast = inject(ToastService);

  protected readonly submitting = signal(false);

  protected readonly transferForm = this.fb.nonNullable.group(
    {
      destination: [
        '',
        [Validators.required, phoneValidator()],
        [recipientExistsValidator((phone) => this.api.exists(phone))],
      ],
      amount: [null as number | null, [Validators.required, Validators.min(1)]],
      description: [''],
    },
    { validators: differentPhoneValidator(() => this.session.phone()) },
  );

  protected get dest() {
    return this.transferForm.controls.destination;
  }

  protected get amount() {
    return this.transferForm.controls.amount;
  }

  protected submit(): void {
    if (this.transferForm.invalid || this.transferForm.pending) {
      this.transferForm.markAllAsTouched();
      return;
    }
    const value = this.transferForm.getRawValue();
    const sender = this.session.phone();
    if (!sender) {
      return;
    }
    this.submitting.set(true);
    this.api
      .transfer({ senderPhone: sender, receiverPhone: value.destination, amount: value.amount as number })
      .subscribe({
        next: (result) => {
          this.toast.success('Transfert effectué avec succès.');
          this.balance.set(result.senderBalanceAfter);
          this.transferForm.reset({ destination: '', amount: null, description: '' });
          this.submitting.set(false);
        },
        error: () => this.submitting.set(false),
      });
  }
}
