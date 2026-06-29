import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../core/session/session.service';
import { ThemeService } from '../core/theme/theme.service';
import { BalanceStore } from '../core/state/balance.store';
import { LoadingService } from '../core/loading/loading.service';
import { ConfirmService } from '../core/confirm/confirm.service';
import { IconComponent } from '../shared/ui/icon.component';
import { XofPipe } from '../shared/pipes/xof.pipe';
import { PhonePipe } from '../shared/pipes/phone.pipe';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, XofPipe, PhonePipe],
  template: `
    <div class="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <!-- Sidebar -->
      @if (drawerOpen()) {
        <div class="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" (click)="drawerOpen.set(false)"></div>
      }
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-[260px] -translate-x-full flex-col border-r border-hairline bg-surface transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
        [class.translate-x-0]="drawerOpen()"
      >
        <div class="flex h-16 shrink-0 items-center gap-2.5 px-5">
          <span class="grid h-9 w-9 place-items-center rounded-xl text-white shadow-soft" style="background-image: linear-gradient(135deg, #0d9488, #0f766e);">
            <app-icon name="wallet" [size]="20" />
          </span>
          <div class="leading-tight">
            <p class="text-sm font-semibold text-content">BadWallet</p>
            <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-content-subtle">Kóra</p>
          </div>
        </div>

        <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          <p class="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">Menu</p>
          @for (item of nav(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-primary/10 font-semibold text-primary"
              [routerLinkActiveOptions]="{ exact: false }"
              (click)="drawerOpen.set(false)"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-content-muted transition-colors hover:bg-surface-2 hover:text-content"
            >
              <app-icon [name]="item.icon" [size]="19" />
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="shrink-0 px-3 pb-3 pt-2">
          <div class="flex items-center gap-3 rounded-xl border border-hairline px-3 py-2.5">
            <span class="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-content-muted">
              <app-icon [name]="role() === 'agent' ? 'shield' : 'user'" [size]="17" />
            </span>
            <div class="min-w-0 flex-1 leading-tight">
              <p class="truncate text-xs font-semibold text-content">{{ role() === 'agent' ? 'Agent de guichet' : 'Client' }}</p>
              @if (role() === 'client') {
                <p class="truncate text-[11px] text-content-subtle tabular">{{ phone() | phone }}</p>
              }
            </div>
            <button type="button" class="text-content-subtle transition-colors hover:text-danger" (click)="logout()" aria-label="Déconnexion">
              <app-icon name="logout" [size]="18" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex min-h-screen flex-col">
        <header class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-hairline bg-bg/80 px-4 backdrop-blur sm:px-6">
          <button type="button" class="text-content-muted lg:hidden" (click)="drawerOpen.set(true)" aria-label="Menu">
            <app-icon name="menu" [size]="22" />
          </button>

          <p class="hidden text-sm font-medium text-content-muted sm:block">
            {{ role() === 'agent' ? 'Espace agent' : 'Mon espace' }}
          </p>

          <div class="ml-auto flex items-center gap-2 sm:gap-3">
            @if (role() === 'client') {
              <div class="flex items-center gap-2 rounded-xl border border-hairline bg-surface px-3 py-1.5">
                <span class="text-content-subtle"><app-icon name="wallet" [size]="16" /></span>
                <span class="text-sm font-semibold text-content tabular">{{ balance.balance() | xof }}</span>
              </div>
            }
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-xl border border-hairline bg-surface text-content-muted transition-colors hover:text-content"
              (click)="theme.toggle()"
              aria-label="Changer de thème"
            >
              <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="18" />
            </button>
          </div>
        </header>

        @if (loading.loading()) {
          <div class="h-0.5 w-full overflow-hidden bg-primary/20">
            <div class="h-full w-1/3 animate-[shimmer_1s_infinite] bg-primary"></div>
          </div>
        }

        <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly balance = inject(BalanceStore);
  protected readonly loading = inject(LoadingService);
  private readonly session = inject(SessionService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);

  protected readonly drawerOpen = signal(false);
  protected readonly role = this.session.role;
  protected readonly phone = this.session.phone;

  private readonly clientNav: NavItem[] = [
    { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard' },
    { label: 'Transactions', path: '/transactions', icon: 'history' },
    { label: 'Transfert', path: '/transfer', icon: 'transfer' },
    { label: 'Factures', path: '/bills', icon: 'receipt' },
  ];

  private readonly agentNav: NavItem[] = [
    { label: 'Portefeuilles', path: '/admin/wallets', icon: 'wallet' },
  ];

  protected readonly nav = computed(() => (this.role() === 'agent' ? this.agentNav : this.clientNav));

  constructor() {
    effect(() => {
      const phone = this.session.phone();
      if (this.session.role() === 'client' && phone) {
        this.balance.refresh(phone);
      }
    });
  }

  protected async logout(): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Se déconnecter',
      message: 'Voulez-vous vraiment quitter votre session ?',
      confirmLabel: 'Se déconnecter',
    });
    if (!confirmed) {
      return;
    }
    this.balance.clear();
    this.session.logout();
    this.router.navigate(['/login']);
  }
}
