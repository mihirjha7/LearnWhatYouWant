import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Course, Lesson } from '../../models/course.model';
import { AuthService } from '../../services/auth-service';
import { CourseService } from '../../services/course-service';
import { CatalogGateway } from '../contracts/catalog.gateway';
import {
  CatalogCourseDetail,
  CatalogCourseSummary,
  CatalogQuery,
  CourseAccent,
  CourseLevel,
  EnrollmentResult,
  LearningPathSummary,
} from '../contracts/catalog.models';
import { PagedResponse } from '../contracts/paged-response';

@Injectable({ providedIn: 'root' })
export class LegacyCatalogGateway implements CatalogGateway {
  private readonly courses = inject(CourseService);
  private readonly auth = inject(AuthService);

  listCourses(query: CatalogQuery = {}): Observable<PagedResponse<CatalogCourseSummary>> {
    return this.courses.getAllCourses().pipe(
      map((courses) => courses.filter((course) => course.published).map((course) => this.toSummary(course))),
      map((items) => this.filterAndPage(items, query)),
    );
  }

  getCourse(courseId: string): Observable<CatalogCourseDetail | null> {
    const legacyId = Number(courseId);
    if (!Number.isInteger(legacyId) || legacyId <= 0) return of(null);

    return this.courses.getCourse(legacyId).pipe(
      switchMap((course) => {
        const detail = this.toDetail(course);
        if (!this.auth.isLoggedIn()) return of(detail);
        return this.courses.isEnrolled(legacyId).pipe(
          map(
            (isEnrolled): CatalogCourseDetail => ({
              ...detail,
              enrollmentState: isEnrolled ? 'enrolled' : 'available',
            }),
          ),
          catchError(() => of(detail)),
        );
      }),
    );
  }

  listLearningPaths(): Observable<readonly LearningPathSummary[]> {
    return of([]);
  }

  getLearningPath(): Observable<LearningPathSummary | null> {
    return of(null);
  }

  enroll(courseId: string): Observable<EnrollmentResult> {
    const legacyId = Number(courseId);
    if (!Number.isInteger(legacyId) || legacyId <= 0) {
      return throwError(() => new Error('This preview course is not available through the legacy API.'));
    }
    return this.courses.enroll(legacyId).pipe(map(() => ({ courseId, state: 'enrolled' as const })));
  }

  private toSummary(course: Course): CatalogCourseSummary {
    return {
      id: String(course.courseID),
      legacyId: course.courseID,
      title: course.title,
      summary: course.description,
      category: course.categoryID ? `Category ${course.categoryID}` : 'Professional skills',
      level: this.toLevel(course.level),
      language: course.language || 'English',
      durationMinutes: Math.max(0, Math.round((course.duration ?? 0) * 60)),
      rating: course.rating ?? 0,
      reviewCount: course.reviewCount ?? 0,
      learnerCount: 0,
      instructorName: 'Learnova instructor',
      skills: this.toSkills(course.syllabus),
      thumbnailUrl: course.thumbnailURL,
      accent: this.toAccent(course.categoryID),
    };
  }

  private toDetail(course: Course): CatalogCourseDetail {
    const summary = this.toSummary(course);
    return {
      ...summary,
      description: course.description,
      outcomes: this.toSkills(course.syllabus).map((skill) => `Build practical confidence with ${skill}.`),
      prerequisites: ['Review the course description for any required prior knowledge'],
      audience: ['Learners developing practical professional skills'],
      modules: [
        {
          id: `${course.courseID}-lessons`,
          title: 'Course content',
          lessons: [...(course.lessons ?? [])]
            .sort((left, right) => left.orderIndex - right.orderIndex)
            .map((lesson) => this.toLesson(lesson)),
        },
      ],
      updatedAt: course.lessons?.[0]?.updatedAt ?? course.lessons?.[0]?.createdAt ?? new Date(0).toISOString(),
      accessibility: ['Contact the instructor for available accessibility formats'],
      enrollmentState: 'available',
    };
  }

  private toLesson(lesson: Lesson) {
    return {
      id: String(lesson.lessonID),
      title: lesson.title,
      type: 'Video' as const,
      durationMinutes: lesson.estimatedTime ?? 0,
      preview: false,
    };
  }

  private filterAndPage(
    source: CatalogCourseSummary[],
    query: CatalogQuery,
  ): PagedResponse<CatalogCourseSummary> {
    const term = query.query?.trim().toLowerCase() ?? '';
    let items = source.filter(
      (course) =>
        (!term || `${course.title} ${course.summary} ${course.skills.join(' ')}`.toLowerCase().includes(term)) &&
        (!query.category || course.category === query.category) &&
        (!query.level || course.level === query.level) &&
        (!query.language || course.language === query.language),
    );
    if (query.sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);
    if (query.sort === 'duration') items = [...items].sort((a, b) => a.durationMinutes - b.durationMinutes);
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 12);
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    };
  }

  private toLevel(level: string | undefined): CourseLevel {
    const normalized = level?.toLowerCase();
    if (normalized === 'advanced' || normalized === 'expert') return 'Advanced';
    if (normalized === 'intermediate') return 'Intermediate';
    return 'Beginner';
  }

  private toSkills(syllabus: string | undefined): readonly string[] {
    const skills = syllabus?.split(/[,\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 3);
    return skills?.length ? skills : ['Applied learning'];
  }

  private toAccent(categoryId: number | undefined): CourseAccent {
    const accents: CourseAccent[] = ['blue', 'teal', 'amber', 'rose', 'indigo'];
    return accents[Math.abs(categoryId ?? 0) % accents.length];
  }
}
