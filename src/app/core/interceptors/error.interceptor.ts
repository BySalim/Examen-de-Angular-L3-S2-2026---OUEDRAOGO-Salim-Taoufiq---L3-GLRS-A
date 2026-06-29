import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toast = inject(ToastService);
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      toast.error(messageFor(error));
      return throwError(() => error);
    }),
  );
};

function messageFor(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return "Service indisponible : vérifiez que l'API BadWallet est démarrée.";
  }
  const body = error.error as { message?: string } | undefined;
  if (body && typeof body === 'object' && body.message) {
    return body.message;
  }
  switch (error.status) {
    case 400:
      return 'Requête invalide.';
    case 404:
      return 'Ressource introuvable.';
    case 409:
      return 'Conflit : la ressource existe déjà.';
    case 422:
      return 'Opération impossible : fonds insuffisants ou données invalides.';
    default:
      return 'Une erreur est survenue.';
  }
}
