import { Injectable, signal } from '@angular/core';

export type NotificationTone = 'info' | 'success' | 'warning' | 'danger';

export interface AppNotification {
  id: number;
  message: string;
  detail?: string;
  tone: NotificationTone;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;
  private readonly notificationState = signal<readonly AppNotification[]>([]);
  readonly notifications = this.notificationState.asReadonly();

  show(
    message: string,
    options: { detail?: string; tone?: NotificationTone; durationMs?: number } = {},
  ): void {
    const notification: AppNotification = {
      id: this.nextId++,
      message,
      detail: options.detail,
      tone: options.tone ?? 'info',
    };

    this.notificationState.update((items) => [...items, notification].slice(-3));

    if (options.durationMs !== 0 && typeof window !== 'undefined') {
      window.setTimeout(() => this.dismiss(notification.id), options.durationMs ?? 6000);
    }
  }

  dismiss(id: number): void {
    this.notificationState.update((items) => items.filter((item) => item.id !== id));
  }
}
