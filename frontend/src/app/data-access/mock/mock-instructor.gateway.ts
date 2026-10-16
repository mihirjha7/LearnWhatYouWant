import { Injectable } from '@angular/core';
import { Observable, defer, delay, of, throwError } from 'rxjs';
import {
  BankQuestion,
  CourseAnalytics,
  CourseHealth,
  GradingSubmission,
  InstructorGateway,
  InstructorOverview,
  ReadinessCheck,
  StudioCourse,
} from '../contracts/instructor.contracts';

const STORAGE_KEY = 'learnova_mock_instructor_v1';

const COURSES: StudioCourse[] = [
  {
    id: 'modern-angular', title: 'Modern Angular in Practice', subtitle: 'Signals, standalone components, and typed data flows', category: 'Development', level: 'Intermediate', language: 'English', access: 'free', status: 'published', version: 7, updatedAt: '2026-10-11T12:00:00Z',
    description: 'Build maintainable Angular applications with clear state boundaries, typed gateways, and resilient data flows.',
    outcomes: ['Design feature facades over typed gateways', 'Choose between signals and RxJS deliberately', 'Recover gracefully from transient API failures'],
    requirements: ['Comfort with TypeScript', 'Basic Angular component knowledge'],
    sections: [
      { id: 'sec-1', title: 'Foundations', lessons: [ { id: 'les-1', title: 'Why boundaries matter', type: 'video', durationMinutes: 12, media: 'ready', hasCaptions: true, freePreview: true }, { id: 'les-2', title: 'Standalone components', type: 'reading', durationMinutes: 15, media: 'none', hasCaptions: true, freePreview: false } ] },
      { id: 'sec-2', title: 'State and data', lessons: [ { id: 'les-3', title: 'State boundaries', type: 'video', durationMinutes: 18, media: 'ready', hasCaptions: true, freePreview: false }, { id: 'les-4', title: 'Signals checkpoint', type: 'quiz', durationMinutes: 20, media: 'none', hasCaptions: true, freePreview: false }, { id: 'les-5', title: 'Observable recovery practice', type: 'lab', durationMinutes: 30, media: 'none', hasCaptions: true, freePreview: false } ] },
    ],
  },
  {
    id: 'cloud-api-design', title: 'Reliable Cloud API Design', subtitle: 'Contracts, idempotency, and useful errors', category: 'Development', level: 'Advanced', language: 'English', access: 'organization', status: 'draft', version: 3, updatedAt: '2026-10-13T16:45:00Z',
    description: 'Create secure, observable APIs.',
    outcomes: ['Design RFC 9457 error catalogues'],
    requirements: [],
    sections: [
      { id: 'sec-a', title: 'Contracts', lessons: [ { id: 'les-a1', title: 'Versioning strategies', type: 'video', durationMinutes: 16, media: 'captioning', hasCaptions: false, freePreview: false }, { id: 'les-a2', title: 'Idempotency keys', type: 'video', durationMinutes: 14, media: 'failed', hasCaptions: false, freePreview: false } ] },
      { id: 'sec-b', title: 'Resilience', lessons: [] },
    ],
  },
];

const BANK: BankQuestion[] = [
  { id: 'bq-1', prompt: 'Where should server state for a feature live?', type: 'Single choice', difficulty: 'Easy', skill: 'Interface architecture', tags: ['state', 'facade'], usage: 3, status: 'active', version: 2, updatedAt: '2026-10-01T09:00:00Z' },
  { id: 'bq-2', prompt: 'Which operations are safe to retry automatically?', type: 'Multiple choice', difficulty: 'Medium', skill: 'API reliability', tags: ['retry', 'http'], usage: 2, status: 'active', version: 1, updatedAt: '2026-09-28T09:00:00Z' },
  { id: 'bq-3', prompt: 'Match each concept to its description.', type: 'Matching', difficulty: 'Medium', skill: 'Reactive data flow', tags: ['signals'], usage: 1, status: 'active', version: 1, updatedAt: '2026-09-20T09:00:00Z' },
  { id: 'bq-4', prompt: 'Identify the chart in the image that best shows change over time.', type: 'Single choice', difficulty: 'Easy', skill: 'Data communication', tags: ['charts'], usage: 0, status: 'draft', version: 1, updatedAt: '2026-10-12T09:00:00Z', accessibilityIssue: 'Image is missing alternative text.' },
  { id: 'bq-5', prompt: 'Implement exponential backoff with a ceiling.', type: 'Code challenge', difficulty: 'Hard', skill: 'API reliability', tags: ['code', 'retry'], usage: 1, status: 'active', version: 3, updatedAt: '2026-10-05T09:00:00Z' },
  { id: 'bq-6', prompt: 'Explain the purpose of a correlation ID.', type: 'Short answer', difficulty: 'Medium', skill: 'Observability', tags: ['logging'], usage: 0, status: 'archived', version: 1, updatedAt: '2026-08-10T09:00:00Z' },
];

