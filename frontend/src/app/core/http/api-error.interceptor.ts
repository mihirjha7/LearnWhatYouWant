import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { RuntimeConfigService } from '../config/runtime-config';
import { ProblemDetailsService } from '../errors/problem-details.service';
import { NotificationService, NotificationTone } from '../notifications/notification.service';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(RuntimeConfigService);
  const problemDetails = inject(ProblemDetailsService);
  const notifications = inject(NotificationService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && config.isApiUrl(request.url)) {
        const problem = problemDetails.fromHttpError(error);
        if (shouldNotify(problem.status)) {
          notifications.show(problem.title, {
            detail: problem.detail,
            tone: toneForStatus(problem.status),
            durationMs: problem.status === 0 ? 0 : 7000,
          });
        }
      }

      return throwError(() => error);
    }),
  );
};

function shouldNotify(status: number): boolean {
  return status === 0 || status === 401 || status === 403 || status === 429 || status >= 500;
}

function toneForStatus(status: number): NotificationTone {
  if (status === 0 || status === 429) return 'warning';
  return status >= 400 ? 'danger' : 'info';
}
