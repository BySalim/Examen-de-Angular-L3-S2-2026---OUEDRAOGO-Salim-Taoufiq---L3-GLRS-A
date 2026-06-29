import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-bills-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="mb-6">
      <h1 class="text-xl font-semibold tracking-tight text-content">Factures</h1>
      <p class="mt-1 text-sm text-content-muted">Consultez et réglez vos factures ISM et WOYAFAL.</p>
    </header>

    <div class="mb-5 inline-flex gap-1 rounded-xl bg-surface-2 p-1">
      <a
        routerLink="current"
        routerLinkActive="bg-surface text-content shadow-soft"
        class="rounded-lg px-4 py-2 text-sm font-medium text-content-muted transition-colors"
      >Du mois</a>
      <a
        routerLink="history"
        routerLinkActive="bg-surface text-content shadow-soft"
        class="rounded-lg px-4 py-2 text-sm font-medium text-content-muted transition-colors"
      >Historique</a>
    </div>

    <router-outlet />
  `,
})
export class BillsLayoutComponent {}
