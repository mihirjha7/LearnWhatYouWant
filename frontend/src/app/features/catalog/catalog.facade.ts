import { Injectable, inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config';
import { CatalogGateway } from '../../data-access/contracts/catalog.gateway';
import {
  CatalogCourseDetail,
  CatalogCourseSummary,
  CatalogQuery,
  EnrollmentResult,
  LearningPathSummary,
} from '../../data-access/contracts/catalog.models';
import { PagedResponse } from '../../data-access/contracts/paged-response';
import { LegacyCatalogGateway } from '../../data-access/http/legacy-catalog.gateway';
import { MockCatalogGateway } from '../../data-access/mock/mock-catalog.gateway';

@Injectable({ providedIn: 'root' })
export class CatalogFacade {
  private readonly config = inject(RuntimeConfigService);
  private readonly mockGateway = inject(MockCatalogGateway);
  private readonly legacyGateway = inject(LegacyCatalogGateway);

  listCourses(query?: CatalogQuery): Observable<PagedResponse<CatalogCourseSummary>> {
    return this.withFallback((gateway) => gateway.listCourses(query));
  }

  getCourse(courseId: string): Observable<CatalogCourseDetail | null> {
    return this.withFallback((gateway) => gateway.getCourse(courseId));
  }

  listLearningPaths(): Observable<readonly LearningPathSummary[]> {
    return this.withFallback((gateway) => gateway.listLearningPaths());
  }

  getLearningPath(pathId: string): Observable<LearningPathSummary | null> {
    return this.withFallback((gateway) => gateway.getLearningPath(pathId));
  }

  enroll(courseId: string): Observable<EnrollmentResult> {
    return this.selectedGateway.enroll(courseId);
  }

  private withFallback<T>(request: (gateway: CatalogGateway) => Observable<T>): Observable<T> {
    const selected = this.selectedGateway;
    return request(selected).pipe(
      catchError((error) => {
        if (selected !== this.mockGateway && this.config.isFeatureEnabled('mockPlatform')) {
          return request(this.mockGateway);
        }
        return throwError(() => error);
      }),
    );
  }

  private get selectedGateway(): CatalogGateway {
    return this.config.dataMode === 'mock' ? this.mockGateway : this.legacyGateway;
  }
}
