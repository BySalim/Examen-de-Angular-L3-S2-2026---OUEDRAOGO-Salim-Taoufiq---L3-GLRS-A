import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/role.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './features/auth/login.component';
import { PlaceholderComponent } from './shared/ui/placeholder.component';
import { WalletsPageComponent } from './features/agent/wallets-page.component';
import { DashboardPageComponent } from './features/client/dashboard-page.component';
import { TransferPageComponent } from './features/client/transfer-page.component';
import { BillsLayoutComponent } from './features/client/bills-layout.component';
import { BillsCurrentComponent } from './features/client/bills-current.component';
import { BillsHistoryComponent } from './features/client/bills-history.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardPageComponent,
        canActivate: [roleGuard('client')],
      },
      {
        path: 'transactions',
        component: PlaceholderComponent,
        canActivate: [roleGuard('client')],
        data: { title: 'Transactions', icon: 'history', description: 'Historique détaillé de vos mouvements.' },
      },
      {
        path: 'transfer',
        component: TransferPageComponent,
        canActivate: [roleGuard('client')],
      },
      {
        path: 'bills',
        component: BillsLayoutComponent,
        canActivate: [roleGuard('client')],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'current' },
          { path: 'current', component: BillsCurrentComponent },
          { path: 'history', component: BillsHistoryComponent },
        ],
      },
      {
        path: 'admin/wallets',
        component: WalletsPageComponent,
        canActivate: [roleGuard('agent')],
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
