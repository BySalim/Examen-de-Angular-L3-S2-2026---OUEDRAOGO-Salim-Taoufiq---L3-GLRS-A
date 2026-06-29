import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../session/session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(SessionService).getToken();
  if (token) {
    request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(request);
};
