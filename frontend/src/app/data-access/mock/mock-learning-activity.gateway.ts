import { Injectable } from '@angular/core';
import { Observable, defer, delay, of, throwError } from 'rxjs';
import {
  AssignmentDetail,
  AssignmentSummary,
  CredentialVerification,
  DiscussionReply,
  DiscussionThread,
  LearnerNote,
  LearningActivityGateway,
} from '../contracts/learning-activity.contracts';

const STORAGE_KEY = 'learnova_mock_activity_v1';

const API_RUBRIC = [
  { id: 'c1', criterion: 'Error model', description: 'Consistent Problem Details with stable codes.', points: 10, levels: [ { label: 'Exemplary', points: 10, description: 'Complete, consistent, documented.' }, { label: 'Proficient', points: 7, description: 'Mostly consistent with minor gaps.' }, { label: 'Developing', points: 4, description: 'Inconsistent or incomplete.' } ] },
  { id: 'c2', criterion: 'Retry guidance', description: 'Clear guidance on which failures are retryable.', points: 6, levels: [ { label: 'Exemplary', points: 6, description: 'Explicit, justified rules.' }, { label: 'Proficient', points: 4, description: 'Rules present but partly implicit.' }, { label: 'Developing', points: 2, description: 'Little or no guidance.' } ] },
  { id: 'c3', criterion: 'Communication', description: 'Readable by client developers.', points: 4, levels: [ { label: 'Exemplary', points: 4, description: 'Clear examples throughout.' }, { label: 'Proficient', points: 3, description: 'Generally clear.' }, { label: 'Developing', points: 1, description: 'Hard to follow.' } ] },
] as const;

function seedAssignments(): AssignmentDetail[] {
  return [
    {
      id: 'asg-error-catalogue', title: 'API error catalogue', courseTitle: 'Reliable Cloud API Design', dueAt: '2026-10-28T17:00:00Z', status: 'draft', points: 20,
      instructions: ['Document the error responses for the orders API using RFC 9457 Problem Details.', 'Include at least eight error types with stable codes, HTTP status, and a client action.', 'State which errors are safe to retry and why.'],
      latePolicy: 'Late submissions lose 10% per day for up to three days.', timeZone: 'Asia/Kolkata',
      resources: [ { name: 'orders-api-openapi.yaml', sizeKb: 48 }, { name: 'problem-details-template.md', sizeKb: 6 } ],
      submissionTypes: ['text', 'link', 'file'], rubric: API_RUBRIC as unknown as AssignmentDetail['rubric'], history: [],
      draft: { text: 'Error types drafted so far:\n- validation_failed (400)\n- not_found (404)', link: '', files: [], savedAt: '2026-10-12T09:30:00Z' },
    },
    {
      id: 'asg-focus-audit', title: 'Keyboard focus audit', courseTitle: 'Accessible Web Experiences', dueAt: '2026-10-05T17:00:00Z', status: 'returned', points: 20,
      instructions: ['Audit the focus order of the provided checkout flow and report every barrier.'],
      latePolicy: 'No late submissions after feedback release.', timeZone: 'Asia/Kolkata', resources: [ { name: 'checkout-flow.zip', sizeKb: 920 } ],
      submissionTypes: ['text', 'file'], rubric: API_RUBRIC as unknown as AssignmentDetail['rubric'],
      history: [ { version: 1, submittedAt: '2026-10-03T11:00:00Z', status: 'returned', score: 17, text: 'Seven barriers found. See attached report.', files: [ { name: 'focus-audit.pdf', sizeKb: 412, scanStatus: 'clean' } ] } ],
      feedback: { grader: 'Maya Chen', returnedAt: '2026-10-08T10:00:00Z', summary: 'Strong, well-evidenced audit. Prioritise the modal focus trap issue first in future reports.', scores: [ { criterionId: 'c1', score: 9, comment: 'Clear barrier taxonomy.' }, { criterionId: 'c2', score: 5, comment: 'Good remediation order.' }, { criterionId: 'c3', score: 3, comment: 'Add screenshots for each barrier.' } ] },
      draft: { text: '', link: '', files: [] },
    },
    {
      id: 'asg-dashboard-brief', title: 'Executive dashboard brief', courseTitle: 'Data Storytelling for Decisions', dueAt: '2026-11-14T17:00:00Z', status: 'not-started', points: 15,
      instructions: ['Write a one-page brief recommending three charts for the leadership dashboard.'],
      latePolicy: 'Late submissions accepted for 48 hours with a 5% deduction.', timeZone: 'Asia/Kolkata', resources: [],
      submissionTypes: ['text', 'link'], rubric: API_RUBRIC.slice(2) as unknown as AssignmentDetail['rubric'], history: [], draft: { text: '', link: '', files: [] },
    },
  ];
}

