import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';

const PHONE_PATTERN = /^\+221\d{9}$/;

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) {
      return null;
    }
    return PHONE_PATTERN.test(value) ? null : { phone: true };
  };
}

export function differentPhoneValidator(own: () => string | null): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const destination = group.get('destination')?.value as string;
    if (!destination) {
      return null;
    }
    return destination === own() ? { samePhone: true } : null;
  };
}

export function recipientExistsValidator(check: (phone: string) => Observable<boolean>): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value as string;
    if (!value || !PHONE_PATTERN.test(value)) {
      return of(null);
    }
    return timer(400).pipe(
      switchMap(() => check(value)),
      map((exists) => (exists ? null : { recipientNotFound: true })),
      catchError(() => of({ recipientNotFound: true })),
    );
  };
}
