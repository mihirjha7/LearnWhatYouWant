import { Injectable } from '@angular/core';
import { environment } from '../../../environment';

export type DataMode = 'mock' | 'legacy' | 'api-v1';

export interface RuntimeConfig {
  apiBaseUrl: string;
  uploadBaseUrl: string;
  dataMode: DataMode;
  featureFlags: Readonly<Record<string, boolean>>;
}

const DEFAULT_CONFIG: RuntimeConfig = {
  apiBaseUrl: environment.apiUrl,
  uploadBaseUrl: environment.uploadUrl,
  dataMode: 'legacy',
  featureFlags: {},
};

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private config: RuntimeConfig = DEFAULT_CONFIG;

  async load(): Promise<void> {
    try {
      const response = await fetch('app-config.json', {
        cache: 'no-store',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        return;
      }

      const value = (await response.json()) as Partial<RuntimeConfig>;
      this.config = {
        apiBaseUrl: this.normalizeBaseUrl(value.apiBaseUrl, DEFAULT_CONFIG.apiBaseUrl),
        uploadBaseUrl: this.normalizeBaseUrl(value.uploadBaseUrl, DEFAULT_CONFIG.uploadBaseUrl),
        dataMode: this.isDataMode(value.dataMode) ? value.dataMode : DEFAULT_CONFIG.dataMode,
        featureFlags: this.isFlagRecord(value.featureFlags) ? value.featureFlags : {},
      };
    } catch {
      this.config = DEFAULT_CONFIG;
    }
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  get uploadBaseUrl(): string {
    return this.config.uploadBaseUrl;
  }

  get dataMode(): DataMode {
    return this.config.dataMode;
  }

  apiUrl(path = ''): string {
    return this.join(this.apiBaseUrl, path);
  }

  uploadUrl(path: string | null | undefined): string | null {
    if (!path) {
      return null;
    }

    const relativePath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    if (/^[a-z][a-z\d+.-]*:/i.test(relativePath) || relativePath.startsWith('//')) {
      return null;
    }

    return this.join(this.uploadBaseUrl, relativePath);
  }

  isFeatureEnabled(flag: string): boolean {
    return this.config.featureFlags[flag] === true;
  }

  isApiUrl(url: string): boolean {
    try {
      const base = typeof document === 'undefined' ? 'http://localhost/' : document.baseURI;
      const requestUrl = new URL(url, base);
      const apiUrl = new URL(this.apiBaseUrl, base);
      const apiPath = apiUrl.pathname.endsWith('/') ? apiUrl.pathname : `${apiUrl.pathname}/`;
      const requestPath = requestUrl.pathname.endsWith('/')
        ? requestUrl.pathname
        : `${requestUrl.pathname}/`;

      return requestUrl.origin === apiUrl.origin && requestPath.startsWith(apiPath);
    } catch {
      return false;
    }
  }

  private join(baseUrl: string, path: string): string {
    return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`.replace(/\/$/, path ? '' : '/');
  }

  private normalizeBaseUrl(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private isDataMode(value: unknown): value is DataMode {
    return value === 'mock' || value === 'legacy' || value === 'api-v1';
  }

  private isFlagRecord(value: unknown): value is Record<string, boolean> {
    return (
      typeof value === 'object' &&
      value !== null &&
      Object.values(value).every((flagValue) => typeof flagValue === 'boolean')
    );
  }
}