const THREADS: DiscussionThread[] = [
  { id: 'thr-1', courseTitle: 'Modern Angular in Practice', title: 'When should I use a signal store instead of a service with BehaviorSubject?', body: 'Our team has both patterns. Is there a rule of thumb for new features?', author: 'Aisha Patel', createdAt: '2026-10-10T08:00:00Z', pinned: true, answered: true, tags: ['signals', 'state'], replies: [ { id: 'rep-1', author: 'Arjun Rao', role: 'Instructor', body: 'Prefer signals for synchronous UI state and RxJS for async orchestration. Wrap both behind a facade so components do not care.', createdAt: '2026-10-10T10:12:00Z', accepted: true, helpfulCount: 14 }, { id: 'rep-2', author: 'Leo Martins', role: 'Learner', body: 'We migrated one feature at a time with toSignal() at the boundary. Worked well.', createdAt: '2026-10-11T13:40:00Z', helpfulCount: 5 } ] },
  { id: 'thr-2', courseTitle: 'Reliable Cloud API Design', title: 'Is 409 or 422 better for a stale version conflict?', body: 'The exercise mentions concurrency tokens but not the status code.', author: 'Sam Okafor', createdAt: '2026-10-12T15:30:00Z', pinned: false, answered: false, tags: ['http', 'concurrency'], replies: [ { id: 'rep-3', author: 'Priya Nair', role: 'Teaching assistant', body: 'For ETag mismatches use 412 with If-Match; for version fields in the body, 409 is common. Document the choice.', createdAt: '2026-10-12T17:05:00Z', helpfulCount: 3 } ] },
  { id: 'thr-3', courseTitle: 'Accessible Web Experiences', title: 'Screen reader recommendations for testing on Windows', body: 'Which combination should we use for the final project?', author: 'Mei Tanaka', createdAt: '2026-10-13T09:00:00Z', pinned: false, answered: false, tags: ['testing'], replies: [] },
];

const NOTES: LearnerNote[] = [
  { id: 'note-1', courseTitle: 'Modern Angular in Practice', lessonTitle: 'State boundaries', timestamp: '04:12', body: 'Facades expose intent-based methods. Components should not know about HTTP or storage.', tags: ['architecture'], updatedAt: '2026-10-11T09:00:00Z' },
  { id: 'note-2', courseTitle: 'Reliable Cloud API Design', lessonTitle: 'Idempotency keys', body: 'Generate key per user intent, not per retry. Store server response for replay.', tags: ['reliability', 'exam'], updatedAt: '2026-10-09T18:20:00Z' },
  { id: 'note-3', courseTitle: 'Accessible Web Experiences', lessonTitle: 'Focus management', timestamp: '11:40', body: 'Return focus to the trigger after closing a dialog.', tags: ['a11y'], updatedAt: '2026-10-02T14:00:00Z' },
];

const CREDENTIALS: Record<string, CredentialVerification> = {
  'LRN-A11Y-2026-1842': { code: 'LRN-A11Y-2026-1842', state: 'valid', holder: 'Aisha Patel', title: 'Accessible Web Experiences', issuer: 'Learnova Academy', issuedAt: '2026-08-22T12:00:00Z', skills: ['WCAG', 'Semantic HTML', 'Inclusive design'], evidence: ['Final assessment: 100%', 'Keyboard focus audit: 17/20'] },
  'LRN-FAC-2026-0924': { code: 'LRN-FAC-2026-0924', state: 'valid', holder: 'Aisha Patel', title: 'Facilitation That Moves Work Forward', issuer: 'Learnova Academy', issuedAt: '2026-06-14T12:00:00Z', skills: ['Facilitation', 'Decision making'], evidence: ['Workshop facilitation project'] },
  'LRN-OLD-2024-0001': { code: 'LRN-OLD-2024-0001', state: 'expired', holder: 'Aisha Patel', title: 'Cloud Security Basics', issuer: 'Learnova Academy', issuedAt: '2024-02-01T12:00:00Z', expiresAt: '2026-02-01T12:00:00Z' },
  'LRN-REV-2025-0042': { code: 'LRN-REV-2025-0042', state: 'revoked', title: 'Project Management Fundamentals', issuer: 'Learnova Academy' },
};

interface ActivityState { assignments: AssignmentDetail[]; threads: DiscussionThread[]; notes: LearnerNote[] }

@Injectable({ providedIn: 'root' })
export class MockLearningActivityGateway extends LearningActivityGateway {
  private state: ActivityState = this.load();
  private submissions = new Map<string, AssignmentDetail>();

