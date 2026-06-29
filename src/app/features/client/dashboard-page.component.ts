import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session/session.service';
import { BalanceStore } from '../../core/state/balance.store';
import { WalletApiService } from '../../core/api/wallet-api.service';
import { Transaction } from '../../core/models/transaction.model';
import { IconComponent } from '../../shared/ui/icon.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';
import { PhonePipe } from '../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, IconComponent, XofPipe, PhonePipe],
  template: `
    <header class="mb-6">
      <h1 class="text-xl font-semibold tracking-tight text-content">Tableau de bord</h1>
      <p class="mt-1 text-sm text-content-muted">Aperçu de votre compte et de votre activité.</p>
    </header>

    <div class="grid gap-5 lg:grid-cols-3">
      <!-- Solde -->
      <div class="card relative overflow-hidden p-6 lg:col-span-2" style="background-image: linear-gradient(135deg, #0d9488, #0f766e);">
        <div class="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl"></div>
        <div class="relative flex items-start justify-between text-white">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-white/70">Solde disponible</p>
            <p class="mt-2 text-4xl font-semibold tracking-tight tabular">{{ balance.balance() | xof }}</p>
            <p class="mt-2 text-sm text-white/70 tabular">{{ session.phone() | phone }}</p>
          </div>
          <span class="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20"><app-icon name="wallet" [size]="22" /></span>
        </div>
        <div class="relative mt-6 flex flex-wrap gap-2.5">
          <a routerLink="/transfer" class="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/25">
            <app-icon name="transfer" [size]="17" /> Transférer
          </a>
          <a routerLink="/bills/current" class="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/25">
            <app-icon name="receipt" [size]="17" /> Payer une facture
          </a>
        </div>
      </div>

      <!-- Revenus / Dépenses -->
      <div class="card p-6">
        <p class="text-sm font-semibold text-content">Revenus & dépenses</p>
        <p class="mb-4 text-xs text-content-subtle">Sur l'ensemble de vos transactions</p>
        @if (loading()) {
          <div class="skeleton mx-auto h-40 w-40 rounded-full"></div>
        } @else {
          <div class="flex items-center gap-5">
            <div class="relative h-36 w-36 shrink-0">
              <svg viewBox="0 0 100 100" class="h-36 w-36 -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--k-surface-2))" stroke-width="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--k-primary))" stroke-width="10" stroke-linecap="round" [attr.stroke-dasharray]="incomeLen() + ' ' + circumference" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--k-gold))" stroke-width="10" stroke-linecap="round" [attr.stroke-dasharray]="expenseLen() + ' ' + circumference" [attr.stroke-dashoffset]="-incomeLen()" />
              </svg>
              <div class="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p class="text-[11px] text-content-subtle">Net</p>
                  <p class="text-sm font-semibold text-content tabular">{{ net() | xof }}</p>
                </div>
              </div>
            </div>
            <ul class="flex-1 space-y-3 text-sm">
              <li>
                <span class="flex items-center gap-2 text-content-muted"><span class="h-2.5 w-2.5 rounded-full bg-primary"></span> Revenus</span>
                <span class="mt-0.5 block font-semibold text-content tabular">{{ income() | xof }}</span>
              </li>
              <li>
                <span class="flex items-center gap-2 text-content-muted"><span class="h-2.5 w-2.5 rounded-full bg-gold"></span> Dépenses</span>
                <span class="mt-0.5 block font-semibold text-content tabular">{{ expense() | xof }}</span>
              </li>
            </ul>
          </div>
        }
      </div>
    </div>

    <!-- Flux mensuel -->
    <div class="card mt-5 p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-content">Flux mensuel</p>
          <p class="text-xs text-content-subtle">Entrées et sorties sur les 6 derniers mois</p>
        </div>
        <ul class="flex items-center gap-4 text-xs text-content-muted">
          <li class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-primary"></span> Entrées</li>
          <li class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-gold"></span> Sorties</li>
        </ul>
      </div>
      @if (loading()) {
        <div class="skeleton mt-6 h-44 w-full"></div>
      } @else {
        <div class="mt-6 flex h-44 items-end gap-3 sm:gap-5">
          @for (m of monthly(); track m.key) {
            <div class="flex h-full flex-1 flex-col items-center gap-2">
              <div class="flex h-full w-full items-end justify-center gap-1.5">
                <div class="w-1/3 rounded-t-md bg-primary transition-[height] duration-500" [style.height.%]="barHeight(m.income)" [title]="m.income | xof"></div>
                <div class="w-1/3 rounded-t-md bg-gold transition-[height] duration-500" [style.height.%]="barHeight(m.expense)" [title]="m.expense | xof"></div>
              </div>
              <span class="text-[11px] font-medium capitalize text-content-subtle">{{ m.label }}</span>
            </div>
          }
        </div>
      }
    </div>

    <!-- Activité récente -->
    <div class="card mt-5">
      <div class="flex items-center justify-between border-b border-hairline px-5 py-3.5">
        <p class="text-sm font-semibold text-content">Activité récente</p>
        <a routerLink="/transactions" class="text-sm font-medium text-primary hover:underline">Tout voir</a>
      </div>
      <div class="divide-y divide-hairline">
        @if (loading()) {
          @for (row of skeletonRows; track row) {
            <div class="px-5 py-3.5"><div class="skeleton h-6 w-full"></div></div>
          }
        } @else {
          @for (tx of recent(); track tx.id) {
            <div class="flex items-center gap-3 px-5 py-3.5">
              <span class="grid h-9 w-9 place-items-center rounded-xl" [class]="iconBg(tx)"><app-icon [name]="iconName(tx)" [size]="17" /></span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-content">{{ label(tx) }}</p>
                <p class="truncate text-xs text-content-subtle">{{ tx.description }}@if (tx.counterpartyPhone) { · {{ tx.counterpartyPhone | phone }} }</p>
              </div>
              <span class="text-sm font-semibold tabular" [class.text-success]="tx.direction === 'CREDIT'" [class.text-content]="tx.direction === 'DEBIT'">
                {{ tx.direction === 'CREDIT' ? '+' : '−' }}{{ tx.amount | xof }}
              </span>
            </div>
          } @empty {
            <p class="px-5 py-10 text-center text-sm text-content-muted">Aucune transaction pour le moment.</p>
          }
        }
      </div>
    </div>
  `,
})
export class DashboardPageComponent {
  protected readonly session = inject(SessionService);
  protected readonly balance = inject(BalanceStore);
  private readonly api = inject(WalletApiService);

