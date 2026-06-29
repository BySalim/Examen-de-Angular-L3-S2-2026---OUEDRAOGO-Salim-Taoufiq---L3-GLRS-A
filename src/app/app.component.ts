import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SessionService } from './core/session/session.service';
import { ToastHostComponent } from './shared/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastHostComponent],
  template: `
    <router-outlet />
    <app-toast-host />
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
