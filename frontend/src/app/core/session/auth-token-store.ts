import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth_token';
const LEGACY_TOKEN_KEY = 'authToken';

@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  read(): string | null {
    const storage = this.storage;
    if (!storage) {
      return null;
    }

    const token = storage.getItem(TOKEN_KEY);
    const legacyToken = storage.getItem(LEGACY_TOKEN_KEY);

    if (!token && legacyToken) {
      storage.setItem(TOKEN_KEY, legacyToken);
      storage.removeItem(LEGACY_TOKEN_KEY);
      return legacyToken;
    }

    return token;
  }

  write(token: string): void {
    const storage = this.storage;
    if (!storage) {
      return;
    }

    storage.setItem(TOKEN_KEY, token);
    storage.removeItem(LEGACY_TOKEN_KEY);
  }

  clear(): void {
    const storage = this.storage;
    storage?.removeItem(TOKEN_KEY);
    storage?.removeItem(LEGACY_TOKEN_KEY);
  }

  private get storage(): Storage | null {
    return typeof window === 'undefined' ? null : window.localStorage;
  }
}