const RUBRIC = [
  { id: 'r1', criterion: 'Accuracy', points: 10, levels: [ { label: 'Exemplary', points: 10 }, { label: 'Proficient', points: 7 }, { label: 'Developing', points: 4 }, { label: 'Missing', points: 0 } ] },
  { id: 'r2', criterion: 'Reasoning', points: 6, levels: [ { label: 'Exemplary', points: 6 }, { label: 'Proficient', points: 4 }, { label: 'Developing', points: 2 }, { label: 'Missing', points: 0 } ] },
  { id: 'r3', criterion: 'Communication', points: 4, levels: [ { label: 'Exemplary', points: 4 }, { label: 'Proficient', points: 3 }, { label: 'Developing', points: 1 }, { label: 'Missing', points: 0 } ] },
];

const GRADING: GradingSubmission[] = [
  { id: 'sub-1', learner: 'Aisha Patel', course: 'Reliable Cloud API Design', activity: 'API error catalogue', type: 'assignment', submittedAt: '2026-10-13T08:30:00Z', dueAt: '2026-10-28T17:00:00Z', status: 'needs-grading', content: 'I documented nine error types. validation_failed (400) includes field errors; conflict (409) is returned for stale versions and is not retried automatically; service_unavailable (503) is retryable with exponential backoff and jitter.', files: ['error-catalogue.pdf'], rubric: RUBRIC, scores: {}, feedback: '' },
  { id: 'sub-2', learner: 'Leo Martins', course: 'Reliable Cloud API Design', activity: 'Resilient API practical · Essay', type: 'essay', submittedAt: '2026-10-12T19:10:00Z', dueAt: '2026-10-31T17:00:00Z', status: 'draft-feedback', content: 'I would publish a v2 alongside v1, add deprecation headers, offer a migration guide, and monitor client adoption weekly before announcing a sunset date.', files: [], rubric: RUBRIC, scores: { r1: 7 }, feedback: 'Good sequencing. Consider how you would handle clients that cannot upgrade in time.' },
  { id: 'sub-3', learner: 'Mei Tanaka', course: 'Reliable Cloud API Design', activity: 'Resilient API practical · Code', type: 'code', submittedAt: '2026-10-11T11:00:00Z', dueAt: '2026-10-31T17:00:00Z', status: 'needs-grading', content: 'export function retryDelay(attempt: number): number {\n  return Math.min(5000, 200 * 2 ** attempt);\n}', files: [], rubric: RUBRIC, scores: {}, feedback: '' },
  { id: 'sub-4', learner: 'Sam Okafor', course: 'Accessible Web Experiences', activity: 'Keyboard focus audit', type: 'file', submittedAt: '2026-10-04T15:00:00Z', dueAt: '2026-10-05T17:00:00Z', status: 'returned', content: 'Attached audit report.', files: ['audit-report.pdf'], rubric: RUBRIC, scores: { r1: 10, r2: 4, r3: 3 }, feedback: 'Thorough and well prioritised.' },
];

const ANALYTICS: CourseAnalytics = {
  courseTitle: 'Modern Angular in Practice',
  privacyThreshold: 5,
  funnel: [ { label: 'Enrolled', value: 1240 }, { label: 'Activated', value: 1012 }, { label: 'Progressing', value: 744 }, { label: 'Completed', value: 412 }, { label: 'Mastered', value: 268 } ],
  lessonEngagement: [ { label: 'Why boundaries matter', value: 92 }, { label: 'Standalone components', value: 81 }, { label: 'State boundaries', value: 64 }, { label: 'Signals checkpoint', value: 58 }, { label: 'Observable recovery', value: 41 } ],
  itemAnalysis: [ { item: 'Q2 · Safe retries', difficulty: 0.48, discrimination: 0.41, note: 'Most common wrong choice: validation failures.' }, { item: 'Q4 · Matching concepts', difficulty: 0.71, discrimination: 0.33, note: 'Performs as expected.' }, { item: 'Q5 · Pipeline ordering', difficulty: 0.39, discrimination: 0.12, note: 'Low discrimination. Consider rewording.' } ],
  retention: [ { label: 'Week 1', value: 94 }, { label: 'Week 2', value: 86 }, { label: 'Week 4', value: 77 }, { label: 'Week 8', value: 69 } ],
  atRisk: [
    { id: 'risk-1', learner: 'Jonah Reed', course: 'Modern Angular in Practice', level: 'Reach out', factors: ['No activity for 12 days', 'Two attempts below 50% on Signals checkpoint'], lastActive: '2026-10-02T10:00:00Z' },
    { id: 'risk-2', learner: 'Fatima Noor', course: 'Modern Angular in Practice', level: 'Monitor', factors: ['Progress pace 40% below cohort median'], lastActive: '2026-10-12T18:00:00Z' },
    { id: 'risk-3', learner: 'Chris Dalton', course: 'Reliable Cloud API Design', level: 'Urgent', factors: ['Assignment due in 2 days, not started', 'Missed two live sessions'], lastActive: '2026-09-29T09:00:00Z' },
  ],
};

