import { Injectable, effect, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'kora-theme';
  readonly theme = signal<Theme>(this.initialTheme());

  constructor() {
    effect(() => {
      const current = this.theme();
      document.documentElement.classList.toggle('dark', current === 'dark');
      try {
        localStorage.setItem(this.storageKey, current);
      } catch {
        /* stockage indisponible */
      }
    });
  }

  toggle(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  private initialTheme(): Theme {
    try {
      return localStorage.getItem(this.storageKey) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
}
