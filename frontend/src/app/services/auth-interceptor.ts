import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { RuntimeConfigService } from '../core/config/runtime-config';
import { AuthTokenStore } from '../core/session/auth-token-store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(RuntimeConfigService);
  const token = inject(AuthTokenStore).read();

  if (!token || !config.isApiUrl(request.url) || request.headers.has('Authorization')) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
