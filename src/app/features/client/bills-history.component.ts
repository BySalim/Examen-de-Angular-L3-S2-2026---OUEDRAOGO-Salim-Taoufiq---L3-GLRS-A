import { Component, computed, inject, signal } from '@angular/core';
import { WalletApiService } from '../../core/api/wallet-api.service';
import { SessionService } from '../../core/session/session.service';
import { Transaction } from '../../core/models/transaction.model';
import { IconComponent } from '../../shared/ui/icon.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bills-history',
  standalone: true,
  imports: [IconComponent, PaginationComponent, XofPipe, DatePipe],
  template: `
    <div class="card">
      <div class="divide-y divide-hairline">
        @if (loading()) {
          @for (row of skeletonRows; track row) {
            <div class="px-5 py-4"><div class="skeleton h-6 w-full"></div></div>
          }
        } @else {
          @for (payment of pagedPayments(); track payment.id) {
            <div class="flex items-center gap-3 px-5 py-4">
              <span class="grid h-9 w-9 place-items-center rounded-xl bg-surface-2 text-content-muted"><app-icon name="receipt" [size]="17" /></span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-content">{{ payment.reference || 'Paiement' }}</p>
                <p class="truncate text-xs text-content-subtle">{{ payment.createdAt | date: 'dd/MM/yyyy' }} · {{ payment.description }}</p>
              </div>
              <span class="text-sm font-semibold text-content tabular">−{{ payment.amount | xof }}</span>
            </div>
          } @empty {
            <div class="flex flex-col items-center gap-2 px-5 py-14 text-center">
              <span class="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-content-subtle"><app-icon name="receipt" [size]="24" /></span>
              <p class="text-sm font-medium text-content">Aucun paiement</p>
              <p class="text-sm text-content-muted">Vos paiements de factures apparaîtront ici.</p>
            </div>
          }
        }
      </div>
      @if (!loading() && payments().length > 0) {
        <app-pagination [length]="payments().length" [index]="pageIndex()" [pageSize]="pageSize" (indexChange)="pageIndex.set($event)" />
      }
    </div>
  `,
})
export class BillsHistoryComponent {
  private readonly api = inject(WalletApiService);
  private readonly session = inject(SessionService);

  private readonly transactions = signal<Transaction[]>([]);
  protected readonly loading = signal(false);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = 8;
  protected readonly skeletonRows = Array.from({ length: 4 });

  protected readonly payments = computed(() => this.transactions().filter((tx) => tx.type === 'PAYMENT'));

  protected readonly pagedPayments = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.payments().slice(start, start + this.pageSize);
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
}
