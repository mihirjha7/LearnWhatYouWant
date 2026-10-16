import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './services/auth-interceptor';
import { RuntimeConfigService } from './core/config/runtime-config';
import { correlationIdInterceptor } from './core/http/correlation-id.interceptor';
import { apiErrorInterceptor } from './core/http/api-error.interceptor';
import { provideGateways } from './data-access/gateway.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(() => inject(RuntimeConfigService).load()),
    provideRouter(routes),
    provideAnimations(),
    provideGateways(),
    provideHttpClient(
      withInterceptors([correlationIdInterceptor, authInterceptor, apiErrorInterceptor]),
    ),
  ],
};
