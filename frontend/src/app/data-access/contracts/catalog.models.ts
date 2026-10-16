export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseAccent = 'blue' | 'teal' | 'amber' | 'rose' | 'indigo';
export type EnrollmentState = 'available' | 'enrolled' | 'completed' | 'assigned';

export interface CatalogCourseSummary {
  id: string;
  legacyId?: number;
  title: string;
  summary: string;
  category: string;
  level: CourseLevel;
  language: string;
  durationMinutes: number;
  rating: number;
  reviewCount: number;
  learnerCount: number;
  instructorName: string;
  skills: readonly string[];
  thumbnailUrl?: string;
  accent: CourseAccent;
}

export interface CatalogLessonSummary {
  id: string;
  title: string;
  type: 'Video' | 'Article' | 'Quiz' | 'Project';
  durationMinutes: number;
  preview: boolean;
}

export interface CatalogModule {
  id: string;
  title: string;
  lessons: readonly CatalogLessonSummary[];
}

export interface CatalogCourseDetail extends CatalogCourseSummary {
  description: string;
  outcomes: readonly string[];
  prerequisites: readonly string[];
  audience: readonly string[];
  modules: readonly CatalogModule[];
  updatedAt: string;
  accessibility: readonly string[];
  enrollmentState: EnrollmentState;
}

export interface LearningPathSummary {
  id: string;
  title: string;
  summary: string;
  level: CourseLevel;
  durationMinutes: number;
  courseIds: readonly string[];
  skills: readonly string[];
  accent: CourseAccent;
}

export interface CatalogQuery {
  query?: string;
  category?: string;
  level?: CourseLevel | '';
  language?: string;
  sort?: 'relevance' | 'rating' | 'newest' | 'duration';
  page?: number;
  pageSize?: number;
}

export interface EnrollmentResult {
  courseId: string;
  state: EnrollmentState;
}
