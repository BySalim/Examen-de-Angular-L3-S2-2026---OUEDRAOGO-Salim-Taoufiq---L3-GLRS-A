import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly request = signal<ConfirmRequest | null>(null);

  ask(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.request.set({ ...options, resolve });
    });
  }

  confirm(): void {
    this.settle(true);
  }

  cancel(): void {
    this.settle(false);
  }

  private settle(confirmed: boolean): void {
    const current = this.request();
    if (current) {
      current.resolve(confirmed);
      this.request.set(null);
    }
  }
}
