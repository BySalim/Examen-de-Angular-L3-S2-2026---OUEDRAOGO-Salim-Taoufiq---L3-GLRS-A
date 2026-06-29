import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Facture } from '../models/facture.model';

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/external/factures';

  current(walletCode: string, unite?: string): Observable<Facture[]> {
    let params = new HttpParams();
    if (unite) {
      params = params.set('unite', unite);
    }
    return this.http.get<Facture[]>(`${this.base}/${walletCode}/current`, { params });
  }

  periode(walletCode: string, debut: string, fin: string, unite?: string): Observable<Facture[]> {
    let params = new HttpParams().set('debut', debut).set('fin', fin);
    if (unite) {
      params = params.set('unite', unite);
    }
    return this.http.get<Facture[]>(`${this.base}/${walletCode}/periode`, { params });
  }
}
