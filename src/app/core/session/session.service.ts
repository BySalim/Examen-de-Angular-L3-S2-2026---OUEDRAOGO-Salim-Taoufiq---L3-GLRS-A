import { Injectable, computed, signal } from '@angular/core';

export type Role = 'agent' | 'client';

export interface Session {
  role: Role;
  phone: string | null;
  code: string | null;
  walletId: number | null;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storageKey = 'kora-session';
  private readonly current = signal<Session | null>(this.restore());

  readonly session = this.current.asReadonly();
  readonly isAuthenticated = computed(() => this.current() !== null);
  readonly role = computed(() => this.current()?.role ?? null);
  readonly phone = computed(() => this.current()?.phone ?? null);
  readonly code = computed(() => this.current()?.code ?? null);
  readonly walletId = computed(() => this.current()?.walletId ?? null);

  loginAsAgent(): void {
    this.persist({ role: 'agent', phone: null, code: null, walletId: null });
  }

  loginAsClient(phone: string, code: string, walletId: number): void {
    this.persist({ role: 'client', phone, code, walletId });
  }

  logout(): void {
    this.current.set(null);
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      /* stockage indisponible */
    }
  }

  private persist(session: Session): void {
    this.current.set(session);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    } catch {
      /* stockage indisponible */
    }
  }

  private restore(): Session | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}
