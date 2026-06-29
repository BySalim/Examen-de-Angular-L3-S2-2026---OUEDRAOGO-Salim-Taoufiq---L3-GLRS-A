import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'phone', standalone: true })
export class PhonePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    const cleaned = value.replace(/\s+/g, '');
    const match = cleaned.match(/^\+221(\d{2})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+221 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
    return value;
  }
}
