import { Injectable, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../shared/toast/toast.service';

export type Role = 'agent' | 'client';

interface TokenPayload {
  sub: string;
  role: Role;
  name: string;
  phone: string | null;
  code: string | null;
  walletId: number | null;
  exp: number;
}

const AGENT_USERNAME = 'agent';
const AGENT_PASSWORD = 'agent123';
const SESSION_TTL_MS = 30 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly toast = inject(ToastService);
  private readonly storageKey = 'kora-token';
  private readonly token = signal<string | null>(this.restore());
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly payload = computed<TokenPayload | null>(() => this.decodeValid(this.token()));

  readonly isAuthenticated = computed(() => this.payload() !== null);
  readonly role = computed(() => this.payload()?.role ?? null);
  readonly phone = computed(() => this.payload()?.phone ?? null);
  readonly code = computed(() => this.payload()?.code ?? null);
  readonly walletId = computed(() => this.payload()?.walletId ?? null);
  readonly name = computed(() => this.payload()?.name ?? null);

  constructor() {
    this.scheduleExpiry();
  }

  loginAgent(username: string, password: string): boolean {
    if (username.trim() !== AGENT_USERNAME || password !== AGENT_PASSWORD) {
      return false;
    }
    this.issue({ sub: username, role: 'agent', name: 'Agent de guichet', phone: null, code: null, walletId: null });
    return true;
  }

  loginClient(phone: string, code: string, walletId: number): void {
    this.issue({ sub: phone, role: 'client', name: 'Client', phone, code, walletId });
  }

  logout(): void {
    this.clearExpiry();
    this.token.set(null);
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      /* stockage indisponible */
    }
  }

  getToken(): string | null {
    return this.decodeValid(this.token()) ? this.token() : null;
  }

  private issue(base: Omit<TokenPayload, 'exp'>): void {
    const payload: TokenPayload = { ...base, exp: Date.now() + SESSION_TTL_MS };
    const token = [
      this.encode({ alg: 'HS256', typ: 'JWT' }),
      this.encode(payload),
      'kora-signature',
    ].join('.');
    this.token.set(token);
    try {
      localStorage.setItem(this.storageKey, token);
    } catch {
      /* stockage indisponible */
    }
    this.scheduleExpiry();
  }

  private scheduleExpiry(): void {
    this.clearExpiry();
    const payload = this.decodeValid(this.token());
    if (!payload) {
      return;
    }
    const remaining = payload.exp - Date.now();
    if (remaining <= 0) {
      this.token.set(null);
      return;
    }
    this.expiryTimer = setTimeout(() => this.expire(), remaining);
  }

  private expire(): void {
    this.expiryTimer = null;
    this.token.set(null);
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      /* stockage indisponible */
    }
    this.toast.warning('Votre session a expiré, veuillez vous reconnecter.');
  }

  private clearExpiry(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private decodeValid(token: string | null): TokenPayload | null {
    if (!token) {
      return null;
    }
    try {
      const json = decodeURIComponent(escape(atob(token.split('.')[1])));
      const payload = JSON.parse(json) as TokenPayload;
      return payload.exp && payload.exp > Date.now() ? payload : null;
    } catch {
      return null;
    }
  }

  private encode(value: unknown): string {
    return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
  }

  private restore(): string | null {
    try {
      return localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }
}
