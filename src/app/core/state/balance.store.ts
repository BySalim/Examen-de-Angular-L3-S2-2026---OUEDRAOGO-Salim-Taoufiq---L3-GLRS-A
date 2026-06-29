import { Injectable, inject, signal } from '@angular/core';
import { WalletApiService } from '../api/wallet-api.service';

@Injectable({ providedIn: 'root' })
export class BalanceStore {
  private readonly api = inject(WalletApiService);
  private readonly currentBalance = signal<number | null>(null);
  private readonly isLoading = signal(false);

  readonly balance = this.currentBalance.asReadonly();
  readonly loading = this.isLoading.asReadonly();

  refresh(phone: string): void {
    this.isLoading.set(true);
    this.api.getBalance(phone).subscribe({
      next: (value) => {
        this.currentBalance.set(value);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  set(value: number): void {
    this.currentBalance.set(value);
  }

  clear(): void {
    this.currentBalance.set(null);
  }
}
