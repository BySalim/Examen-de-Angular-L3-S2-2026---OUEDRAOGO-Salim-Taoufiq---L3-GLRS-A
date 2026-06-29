import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { BillingApiService } from '../../core/api/billing-api.service';
import { WalletApiService } from '../../core/api/wallet-api.service';
import { SessionService } from '../../core/session/session.service';
import { BalanceStore } from '../../core/state/balance.store';
import { ToastService } from '../../shared/toast/toast.service';
import { Facture } from '../../core/models/facture.model';
import { IconComponent } from '../../shared/ui/icon.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';

type Filter = 'ALL' | 'ISM' | 'WOYAFAL';

@Component({
  selector: 'app-bills-current',
  standalone: true,
  imports: [IconComponent, XofPipe],
  template: `
    <div class="card">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-3.5">
        <div class="inline-flex gap-1 rounded-lg bg-surface-2 p-1">
          @for (f of filters; track f.value) {
            <button type="button" class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
              [class]="filter() === f.value ? 'bg-surface text-content shadow-soft' : 'text-content-muted'"
              (click)="filter.set(f.value)">{{ f.label }}</button>
          }
        </div>
        <span class="text-sm text-content-subtle">{{ filtered().length }} facture(s) impayée(s)</span>
      </div>

      <div class="divide-y divide-hairline">
        @if (loading()) {
          @for (row of skeletonRows; track row) {
            <div class="px-5 py-4"><div class="skeleton h-6 w-full"></div></div>
          }
        } @else {
          @for (facture of filtered(); track facture.reference) {
            <label class="flex cursor-pointer items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-2/50">
              <input type="checkbox" class="h-4 w-4 accent-[rgb(var(--k-primary))]" [checked]="selected().has(facture.reference)" (change)="toggle(facture.reference)" />
              <span class="chip" [class]="providerClass(facture.serviceName)">{{ facture.serviceName }}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-content">{{ facture.libelle || facture.reference }}</p>
                <p class="truncate text-xs text-content-subtle tabular">{{ facture.reference }} · {{ facture.periode }}</p>
              </div>
              <span class="text-sm font-semibold text-content tabular">{{ facture.montant | xof }}</span>
            </label>
          } @empty {
            <div class="flex flex-col items-center gap-2 px-5 py-14 text-center">
              <span class="grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success"><app-icon name="check" [size]="24" /></span>
              <p class="text-sm font-medium text-content">Aucune facture impayée</p>
              <p class="text-sm text-content-muted">Vous êtes à jour pour ce mois.</p>
            </div>
          }
        }
      </div>

      @if (selectedCount() > 0) {
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-surface-2/40 px-5 py-3.5">
          <span class="text-sm text-content-muted">{{ selectedCount() }} sélectionnée(s) · <span class="font-semibold text-content tabular">{{ selectedTotal() | xof }}</span></span>
          <button type="button" class="btn-primary" [disabled]="paying()" (click)="pay()">
            @if (paying()) { <span class="h-4 w-4 animate-spin rounded-full border-2 border-primary-fg/40 border-t-primary-fg"></span> }
            Payer la sélection
          </button>
        </div>
      }
    </div>
  `,
})
export class BillsCurrentComponent {
  private readonly billing = inject(BillingApiService);
  private readonly wallet = inject(WalletApiService);
  private readonly session = inject(SessionService);
  private readonly balance = inject(BalanceStore);
  private readonly toast = inject(ToastService);

  protected readonly factures = signal<Facture[]>([]);
  protected readonly loading = signal(false);
  protected readonly paying = signal(false);
  protected readonly filter = signal<Filter>('ALL');
  protected readonly selected = signal<Set<string>>(new Set());
  protected readonly skeletonRows = Array.from({ length: 4 });

  protected readonly filters: { label: string; value: Filter }[] = [
    { label: 'Tous', value: 'ALL' },
    { label: 'ISM', value: 'ISM' },
    { label: 'WOYAFAL', value: 'WOYAFAL' },
  ];

  protected readonly filtered = computed(() => {
    const current = this.filter();
    return current === 'ALL' ? this.factures() : this.factures().filter((f) => f.serviceName === current);
  });

  protected readonly selectedCount = computed(() => this.selected().size);
  protected readonly selectedTotal = computed(() =>
    this.factures()
      .filter((f) => this.selected().has(f.reference))
      .reduce((sum, f) => sum + f.montant, 0),
  );

  constructor() {
    this.load();
  }

  private load(): void {
    const code = this.session.code();
    if (!code) {
      return;
    }
    this.loading.set(true);
    this.billing.current(code).subscribe({
      next: (list) => {
        this.factures.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected toggle(reference: string): void {
    const next = new Set(this.selected());
    if (next.has(reference)) {
      next.delete(reference);
    } else {
      next.add(reference);
    }
    this.selected.set(next);
  }

  protected providerClass(service: string): string {
    return service === 'ISM'
      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
  }

  protected pay(): void {
    const phone = this.session.phone();
    const references = [...this.selected()];
    if (!phone || references.length === 0) {
      return;
    }
    const chosen = this.factures().filter((f) => references.includes(f.reference));
    const groups = new Map<string, string[]>();
    for (const facture of chosen) {
      const list = groups.get(facture.serviceName) ?? [];
      list.push(facture.reference);
      groups.set(facture.serviceName, list);
    }
    const calls = [...groups.entries()].map(([serviceName, factureReferences]) =>
      this.wallet.payFactures({ phoneNumber: phone, serviceName, factureReferences }),
    );

    this.paying.set(true);
    forkJoin(calls).subscribe({
      next: (results) => {
        this.toast.success('Factures payées avec succès.');
        this.balance.set(results[results.length - 1].balanceAfter);
        this.selected.set(new Set());
        this.paying.set(false);
        this.load();
      },
      error: () => this.paying.set(false),
    });
  }
}
