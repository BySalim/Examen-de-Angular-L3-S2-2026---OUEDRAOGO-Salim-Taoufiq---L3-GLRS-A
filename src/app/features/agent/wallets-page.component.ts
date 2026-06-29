import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WalletApiService } from '../../core/api/wallet-api.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Page, Wallet } from '../../core/models/wallet.model';
import { IconComponent } from '../../shared/ui/icon.component';
import { ModalComponent } from '../../shared/ui/modal.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';
import { PhonePipe } from '../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-wallets-page',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, ModalComponent, XofPipe, PhonePipe],
  template: `
    <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-content">Portefeuilles</h1>
        <p class="mt-1 text-sm text-content-muted">Gérez les comptes clients : création, recherche et opérations.</p>
      </div>
      <button type="button" class="btn-primary" (click)="openCreate()">
        <app-icon name="plus" [size]="18" /> Nouveau portefeuille
      </button>
    </header>

    <!-- Recherche -->
    <div class="card mb-5 p-4">
      <form [formGroup]="searchForm" (ngSubmit)="doSearch()" class="flex flex-wrap items-end gap-3">
        <div class="min-w-[220px] flex-1">
          <label class="label" for="search">Rechercher un client par téléphone</label>
          <div class="relative">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle"><app-icon name="search" [size]="17" /></span>
            <input id="search" type="tel" formControlName="phone" placeholder="+221770000003" class="input tabular pl-9" />
          </div>
        </div>
        <button type="submit" class="btn-subtle" [disabled]="searchForm.invalid">Rechercher</button>
        @if (searchResult()) {
          <button type="button" class="btn-ghost" (click)="clearSearch()">Effacer</button>
        }
      </form>

      @if (searchResult(); as w) {
        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><app-icon name="user" [size]="20" /></span>
            <div class="leading-tight">
              <p class="font-semibold text-content">{{ w.phoneNumber | phone }}</p>
              <p class="text-sm text-content-muted">{{ w.code }} · {{ w.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-[11px] uppercase tracking-wide text-content-subtle">Solde</p>
              <p class="font-semibold text-content tabular">{{ w.balance | xof }}</p>
            </div>
            <div class="flex gap-2">
              <button type="button" class="btn-subtle" (click)="openDeposit(w)"><app-icon name="deposit" [size]="16" /> Dépôt</button>
              <button type="button" class="btn-subtle" (click)="openWithdraw(w)"><app-icon name="withdraw" [size]="16" /> Retrait</button>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Liste -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-sm">
          <thead>
            <tr class="border-b border-hairline text-left text-xs uppercase tracking-wide text-content-subtle">
              <th class="px-4 py-3 font-semibold">Code</th>
              <th class="px-4 py-3 font-semibold">Téléphone</th>
              <th class="px-4 py-3 font-semibold">Email</th>
              <th class="px-4 py-3 text-right font-semibold">Solde</th>
              <th class="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (loadingList()) {
              @for (row of skeletonRows; track row) {
                <tr class="border-b border-hairline last:border-0">
                  <td class="px-4 py-3" colspan="5"><div class="skeleton h-5 w-full"></div></td>
                </tr>
              }
            } @else {
              @for (w of page()?.content ?? []; track w.id) {
                <tr class="border-b border-hairline transition-colors last:border-0 hover:bg-surface-2/60">
                  <td class="px-4 py-3 font-medium text-content">{{ w.code }}</td>
                  <td class="px-4 py-3 tabular text-content-muted">{{ w.phoneNumber | phone }}</td>
                  <td class="px-4 py-3 text-content-muted">{{ w.email }}</td>
                  <td class="px-4 py-3 text-right font-semibold tabular text-content">{{ w.balance | xof }}</td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <button type="button" class="btn-ghost !px-2 !py-1.5" title="Dépôt" (click)="openDeposit(w)"><app-icon name="deposit" [size]="17" /></button>
                      <button type="button" class="btn-ghost !px-2 !py-1.5" title="Retrait" (click)="openWithdraw(w)"><app-icon name="withdraw" [size]="17" /></button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="px-4 py-12 text-center text-sm text-content-muted">Aucun portefeuille.</td></tr>
              }
            }
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between border-t border-hairline px-4 py-3 text-sm">
        <span class="text-content-subtle">{{ page()?.totalElements ?? 0 }} portefeuille(s)</span>
        <div class="flex items-center gap-2">
          <button type="button" class="btn-ghost !px-2 !py-1.5" [disabled]="(page()?.first ?? true)" (click)="goPrev()"><app-icon name="chevron-left" [size]="18" /></button>
          <span class="tabular text-content-muted">Page {{ (page()?.number ?? 0) + 1 }} / {{ page()?.totalPages || 1 }}</span>
          <button type="button" class="btn-ghost !px-2 !py-1.5" [disabled]="(page()?.last ?? true)" (click)="goNext()"><app-icon name="chevron-right" [size]="18" /></button>
        </div>
      </div>
    </div>

    <!-- Modale création -->
    <app-modal [open]="createOpen()" title="Nouveau portefeuille" subtitle="Inscrire un nouveau client" (closed)="createOpen.set(false)">
      <form [formGroup]="createForm" (ngSubmit)="submitCreate()" class="flex flex-col gap-3.5">
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2">
            <label class="label">Téléphone</label>
            <input type="tel" formControlName="phoneNumber" placeholder="+221779998877" class="input tabular" [class.input-error]="invalid(createForm.controls.phoneNumber)" />
            @if (invalid(createForm.controls.phoneNumber)) { <p class="field-error">Format : +221 et 9 chiffres.</p> }
          </div>
          <div class="col-span-2">
            <label class="label">Email</label>
            <input type="email" formControlName="email" placeholder="client@email.com" class="input" [class.input-error]="invalid(createForm.controls.email)" />
            @if (invalid(createForm.controls.email)) { <p class="field-error">Email invalide.</p> }
          </div>
          <div>
            <label class="label">Code</label>
            <input type="text" formControlName="code" placeholder="WLT-TEST001" class="input" [class.input-error]="invalid(createForm.controls.code)" />
          </div>
          <div>
            <label class="label">Devise</label>
            <input type="text" formControlName="currency" class="input" />
          </div>
          <div class="col-span-2">
            <label class="label">Solde initial</label>
            <input type="number" formControlName="initialBalance" placeholder="25000" class="input tabular" [class.input-error]="invalid(createForm.controls.initialBalance)" />
          </div>
        </div>
        <div class="mt-1 flex justify-end gap-2">
          <button type="button" class="btn-subtle" (click)="createOpen.set(false)">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="submitting()">Créer</button>
        </div>
      </form>
    </app-modal>

    <!-- Modale dépôt -->
    <app-modal [open]="depositOpen()" title="Effectuer un dépôt" [subtitle]="selected()?.phoneNumber ?? ''" (closed)="depositOpen.set(false)">
      <form [formGroup]="depositForm" (ngSubmit)="submitDeposit()" class="flex flex-col gap-3.5">
        <div>
          <label class="label">Montant</label>
          <input type="number" formControlName="amount" placeholder="50000" class="input tabular" [class.input-error]="invalid(depositForm.controls.amount)" />
          @if (invalid(depositForm.controls.amount)) { <p class="field-error">Montant supérieur à 0 requis.</p> }
        </div>
        <div>
          <label class="label">Méthode</label>
          <select formControlName="paymentMethod" class="input">
            <option value="CREDIT_CARD">Carte de crédit</option>
            <option value="WALLET_TARGET">Depuis un autre portefeuille</option>
          </select>
        </div>
        <div class="mt-1 flex justify-end gap-2">
          <button type="button" class="btn-subtle" (click)="depositOpen.set(false)">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="submitting()">Créditer</button>
        </div>
      </form>
    </app-modal>

    <!-- Modale retrait -->
    <app-modal [open]="withdrawOpen()" title="Effectuer un retrait" [subtitle]="selected()?.phoneNumber ?? ''" (closed)="withdrawOpen.set(false)">
      <form [formGroup]="withdrawForm" (ngSubmit)="submitWithdraw()" class="flex flex-col gap-3.5">
        <div>
          <label class="label">Montant</label>
          <input type="number" formControlName="amount" placeholder="10000" class="input tabular" [class.input-error]="invalid(withdrawForm.controls.amount)" />
          @if (invalid(withdrawForm.controls.amount)) { <p class="field-error">Montant supérieur à 0 requis.</p> }
          <p class="mt-1.5 text-xs text-content-subtle">Frais : 1% du montant, plafonnés à 5 000 XOF.</p>
        </div>
        <div class="mt-1 flex justify-end gap-2">
          <button type="button" class="btn-subtle" (click)="withdrawOpen.set(false)">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="submitting()">Débiter</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class WalletsPageComponent {
  private readonly api = inject(WalletApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly page = signal<Page<Wallet> | null>(null);
  protected readonly loadingList = signal(false);
  protected readonly searchResult = signal<Wallet | null>(null);
  protected readonly selected = signal<Wallet | null>(null);
  protected readonly submitting = signal(false);

  protected readonly createOpen = signal(false);
  protected readonly depositOpen = signal(false);
  protected readonly withdrawOpen = signal(false);

  protected readonly skeletonRows = Array.from({ length: 6 });
  private readonly size = 10;
  private currentPage = 0;

  protected readonly searchForm = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+221\d{9}$/)]],
  });

  protected readonly createForm = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+221\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required]],
    currency: ['XOF', [Validators.required]],
    initialBalance: [0, [Validators.required, Validators.min(0)]],
  });

  protected readonly depositForm = this.fb.nonNullable.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    paymentMethod: ['CREDIT_CARD', [Validators.required]],
  });

  protected readonly withdrawForm = this.fb.nonNullable.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.load();
  }

  protected invalid(control: AbstractControl): boolean {
    return control.touched && control.invalid;
  }

  private load(): void {
    this.loadingList.set(true);
    this.api.list(this.currentPage, this.size).subscribe({
      next: (result) => {
        this.page.set(result);
        this.loadingList.set(false);
      },
      error: () => this.loadingList.set(false),
    });
  }

  protected goPrev(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.load();
    }
  }

  protected goNext(): void {
    if (!(this.page()?.last ?? true)) {
      this.currentPage++;
      this.load();
    }
  }

  protected openCreate(): void {
    this.createForm.reset({ currency: 'XOF', initialBalance: 0, phoneNumber: '', email: '', code: '' });
    this.createOpen.set(true);
  }

  protected submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.api.create(this.createForm.getRawValue()).subscribe({
      next: (wallet) => {
        this.toast.success(`Portefeuille ${wallet.code} créé.`);
        this.submitting.set(false);
        this.createOpen.set(false);
        this.currentPage = 0;
        this.load();
      },
      error: () => this.submitting.set(false),
    });
  }

  protected doSearch(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.api.getByPhone(this.searchForm.getRawValue().phone).subscribe({
      next: (wallet) => this.searchResult.set(wallet),
      error: () => this.searchResult.set(null),
    });
  }

  protected clearSearch(): void {
    this.searchResult.set(null);
    this.searchForm.reset({ phone: '' });
  }

  protected openDeposit(wallet: Wallet): void {
    this.selected.set(wallet);
    this.depositForm.reset({ amount: null, paymentMethod: 'CREDIT_CARD' });
    this.depositOpen.set(true);
  }

  protected submitDeposit(): void {
    const wallet = this.selected();
    if (!wallet || this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }
    const value = this.depositForm.getRawValue();
    this.submitting.set(true);
    this.api
      .deposit(wallet.id, { amount: value.amount as number, paymentMethod: value.paymentMethod as 'CREDIT_CARD' | 'WALLET_TARGET' })
      .subscribe({
        next: () => {
          this.toast.success('Dépôt effectué.');
          this.submitting.set(false);
          this.depositOpen.set(false);
          this.refreshAfterOperation(wallet);
        },
        error: () => this.submitting.set(false),
      });
  }

  protected openWithdraw(wallet: Wallet): void {
    this.selected.set(wallet);
    this.withdrawForm.reset({ amount: null });
    this.withdrawOpen.set(true);
  }

  protected submitWithdraw(): void {
    const wallet = this.selected();
    if (!wallet || this.withdrawForm.invalid) {
      this.withdrawForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.api.withdraw({ phoneNumber: wallet.phoneNumber, amount: this.withdrawForm.getRawValue().amount as number }).subscribe({
      next: (result) => {
        this.toast.success(`Retrait effectué (frais ${result.fee} XOF).`);
        this.submitting.set(false);
        this.withdrawOpen.set(false);
        this.refreshAfterOperation(wallet);
      },
      error: () => this.submitting.set(false),
    });
  }

  private refreshAfterOperation(wallet: Wallet): void {
    this.load();
    if (this.searchResult()?.id === wallet.id) {
      this.api.getByPhone(wallet.phoneNumber).subscribe({ next: (w) => this.searchResult.set(w) });
    }
  }
}
