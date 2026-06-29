import { Component, Input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [IconComponent],
  template: `
    <section class="mx-auto max-w-lg">
      <div class="card flex flex-col items-center gap-4 px-6 py-14 text-center">
        <span class="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <app-icon [name]="icon" [size]="28" />
        </span>
        <div>
          <h1 class="text-lg font-semibold text-content">{{ title }}</h1>
          <p class="mt-1 text-sm text-content-muted">{{ description }}</p>
        </div>
        <span class="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-content-subtle">Bientôt disponible</span>
      </div>
    </section>
  `,
})
export class PlaceholderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon = 'wallet';
}