  listAssignments(): Observable<readonly AssignmentSummary[]> {
    return defer(() => of(this.state.assignments.map(({ id, title, courseTitle, dueAt, status, points }) => ({ id, title, courseTitle, dueAt, status, points })))).pipe(delay(150));
  }

  getAssignment(id: string): Observable<AssignmentDetail> {
    return defer(() => {
      const assignment = this.state.assignments.find((item) => item.id === id);
      return assignment ? of(assignment) : throwError(() => ({ status: 404 }));
    }).pipe(delay(150));
  }

  saveAssignmentDraft(id: string, draft: AssignmentDetail['draft']): Observable<{ savedAt: string }> {
    return defer(() => {
      const savedAt = new Date().toISOString();
      this.updateAssignment(id, (item) => ({ ...item, status: item.status === 'not-started' ? 'draft' : item.status, draft: { ...draft, savedAt } }));
      return of({ savedAt });
    }).pipe(delay(240));
  }

  submitAssignment(id: string, draft: AssignmentDetail['draft'], idempotencyKey: string): Observable<AssignmentDetail> {
    return defer(() => {
      const replay = this.submissions.get(idempotencyKey);
      if (replay) return of(replay);
      const updated = this.updateAssignment(id, (item) => ({
        ...item,
        status: 'submitted',
        history: [...item.history, { version: item.history.length + 1, submittedAt: new Date().toISOString(), status: 'submitted', text: draft.text, link: draft.link, files: draft.files.map((file) => ({ ...file, scanStatus: 'pending' as const })) }],
        draft: { text: '', link: '', files: [] },
      }));
      if (!updated) return throwError(() => ({ status: 404 }));
      this.submissions.set(idempotencyKey, updated);
      return of(updated);
    }).pipe(delay(480));
  }

  listThreads(): Observable<readonly DiscussionThread[]> {
    return defer(() => of(this.state.threads)).pipe(delay(150));
  }

  reply(threadId: string, body: string): Observable<DiscussionReply> {
    return defer(() => {
      const reply: DiscussionReply = { id: `rep-${Date.now().toString(36)}`, author: 'You', role: 'Learner', body, createdAt: new Date().toISOString(), helpfulCount: 0 };
      this.state.threads = this.state.threads.map((thread) => thread.id === threadId ? { ...thread, replies: [...thread.replies, reply] } : thread);
      this.persist();
      return of(reply);
    }).pipe(delay(220));
  }

  createThread(title: string, body: string, courseTitle: string): Observable<DiscussionThread> {
    return defer(() => {
      const thread: DiscussionThread = { id: `thr-${Date.now().toString(36)}`, courseTitle, title, body, author: 'You', createdAt: new Date().toISOString(), pinned: false, answered: false, tags: [], replies: [] };
      this.state.threads = [thread, ...this.state.threads];
      this.persist();
      return of(thread);
    }).pipe(delay(260));
  }

  reportReply(_threadId: string, _replyId: string, _reason: string): Observable<void> {
    return of(undefined).pipe(delay(180));
  }

  listNotes(): Observable<readonly LearnerNote[]> {
    return defer(() => of([...this.state.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))).pipe(delay(120));
  }

  saveNote(note: Omit<LearnerNote, 'id' | 'updatedAt'> & { id?: string }): Observable<LearnerNote> {
    return defer(() => {
      const saved: LearnerNote = { ...note, id: note.id ?? `note-${Date.now().toString(36)}`, updatedAt: new Date().toISOString() };
      this.state.notes = [saved, ...this.state.notes.filter((item) => item.id !== saved.id)];
      this.persist();
      return of(saved);
    }).pipe(delay(160));
  }

  deleteNote(id: string): Observable<void> {
    return defer(() => {
      this.state.notes = this.state.notes.filter((item) => item.id !== id);
      this.persist();
      return of(undefined);
    }).pipe(delay(140));
  }

  verifyCredential(code: string): Observable<CredentialVerification> {
    const normalized = code.trim().toUpperCase();
    return of(CREDENTIALS[normalized] ?? { code: normalized, state: 'not-found' as const }).pipe(delay(220));
  }

  private updateAssignment(id: string, change: (item: AssignmentDetail) => AssignmentDetail): AssignmentDetail | undefined {
    let updated: AssignmentDetail | undefined;
    this.state.assignments = this.state.assignments.map((item) => item.id === id ? (updated = change(item)) : item);
    this.persist();
    return updated;
  }

  private load(): ActivityState {
    const seed: ActivityState = { assignments: seedAssignments(), threads: THREADS, notes: NOTES };
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? { ...seed, ...(JSON.parse(stored) as Partial<ActivityState>) } : seed;
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
