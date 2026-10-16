import { Observable } from 'rxjs';
import { LearnerCourseSummary, LearnerDashboardModel } from './learner.models';

export abstract class LearnerGateway {
  abstract getDashboard(): Observable<LearnerDashboardModel>;
  abstract getMyLearning(): Observable<readonly LearnerCourseSummary[]>;
}