interface InstructorState { courses: StudioCourse[]; bank: BankQuestion[]; grading: GradingSubmission[] }

@Injectable({ providedIn: 'root' })
export class MockInstructorGateway extends InstructorGateway {
  private state: InstructorState = this.load();

  getOverview(): Observable<InstructorOverview> {
    return defer(() => {
      const needsGrading = this.state.grading.filter((item) => item.status !== 'returned');
      const failed = this.state.courses.flatMap((course) => course.sections.flatMap((section) => section.lessons.filter((lesson) => lesson.media === 'failed').map((lesson) => ({ course, lesson }))));
      return of({
        metrics: [
          { label: 'Active learners', value: '1,486', context: '+8% vs last 30 days', tone: 'brand' as const },
          { label: 'Average completion', value: '41%', context: 'Across published courses', tone: 'progress' as const },
          { label: 'Pending grading', value: String(needsGrading.length), context: 'Oldest 3 days', tone: 'warm' as const },
          { label: 'Open questions', value: '4', context: 'In course discussions', tone: 'neutral' as const },
        ],
        attention: [
          ...needsGrading.slice(0, 2).map((item) => ({ id: item.id, kind: 'grading' as const, title: `Grade ${item.activity}`, detail: `${item.learner} · submitted ${new Date(item.submittedAt).toLocaleDateString()}`, link: '/instructor/grading' })),
          ...failed.map(({ course, lesson }) => ({ id: lesson.id, kind: 'upload' as const, title: `Media failed: ${lesson.title}`, detail: `${course.title} · re-upload or replace the source`, link: `/instructor/studio/${course.id}` })),
          { id: 'q-thr-2', kind: 'question' as const, title: 'Unanswered: 409 vs 422 for stale versions', detail: 'Reliable Cloud API Design · 1 day ago', link: '/student/discussions' },
          ...this.state.courses.filter((course) => course.status === 'draft').map((course) => ({ id: `pub-${course.id}`, kind: 'publish' as const, title: `Finish publishing ${course.title}`, detail: 'Readiness checklist has open items', link: `/instructor/studio/${course.id}` })),
        ],
        courses: this.healthList(),
        upcoming: [
          { id: 'up-1', title: 'Frontend cohort studio', startsAt: '2026-10-16T13:30:00Z', context: 'Live session · 38 registered' },
          { id: 'up-2', title: 'API error catalogue due', startsAt: '2026-10-28T17:00:00Z', context: 'Assignment · 112 learners' },
        ],
      });
    }).pipe(delay(180));
  }

  listStudioCourses(): Observable<readonly CourseHealth[]> {
    return defer(() => of(this.healthList())).pipe(delay(140));
  }

  getStudioCourse(id: string): Observable<StudioCourse> {
    return defer(() => {
      const course = this.state.courses.find((item) => item.id === id);
      return course ? of(course) : throwError(() => ({ status: 404 }));
    }).pipe(delay(160));
  }

  saveStudioCourse(course: StudioCourse): Observable<StudioCourse> {
    return defer(() => {
      const current = this.state.courses.find((item) => item.id === course.id);
      if (!current) return throwError(() => ({ status: 404 }));
      if (current.version !== course.version) return throwError(() => ({ status: 409, current }));
      const saved = { ...course, version: course.version + 1, updatedAt: new Date().toISOString() };
      this.state.courses = this.state.courses.map((item) => (item.id === saved.id ? saved : item));
      this.persist();
      return of(saved);
    }).pipe(delay(320));
  }

