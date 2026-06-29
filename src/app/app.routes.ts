import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/role.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './features/auth/login.component';
import { PlaceholderComponent } from './shared/ui/placeholder.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: PlaceholderComponent,
        canActivate: [roleGuard('client')],
        data: { title: 'Tableau de bord', icon: 'dashboard', description: 'Solde, dépenses et raccourcis.' },
      },
      {
        path: 'transactions',
        component: PlaceholderComponent,
        canActivate: [roleGuard('client')],
        data: { title: 'Transactions', icon: 'history', description: 'Historique détaillé de vos mouvements.' },
      },
      {
        path: 'transfer',
        component: PlaceholderComponent,
        canActivate: [roleGuard('client')],
        data: { title: 'Transfert', icon: 'transfer', description: "Envoyez de l'argent à un autre portefeuille." },
      },
      {
        path: 'bills',
        canActivate: [roleGuard('client')],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'current' },
          {
            path: 'current',
            component: PlaceholderComponent,
            data: { title: 'Factures du mois', icon: 'receipt', description: 'Consultez et payez vos factures impayées.' },
          },
          {
            path: 'history',
            component: PlaceholderComponent,
            data: { title: 'Historique des paiements', icon: 'history', description: 'Vos paiements de factures passés.' },
          },
        ],
      },
      {
        path: 'admin/wallets',
        component: PlaceholderComponent,
        canActivate: [roleGuard('agent')],
        data: { title: 'Portefeuilles', icon: 'wallet', description: 'Listing, création, recherche et opérations.' },
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
