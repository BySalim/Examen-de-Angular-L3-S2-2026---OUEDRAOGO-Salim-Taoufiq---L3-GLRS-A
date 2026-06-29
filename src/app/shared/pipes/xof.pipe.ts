import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'xof', standalone: true })
export class XofPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '—';
    }
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      currencyDisplay: 'code',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
