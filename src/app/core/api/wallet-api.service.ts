import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BalanceResponse, CreateWalletRequest, Page, Wallet } from '../models/wallet.model';
import {
  DepositRequest,
  PayFacturesRequest,
  PayRequest,
  PaymentResponse,
  Transaction,
  TransferRequest,
  TransferResponse,
  WithdrawRequest,
  WithdrawResponse,
} from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class WalletApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/wallets';

  list(page: number, size: number): Observable<Page<Wallet>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Wallet>>(this.base, { params });
  }

  create(body: CreateWalletRequest): Observable<Wallet> {
    return this.http.post<Wallet>(this.base, body);
  }

  getByPhone(phone: string): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.base}/${phone}`);
  }

  getBalance(phone: string): Observable<number> {
    return this.http
      .get<BalanceResponse>(`${this.base}/${phone}/balance`)
      .pipe(map((response) => response.balance));
  }

  deposit(walletId: number, body: DepositRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/${walletId}/deposit`, body);
  }

  withdraw(body: WithdrawRequest): Observable<WithdrawResponse> {
    return this.http.post<WithdrawResponse>(`${this.base}/withdraw`, body);
  }

  transfer(body: TransferRequest): Observable<TransferResponse> {
    return this.http.post<TransferResponse>(`${this.base}/transfer`, body);
  }

  pay(body: PayRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.base}/pay`, body);
  }

  payFactures(body: PayFacturesRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.base}/pay-factures`, body);
  }

  transactions(phone: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.base}/${phone}/transactions`);
  }
}
