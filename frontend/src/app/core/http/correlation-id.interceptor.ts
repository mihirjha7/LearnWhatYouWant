import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { RuntimeConfigService } from '../config/runtime-config';

export const correlationIdInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(RuntimeConfigService);
  if (!config.isApiUrl(request.url) || request.headers.has('X-Correlation-ID')) {
    return next(request);
  }

  const correlationId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return next(request.clone({ setHeaders: { 'X-Correlation-ID': correlationId } }));
};
