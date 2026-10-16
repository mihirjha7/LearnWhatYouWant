import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { CatalogGateway } from '../contracts/catalog.gateway';
import {
  CatalogCourseDetail,
  CatalogCourseSummary,
  CatalogQuery,
  EnrollmentResult,
  LearningPathSummary,
} from '../contracts/catalog.models';
import { PagedResponse } from '../contracts/paged-response';
import { MOCK_COURSE_DETAILS, MOCK_COURSES, MOCK_LEARNING_PATHS } from './catalog.fixtures';

@Injectable({ providedIn: 'root' })
export class MockCatalogGateway implements CatalogGateway {
  listCourses(query: CatalogQuery = {}): Observable<PagedResponse<CatalogCourseSummary>> {
    const normalizedQuery = query.query?.trim().toLowerCase() ?? '';
    let items = MOCK_COURSES.filter((course) => {
      const searchable = [course.title, course.summary, course.category, ...course.skills]
        .join(' ')
        .toLowerCase();
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (!query.category || course.category === query.category) &&
        (!query.level || course.level === query.level) &&
        (!query.language || course.language === query.language)
      );
    });

    items = [...items].sort((left, right) => {
      if (query.sort === 'rating') return right.rating - left.rating;
      if (query.sort === 'duration') return left.durationMinutes - right.durationMinutes;
      if (query.sort === 'newest') return right.id.localeCompare(left.id);
      return right.learnerCount - left.learnerCount;
    });

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 12);
    const start = (page - 1) * pageSize;
    return of({
      items: items.slice(start, start + pageSize),
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    }).pipe(delay(180));
  }

  getCourse(courseId: string): Observable<CatalogCourseDetail | null> {
    return of(MOCK_COURSE_DETAILS.find((course) => course.id === courseId) ?? null).pipe(delay(140));
  }

  listLearningPaths(): Observable<readonly LearningPathSummary[]> {
    return of(MOCK_LEARNING_PATHS).pipe(delay(120));
  }

  getLearningPath(pathId: string): Observable<LearningPathSummary | null> {
    return of(MOCK_LEARNING_PATHS.find((path) => path.id === pathId) ?? null).pipe(delay(120));
  }

  enroll(courseId: string): Observable<EnrollmentResult> {
    return of({ courseId, state: 'enrolled' as const }).pipe(delay(320));
  }
}
