import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role, SessionService } from '../session/session.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export function roleGuard(role: Role): CanActivateFn {
  return () => {
    const session = inject(SessionService);
    const router = inject(Router);

    if (!session.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }
    if (session.role() === role) {
      return true;
    }
    return router.createUrlTree([session.role() === 'agent' ? '/admin/wallets' : '/dashboard']);
  };
}
