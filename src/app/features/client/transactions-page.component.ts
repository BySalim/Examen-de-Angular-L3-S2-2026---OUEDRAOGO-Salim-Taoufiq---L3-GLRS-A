import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WalletApiService } from '../../core/api/wallet-api.service';
import { SessionService } from '../../core/session/session.service';
import { Transaction, TransactionType } from '../../core/models/transaction.model';
import { IconComponent } from '../../shared/ui/icon.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';
import { PhonePipe } from '../../shared/pipes/phone.pipe';

type TypeFilter = 'ALL' | TransactionType;

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [DatePipe, IconComponent, PaginationComponent, XofPipe, PhonePipe],
  template: `
    <header class="mb-6">
      <h1 class="text-xl font-semibold tracking-tight text-content">Transactions</h1>
      <p class="mt-1 text-sm text-content-muted">Tous les mouvements de votre compte.</p>
    </header>

    <div class="card mb-5 p-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1">
          @for (t of typeFilters; track t.value) {
            <button type="button" class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              [class]="typeFilter() === t.value ? 'bg-surface text-content shadow-soft' : 'text-content-muted'"
              (click)="setType(t.value)">{{ t.label }}</button>
          }
        </div>
        <div class="flex items-end gap-2">
          <div>
            <label class="label">Du</label>
            <input type="date" class="input" [value]="dateFrom()" (change)="setDateFrom($any($event.target).value)" />
          </div>
          <div>
            <label class="label">Au</label>
            <input type="date" class="input" [value]="dateTo()" (change)="setDateTo($any($event.target).value)" />
          </div>
          @if (dateFrom() || dateTo() || typeFilter() !== 'ALL') {
            <button type="button" class="btn-ghost" (click)="reset()">Réinitialiser</button>
          }
        </div>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[680px] text-sm">
          <thead>
            <tr class="border-b border-hairline text-left text-xs uppercase tracking-wide text-content-subtle">
              <th class="px-4 py-3 font-semibold">Type</th>
              <th class="px-4 py-3 font-semibold">Détail</th>
              <th class="px-4 py-3 text-right font-semibold">Montant</th>
              <th class="px-4 py-3 text-right font-semibold">Solde après</th>
              <th class="px-4 py-3 text-right font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              @for (row of skeletonRows; track row) {
                <tr class="border-b border-hairline last:border-0"><td colspan="5" class="px-4 py-3"><div class="skeleton h-5 w-full"></div></td></tr>
              }
            } @else {
              @for (tx of paged(); track tx.id) {
                <tr class="border-b border-hairline transition-colors last:border-0 hover:bg-surface-2/60">
                  <td class="px-4 py-3">
                    <span class="chip" [class]="typeClass(tx.type)"><app-icon [name]="iconName(tx.type)" [size]="14" /> {{ typeLabel(tx) }}</span>
                  </td>
                  <td class="px-4 py-3 text-content-muted">
                    <p class="text-content">{{ tx.description }}</p>
                    @if (tx.counterpartyPhone) { <p class="text-xs text-content-subtle tabular">{{ tx.counterpartyPhone | phone }}</p> }
                    @else if (tx.reference) { <p class="text-xs text-content-subtle tabular">{{ tx.reference }}</p> }
                  </td>
                  <td class="px-4 py-3 text-right font-semibold tabular" [class.text-success]="tx.direction === 'CREDIT'" [class.text-content]="tx.direction === 'DEBIT'">
                    {{ tx.direction === 'CREDIT' ? '+' : '−' }}{{ tx.amount | xof }}
                  </td>
                  <td class="px-4 py-3 text-right tabular text-content-muted">{{ tx.balanceAfter | xof }}</td>
                  <td class="px-4 py-3 text-right tabular text-content-subtle">{{ tx.createdAt | date: 'dd/MM/yy' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="px-4 py-12 text-center text-sm text-content-muted">Aucune transaction ne correspond aux filtres.</td></tr>
              }
            }
          </tbody>
        </table>
      </div>
      <app-pagination [length]="filtered().length" [index]="pageIndex()" [pageSize]="pageSize" (indexChange)="pageIndex.set($event)" />
    </div>
  `,
})
export class TransactionsPageComponent {
  private readonly api = inject(WalletApiService);
  private readonly session = inject(SessionService);

  private readonly transactions = signal<Transaction[]>([]);
  protected readonly loading = signal(false);
  protected readonly typeFilter = signal<TypeFilter>('ALL');
  protected readonly dateFrom = signal('');
  protected readonly dateTo = signal('');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = 10;
  protected readonly skeletonRows = Array.from({ length: 8 });

  protected readonly typeFilters: { label: string; value: TypeFilter }[] = [
    { label: 'Tous', value: 'ALL' },
    { label: 'Dépôts', value: 'DEPOSIT' },
    { label: 'Retraits', value: 'WITHDRAW' },
    { label: 'Transferts', value: 'TRANSFER' },
    { label: 'Paiements', value: 'PAYMENT' },
  ];

  protected readonly filtered = computed(() => {
    const type = this.typeFilter();
    const from = this.dateFrom();
    const to = this.dateTo();
    return this.transactions().filter((tx) => {
      if (type !== 'ALL' && tx.type !== type) {
        return false;
      }
      const day = tx.createdAt.slice(0, 10);
      if (from && day < from) {
        return false;
      }
      if (to && day > to) {
        return false;
      }
      return true;
    });
  });

  protected readonly paged = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  constructor() {
    const phone = this.session.phone();
    if (phone) {
      this.loading.set(true);
      this.api.transactions(phone).subscribe({
        next: (list) => {
          this.transactions.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  protected setType(value: TypeFilter): void {
    this.typeFilter.set(value);
    this.pageIndex.set(0);
  }

  protected setDateFrom(value: string): void {
    this.dateFrom.set(value);
    this.pageIndex.set(0);
  }

  protected setDateTo(value: string): void {
    this.dateTo.set(value);
    this.pageIndex.set(0);
  }

  protected reset(): void {
    this.typeFilter.set('ALL');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.pageIndex.set(0);
  }

  protected typeLabel(tx: Transaction): string {
    const labels: Record<TransactionType, string> = {
      DEPOSIT: 'Dépôt',
      WITHDRAW: 'Retrait',
      TRANSFER: tx.direction === 'CREDIT' ? 'Reçu' : 'Émis',
      PAYMENT: 'Paiement',
    };
    return labels[tx.type];
  }

  protected iconName(type: TransactionType): string {
    const icons: Record<TransactionType, string> = {
      DEPOSIT: 'deposit',
      WITHDRAW: 'withdraw',
      TRANSFER: 'transfer',
      PAYMENT: 'receipt',
    };
    return icons[type];
  }

  protected typeClass(type: TransactionType): string {
    const classes: Record<TransactionType, string> = {
      DEPOSIT: 'bg-success/10 text-success',
      WITHDRAW: 'bg-danger/10 text-danger',
      TRANSFER: 'bg-info/10 text-info',
      PAYMENT: 'bg-warning/10 text-warning',
    };
    return classes[type];
  }
}
