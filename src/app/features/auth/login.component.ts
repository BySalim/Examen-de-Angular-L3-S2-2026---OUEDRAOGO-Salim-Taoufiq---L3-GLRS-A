import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WalletApiService } from '../../core/api/wallet-api.service';
import { SessionService } from '../../core/session/session.service';
import { ThemeService } from '../../core/theme/theme.service';
import { IconComponent } from '../../shared/ui/icon.component';

const CLIENT_PIN = '1234';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    <div class="grid min-h-screen lg:grid-cols-2">
      <div
        class="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between"
        style="background-image: linear-gradient(155deg, #0d9488 0%, #0f766e 42%, #0b3b39 100%);"
      >
        <div class="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full" style="background:rgb(245 158 11 / 0.18); filter: blur(70px);"></div>

        <div class="relative flex items-center gap-3">
          <span class="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <app-icon name="wallet" [size]="22" />
          </span>
          <div class="leading-tight">
            <p class="text-lg font-semibold">BadWallet</p>
            <p class="text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">Kóra Dashboard</p>
          </div>
        </div>

        <div class="relative">
          <h2 class="max-w-sm text-3xl font-semibold leading-tight tracking-tight">Vos portefeuilles, en toute simplicité.</h2>
          <p class="mt-3 max-w-sm text-sm text-white/70">Dépôts, retraits, transferts et paiements de factures réunis dans un espace clair et instantané.</p>

          <div class="mt-8 max-w-xs rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lift backdrop-blur-md">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wide text-white/60">Solde disponible</span>
              <span class="grid h-8 w-8 place-items-center rounded-lg bg-white/15"><app-icon name="trending-up" [size]="16" /></span>
            </div>
            <p class="mt-3 text-3xl font-semibold tracking-tight tabular">1 250 000 <span class="text-base font-medium text-white/60">XOF</span></p>
            <div class="mt-4 flex items-center gap-2">
              <span class="rounded-md px-2 py-0.5 text-[11px] font-bold text-slate-900" style="background:rgb(245 158 11 / 0.95);">VISA</span>
              <span class="text-sm text-white/70 tabular">•••• 0003</span>
            </div>
          </div>
        </div>

        <ul class="relative space-y-2.5 text-sm text-white/80">
          <li class="flex items-center gap-2.5"><app-icon name="check" [size]="17" /> Transferts instantanés entre portefeuilles</li>
          <li class="flex items-center gap-2.5"><app-icon name="check" [size]="17" /> Paiement des factures ISM &amp; WOYAFAL</li>
          <li class="flex items-center gap-2.5"><app-icon name="check" [size]="17" /> Solde et historique en temps réel</li>
        </ul>
      </div>

      <div class="relative flex items-center justify-center px-5 py-12">
        <button
          type="button"
          class="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl border border-hairline bg-surface text-content-muted transition-colors hover:text-content"
          (click)="theme.toggle()"
          aria-label="Changer de thème"
        >
          <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="18" />
        </button>

        <div class="w-full max-w-sm">
          <div class="mb-7">
            <span class="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-fg shadow-soft lg:hidden">
              <app-icon name="wallet" [size]="22" />
            </span>
            <h1 class="text-2xl font-semibold tracking-tight text-content">Connexion</h1>
            <p class="mt-1 text-sm text-content-muted">Accédez à votre espace BadWallet.</p>
          </div>

          <div class="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
            <button type="button" class="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors"
              [class]="role() === 'client' ? 'bg-surface text-content shadow-soft' : 'text-content-muted hover:text-content'"
              (click)="setRole('client')">
              <app-icon name="user" [size]="16" /> Client
            </button>
            <button type="button" class="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors"
              [class]="role() === 'agent' ? 'bg-surface text-content shadow-soft' : 'text-content-muted hover:text-content'"
              (click)="setRole('agent')">
              <app-icon name="shield" [size]="16" /> Agent
            </button>
          </div>

          @if (error()) {
            <div class="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
              <app-icon name="alert" [size]="16" /> {{ error() }}
            </div>
          }

          @if (role() === 'client') {
            <form [formGroup]="clientForm" (ngSubmit)="loginClient()" class="flex flex-col gap-4">
              <div>
                <label class="label" for="phone">Numéro de téléphone</label>
                <input id="phone" type="tel" formControlName="phone" placeholder="+221770000003" class="input tabular"
                  [class.input-error]="invalid(clientForm.controls.phone)" />
                @if (invalid(clientForm.controls.phone)) { <p class="field-error">Format attendu : +221 suivi de 9 chiffres.</p> }
              </div>
              <div>
                <label class="label" for="pin">Code PIN</label>
                <input id="pin" type="password" inputmode="numeric" formControlName="pin" placeholder="••••" class="input tabular tracking-widest"
                  [class.input-error]="invalid(clientForm.controls.pin)" />
                @if (invalid(clientForm.controls.pin)) { <p class="field-error">PIN à 4 chiffres requis.</p> }
              </div>
              <button type="submit" class="btn-primary w-full" [disabled]="submitting()">
                @if (submitting()) { <span class="h-4 w-4 animate-spin rounded-full border-2 border-primary-fg/40 border-t-primary-fg"></span> }
                Se connecter
              </button>
              <p class="text-center text-xs text-content-subtle">Démo : +221770000003 · PIN 1234</p>
            </form>
          } @else {
            <form [formGroup]="agentForm" (ngSubmit)="loginAgent()" class="flex flex-col gap-4">
              <div>
                <label class="label" for="username">Identifiant</label>
                <input id="username" type="text" formControlName="username" placeholder="agent" class="input"
                  [class.input-error]="invalid(agentForm.controls.username)" />
                @if (invalid(agentForm.controls.username)) { <p class="field-error">Identifiant requis.</p> }
              </div>
              <div>
                <label class="label" for="password">Mot de passe</label>
                <input id="password" type="password" formControlName="password" placeholder="••••••••" class="input"
                  [class.input-error]="invalid(agentForm.controls.password)" />
                @if (invalid(agentForm.controls.password)) { <p class="field-error">Mot de passe requis.</p> }
              </div>
              <button type="submit" class="btn-primary w-full">
                <app-icon name="shield" [size]="18" /> Se connecter
              </button>
              <p class="text-center text-xs text-content-subtle">Démo : agent · agent123</p>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  protected readonly theme = inject(ThemeService);
  private readonly fb = inject(FormBuilder);
  private readonly walletApi = inject(WalletApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly role = signal<'client' | 'agent'>('client');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly clientForm = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+221\d{9}$/)]],
    pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
  });

  protected readonly agentForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected invalid(control: AbstractControl): boolean {
    return control.touched && control.invalid;
  }

  protected setRole(role: 'client' | 'agent'): void {
    this.role.set(role);
    this.error.set(null);
  }

  protected loginClient(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }
    const { phone, pin } = this.clientForm.getRawValue();
    this.submitting.set(true);
    this.error.set(null);
    this.walletApi.findByPhone(phone).subscribe((wallet) => {
      if (wallet && pin === CLIENT_PIN) {
        this.session.loginClient(phone, wallet.code, wallet.id);
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set('Numéro ou code PIN invalide.');
        this.submitting.set(false);
      }
    });
  }

  protected loginAgent(): void {
    if (this.agentForm.invalid) {
      this.agentForm.markAllAsTouched();
      return;
    }
    const { username, password } = this.agentForm.getRawValue();
    if (this.session.loginAgent(username, password)) {
      this.router.navigate(['/admin/wallets']);
    } else {
      this.error.set('Identifiant ou mot de passe incorrect.');
    }
  }
}