  protected readonly transactions = signal<Transaction[]>([]);
  protected readonly loading = signal(false);
  protected readonly skeletonRows = Array.from({ length: 4 });
  protected readonly circumference = 2 * Math.PI * 42;

  protected readonly income = computed(() =>
    this.transactions()
      .filter((tx) => tx.direction === 'CREDIT')
      .reduce((sum, tx) => sum + tx.amount, 0),
  );

  protected readonly expense = computed(() =>
    this.transactions()
      .filter((tx) => tx.direction === 'DEBIT')
      .reduce((sum, tx) => sum + tx.amount + tx.fee, 0),
  );

  protected readonly net = computed(() => this.income() - this.expense());
  private readonly total = computed(() => this.income() + this.expense());
  protected readonly incomeLen = computed(() => (this.total() ? (this.circumference * this.income()) / this.total() : 0));
  protected readonly expenseLen = computed(() => (this.total() ? (this.circumference * this.expense()) / this.total() : 0));
  protected readonly recent = computed(() => this.transactions().slice(0, 6));

  protected readonly monthly = computed(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString('fr-FR', { month: 'short' }),
        income: 0,
        expense: 0,
      };
    });
    const byKey = new Map(months.map((month) => [month.key, month]));
    for (const tx of this.transactions()) {
      const date = new Date(tx.createdAt);
      const month = byKey.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (!month) {
        continue;
      }
      if (tx.direction === 'CREDIT') {
        month.income += tx.amount;
      } else {
        month.expense += tx.amount + tx.fee;
      }
    }
    return months;
  });

  private readonly monthlyMax = computed(() => Math.max(1, ...this.monthly().flatMap((month) => [month.income, month.expense])));

  constructor() {
    const phone = this.session.phone();
    if (phone) {
      this.balance.refresh(phone);
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

  protected label(tx: Transaction): string {
    const labels: Record<string, string> = {
      DEPOSIT: 'Dépôt',
      WITHDRAW: 'Retrait',
      TRANSFER: tx.direction === 'CREDIT' ? 'Transfert reçu' : 'Transfert émis',
      PAYMENT: 'Paiement facture',
    };
    return labels[tx.type] ?? tx.type;
  }

  protected iconName(tx: Transaction): string {
    const icons: Record<string, string> = {
      DEPOSIT: 'deposit',
      WITHDRAW: 'withdraw',
      TRANSFER: 'transfer',
      PAYMENT: 'receipt',
    };
    return icons[tx.type] ?? 'wallet';
  }

  protected iconBg(tx: Transaction): string {
    return tx.direction === 'CREDIT' ? 'bg-success/10 text-success' : 'bg-surface-2 text-content-muted';
  }

  protected barHeight(value: number): number {
    return value <= 0 ? 0 : Math.max(4, (value / this.monthlyMax()) * 100);
  }
}
