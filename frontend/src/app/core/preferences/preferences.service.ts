import { Injectable, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_KEY = 'learnova_theme';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly themeState = signal<ThemePreference>(this.readTheme());
  readonly theme = this.themeState.asReadonly();

  constructor() {
    this.applyTheme(this.themeState());
  }

  toggleTheme(): void {
    this.setTheme(this.resolvedTheme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemePreference): void {
    this.themeState.set(theme);
    this.applyTheme(theme);

    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The preference remains active for this page when storage is unavailable.
    }
  }

  resolvedTheme(): 'light' | 'dark' {
    const theme = this.themeState();
    if (theme !== 'system') return theme;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private applyTheme(theme: ThemePreference): void {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset['theme'] =
      theme === 'system' ? this.resolvedTheme() : theme;
  }

  private readTheme(): ThemePreference {
    if (typeof window === 'undefined') return 'system';

    try {
      const storedTheme = window.localStorage.getItem(THEME_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        return storedTheme;
      }
    } catch {
      return 'system';
    }

    return 'system';
  }
}
