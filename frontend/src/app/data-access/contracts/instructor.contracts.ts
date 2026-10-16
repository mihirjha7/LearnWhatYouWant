import { Observable } from 'rxjs';

export type CourseLifecycle = 'draft' | 'in-review' | 'scheduled' | 'published' | 'archived';
export type MediaState = 'ready' | 'uploaded' | 'scanning' | 'transcoding' | 'captioning' | 'failed' | 'none';

export interface AttentionItem {
  id: string;
  kind: 'grading' | 'upload' | 'question' | 'publish';
  title: string;
  detail: string;
  link: string;
}

export interface CourseHealth {
  id: string;
  title: string;
  status: CourseLifecycle;
  learners: number;
  completion: number;
  mastery: number;
  updatedAt: string;
}

export interface InstructorOverview {
  metrics: readonly { label: string; value: string; context: string; tone: 'brand' | 'progress' | 'warm' | 'neutral' }[];
  attention: readonly AttentionItem[];
  courses: readonly CourseHealth[];
  upcoming: readonly { id: string; title: string; startsAt: string; context: string }[];
}

export interface StudioLesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'lab' | 'assignment';
  durationMinutes: number;
  media: MediaState;
  hasCaptions: boolean;
  freePreview: boolean;
}

export interface StudioSection {
  id: string;
  title: string;
  lessons: readonly StudioLesson[];
}

export interface StudioCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  outcomes: readonly string[];
  requirements: readonly string[];
  access: 'free' | 'organization' | 'paid';
  status: CourseLifecycle;
  version: number;
  updatedAt: string;
  scheduledFor?: string;
  sections: readonly StudioSection[];
}

export interface ReadinessCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  area: 'setup' | 'curriculum' | 'accessibility' | 'assessments';
}

export interface BankQuestion {
  id: string;
  prompt: string;
  type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  skill: string;
  tags: readonly string[];
  usage: number;
  status: 'active' | 'draft' | 'archived';
  version: number;
  updatedAt: string;
  accessibilityIssue?: string;
}

export interface GradingSubmission {
  id: string;
  learner: string;
  course: string;
  activity: string;
  type: 'essay' | 'file' | 'code' | 'assignment';
  submittedAt: string;
  dueAt: string;
  status: 'needs-grading' | 'draft-feedback' | 'returned';
  content: string;
  files: readonly string[];
  rubric: readonly { id: string; criterion: string; points: number; levels: readonly { label: string; points: number }[] }[];
  scores: Readonly<Record<string, number>>;
  feedback: string;
}

export interface AtRiskLearner {
  id: string;
  learner: string;
  course: string;
  level: 'Monitor' | 'Reach out' | 'Urgent';
  factors: readonly string[];
  lastActive: string;
  intervention?: string;
}

export interface CourseAnalytics {
  courseTitle: string;
  funnel: readonly { label: string; value: number }[];
  lessonEngagement: readonly { label: string; value: number }[];
  itemAnalysis: readonly { item: string; difficulty: number; discrimination: number; note: string }[];
  retention: readonly { label: string; value: number }[];
  atRisk: readonly AtRiskLearner[];
  privacyThreshold: number;
}

export abstract class InstructorGateway {
  abstract getOverview(): Observable<InstructorOverview>;
  abstract listStudioCourses(): Observable<readonly CourseHealth[]>;
  abstract getStudioCourse(id: string): Observable<StudioCourse>;
  abstract saveStudioCourse(course: StudioCourse): Observable<StudioCourse>;
  abstract getReadiness(course: StudioCourse): Observable<readonly ReadinessCheck[]>;
  abstract publish(courseId: string, mode: 'now' | 'schedule' | 'review', scheduledFor?: string): Observable<StudioCourse>;
  abstract listBankQuestions(): Observable<readonly BankQuestion[]>;
  abstract updateBankQuestions(ids: readonly string[], change: Partial<Pick<BankQuestion, 'status' | 'tags'>>): Observable<readonly BankQuestion[]>;
  abstract listGradingQueue(): Observable<readonly GradingSubmission[]>;
  abstract saveGrade(id: string, scores: Readonly<Record<string, number>>, feedback: string, release: boolean): Observable<GradingSubmission>;
  abstract getAnalytics(): Observable<CourseAnalytics>;
  abstract recordIntervention(learnerId: string, action: string): Observable<void>;
}
