import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SessionService } from './core/session/session.service';
import { ToastHostComponent } from './shared/toast/toast.component';
import { ConfirmHostComponent } from './shared/ui/confirm.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastHostComponent, ConfirmHostComponent],
  template: `
    <router-outlet />
    <app-toast-host />
    <app-confirm-host />
  `,
})
export class AppComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (!this.session.isAuthenticated() && !this.router.url.startsWith('/login')) {
        this.router.navigate(['/login']);
      }
    });
  }
}
