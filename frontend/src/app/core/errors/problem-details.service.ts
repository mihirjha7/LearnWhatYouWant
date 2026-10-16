import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProblemDetails } from './problem-details';

@Injectable({ providedIn: 'root' })
export class ProblemDetailsService {
  fromHttpError(error: HttpErrorResponse): ProblemDetails {
    const payload = this.asRecord(error.error);

    return {
      type: this.readString(payload, 'type'),
      title: this.readString(payload, 'title') ?? this.defaultTitle(error.status),
      status: this.readNumber(payload, 'status') ?? error.status,
      detail: this.readString(payload, 'detail') ?? this.safeMessage(error),
      instance: this.readString(payload, 'instance'),
      code: this.readString(payload, 'code'),
      traceId: this.readString(payload, 'traceId'),
      errors: this.readErrors(payload),
    };
  }

  private defaultTitle(status: number): string {
    if (status === 0) return 'You appear to be offline';
    if (status === 401) return 'Your session has expired';
    if (status === 403) return 'You do not have permission for this action';
    if (status === 404) return 'The requested item was not found';
    if (status === 409) return 'This item changed while you were working';
    if (status === 429) return 'Too many requests';
    if (status >= 500) return 'The service is temporarily unavailable';
    return 'We could not complete that request';
  }

  private safeMessage(error: HttpErrorResponse): string | undefined {
    return error.status === 0 ? 'Check your connection. Your unsaved work remains on this page.' : undefined;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }

  private readString(record: Record<string, unknown> | null, key: string): string | undefined {
    const value = record?.[key];
    return typeof value === 'string' && value.trim() ? value : undefined;
  }

  private readNumber(record: Record<string, unknown> | null, key: string): number | undefined {
    const value = record?.[key];
    return typeof value === 'number' ? value : undefined;
  }

  private readErrors(
    record: Record<string, unknown> | null,
  ): Readonly<Record<string, readonly string[]>> | undefined {
    const errors = this.asRecord(record?.['errors']);
    if (!errors) {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [
        field,
        Array.isArray(messages)
          ? messages.filter((message): message is string => typeof message === 'string')
          : [],
      ]),
    );
  }
}
