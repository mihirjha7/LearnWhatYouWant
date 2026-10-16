import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetailsService } from './problem-details.service';

describe('ProblemDetailsService', () => {
  const service = new ProblemDetailsService();

  it('parses RFC 9457 payloads including field errors', () => {
    const problem = service.fromHttpError(new HttpErrorResponse({
      status: 422,
      error: { title: 'Validation failed', status: 422, code: 'validation_failed', traceId: 'abc', errors: { email: ['Required'], age: [3] } },
    }));
    expect(problem.title).toBe('Validation failed');
    expect(problem.code).toBe('validation_failed');
    expect(problem.errors?.['email']).toEqual(['Required']);
    expect(problem.errors?.['age']).toEqual([]);
  });

  it('falls back to safe defaults for opaque failures', () => {
    const offline = service.fromHttpError(new HttpErrorResponse({ status: 0 }));
    expect(offline.title).toBe('You appear to be offline');
    expect(offline.detail).toContain('unsaved work');
    expect(service.fromHttpError(new HttpErrorResponse({ status: 409 })).title).toContain('changed');
  });
});