  getReadiness(course: StudioCourse): Observable<readonly ReadinessCheck[]> {
    const lessons = course.sections.flatMap((section) => section.lessons);
    const checks: ReadinessCheck[] = [
      { id: 'title', area: 'setup', label: 'Title and subtitle', passed: course.title.trim().length >= 8 && course.subtitle.trim().length > 0, detail: 'Use a clear title (8+ characters) and a subtitle.' },
      { id: 'description', area: 'setup', label: 'Course description', passed: course.description.trim().length >= 80, detail: 'Describe the course in at least 80 characters.' },
      { id: 'outcomes', area: 'setup', label: 'Learning outcomes', passed: course.outcomes.filter(Boolean).length >= 3, detail: 'Add at least three measurable outcomes.' },
      { id: 'sections', area: 'curriculum', label: 'Every section has content', passed: course.sections.length > 0 && course.sections.every((section) => section.lessons.length > 0), detail: 'Remove or fill empty sections.' },
      { id: 'media', area: 'curriculum', label: 'Media processing complete', passed: lessons.every((lesson) => lesson.media === 'ready' || lesson.media === 'none'), detail: 'Resolve failed or in-progress media.' },
      { id: 'captions', area: 'accessibility', label: 'Captions for all video', passed: lessons.filter((lesson) => lesson.type === 'video').every((lesson) => lesson.hasCaptions), detail: 'Every video needs reviewed captions.' },
      { id: 'assessment', area: 'assessments', label: 'At least one assessment', passed: lessons.some((lesson) => lesson.type === 'quiz' || lesson.type === 'assignment'), detail: 'Add a quiz or assignment to verify outcomes.' },
    ];
    return of(checks).pipe(delay(100));
  }

  publish(courseId: string, mode: 'now' | 'schedule' | 'review', scheduledFor?: string): Observable<StudioCourse> {
    return defer(() => {
      const status = mode === 'now' ? 'published' : mode === 'schedule' ? 'scheduled' : 'in-review';
      let updated: StudioCourse | undefined;
      this.state.courses = this.state.courses.map((course) => course.id === courseId ? (updated = { ...course, status, scheduledFor, version: course.version + 1, updatedAt: new Date().toISOString() }) : course);
      this.persist();
      return updated ? of(updated) : throwError(() => ({ status: 404 }));
    }).pipe(delay(360));
  }

  listBankQuestions(): Observable<readonly BankQuestion[]> {
    return defer(() => of(this.state.bank)).pipe(delay(140));
  }

  updateBankQuestions(ids: readonly string[], change: Partial<Pick<BankQuestion, 'status' | 'tags'>>): Observable<readonly BankQuestion[]> {
    return defer(() => {
      this.state.bank = this.state.bank.map((question) => ids.includes(question.id) ? { ...question, ...change, tags: change.tags ? [...new Set([...question.tags, ...change.tags])] : question.tags, updatedAt: new Date().toISOString() } : question);
      this.persist();
      return of(this.state.bank);
    }).pipe(delay(200));
  }

  listGradingQueue(): Observable<readonly GradingSubmission[]> {
    return defer(() => of(this.state.grading)).pipe(delay(150));
  }

  saveGrade(id: string, scores: Readonly<Record<string, number>>, feedback: string, release: boolean): Observable<GradingSubmission> {
    return defer(() => {
      let updated: GradingSubmission | undefined;
      this.state.grading = this.state.grading.map((item) => item.id === id ? (updated = { ...item, scores, feedback, status: release ? 'returned' : 'draft-feedback' }) : item);
      this.persist();
      return updated ? of(updated) : throwError(() => ({ status: 404 }));
    }).pipe(delay(260));
  }

  getAnalytics(): Observable<CourseAnalytics> {
    return of(ANALYTICS).pipe(delay(200));
  }

  recordIntervention(_learnerId: string, _action: string): Observable<void> {
    return of(undefined).pipe(delay(200));
  }

  private healthList(): CourseHealth[] {
    const extra: CourseHealth[] = [{ id: 'data-storytelling', title: 'Data Storytelling for Decisions', status: 'scheduled', learners: 0, completion: 0, mastery: 0, updatedAt: '2026-10-08T10:00:00Z' }];
    return [
      ...this.state.courses.map((course) => ({ id: course.id, title: course.title, status: course.status, learners: course.status === 'published' ? 1240 : 0, completion: course.status === 'published' ? 33 : 0, mastery: course.status === 'published' ? 22 : 0, updatedAt: course.updatedAt })),
      ...extra,
    ];
  }

  private load(): InstructorState {
    const seed: InstructorState = { courses: COURSES, bank: BANK, grading: GRADING };
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? { ...seed, ...(JSON.parse(stored) as Partial<InstructorState>) } : seed;
    } catch {
      return seed;
    }
  }

  private persist(): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Mock persistence is best effort.
    }
  }
}
