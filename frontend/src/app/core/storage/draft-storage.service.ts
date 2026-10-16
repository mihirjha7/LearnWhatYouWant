import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DraftStorageService {
  read(key: string): string {
    try {
      return window.sessionStorage.getItem(`learnova_draft_${key}`) ?? '';
    } catch {
      return '';
    }
  }

  write(key: string, value: string): void {
    try {
      window.sessionStorage.setItem(`learnova_draft_${key}`, value);
    } catch {
      // The editor remains usable when private browsing blocks storage.
    }
  }
}
