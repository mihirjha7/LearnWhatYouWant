import { Observable } from 'rxjs';
import { PagedResponse } from './paged-response';
import {
  CatalogCourseDetail,
  CatalogCourseSummary,
  CatalogQuery,
  EnrollmentResult,
  LearningPathSummary,
} from './catalog.models';

export abstract class CatalogGateway {
  abstract listCourses(query?: CatalogQuery): Observable<PagedResponse<CatalogCourseSummary>>;
  abstract getCourse(courseId: string): Observable<CatalogCourseDetail | null>;
  abstract listLearningPaths(): Observable<readonly LearningPathSummary[]>;
  abstract getLearningPath(pathId: string): Observable<LearningPathSummary | null>;
  abstract enroll(courseId: string): Observable<EnrollmentResult>;
}
