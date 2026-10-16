import { DestroyRef, Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OnlineStatusService {
  private readonly onlineState = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  readonly online = this.onlineState.asReadonly();

  constructor() {
    if (typeof window === 'undefined') return;
    const update = () => this.onlineState.set(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    });
  }
}
