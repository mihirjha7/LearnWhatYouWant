import { Injectable, inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config';
import { LearnerGateway } from '../../data-access/contracts/learner.gateway';
import { LearnerCourseSummary, LearnerDashboardModel } from '../../data-access/contracts/learner.models';
import { LegacyLearnerGateway } from '../../data-access/http/legacy-learner.gateway';
import { MockLearnerGateway } from '../../data-access/mock/mock-learner.gateway';

@Injectable({ providedIn: 'root' })
export class LearnerFacade {
  private readonly config = inject(RuntimeConfigService);
  private readonly mock = inject(MockLearnerGateway);
  private readonly legacy = inject(LegacyLearnerGateway);

  getDashboard(): Observable<LearnerDashboardModel> {
    return this.withFallback((gateway) => gateway.getDashboard());
  }

  getMyLearning(): Observable<readonly LearnerCourseSummary[]> {
    return this.withFallback((gateway) => gateway.getMyLearning());
  }

  private withFallback<T>(request: (gateway: LearnerGateway) => Observable<T>): Observable<T> {
    const selected = this.config.dataMode === 'mock' ? this.mock : this.legacy;
    return request(selected).pipe(catchError((error) => selected !== this.mock && this.config.isFeatureEnabled('mockPlatform') ? request(this.mock) : throwError(() => error)));
  }
}
