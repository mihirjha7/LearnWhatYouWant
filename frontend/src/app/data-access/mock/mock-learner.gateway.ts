import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { LearnerGateway } from '../contracts/learner.gateway';
import { LearnerCourseSummary, LearnerDashboardModel } from '../contracts/learner.models';
import { MOCK_LEARNER_COURSES, MOCK_LEARNER_DASHBOARD } from './learner.fixtures';

@Injectable({ providedIn: 'root' })
export class MockLearnerGateway implements LearnerGateway {
  getDashboard(): Observable<LearnerDashboardModel> {
    return of(MOCK_LEARNER_DASHBOARD).pipe(delay(180));
  }

  getMyLearning(): Observable<readonly LearnerCourseSummary[]> {
    return of(MOCK_LEARNER_COURSES).pipe(delay(160));
  }
}
