import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-2 border-t border-hairline px-4 py-3 text-sm">
      <span class="text-content-subtle">{{ total() }} élément(s)</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn-ghost !px-2 !py-1.5"
          [disabled]="total() === 0 || pageIndex() === 0"
          (click)="go(pageIndex() - 1)"
          aria-label="Page précédente"
        >
          <app-icon name="chevron-left" [size]="18" />
        </button>
        <span class="tabular text-content-muted">Page {{ pageIndex() + 1 }} / {{ totalPages() }}</span>
        <button
          type="button"
          class="btn-ghost !px-2 !py-1.5"
          [disabled]="pageIndex() >= totalPages() - 1"
          (click)="go(pageIndex() + 1)"
          aria-label="Page suivante"
        >
          <app-icon name="chevron-right" [size]="18" />
        </button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(0);
  private pageSizeValue = 10;

  @Input({ required: true }) set length(value: number) {
    this.total.set(value);
  }

  @Input() set index(value: number) {
    this.pageIndex.set(value);
  }

  @Input() set pageSize(value: number) {
    this.pageSizeValue = value;
  }

  @Output() indexChange = new EventEmitter<number>();

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSizeValue)));

  protected go(target: number): void {
    if (target >= 0 && target < this.totalPages()) {
      this.indexChange.emit(target);
    }
  }
}
