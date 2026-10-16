import { Injectable } from '@angular/core';
import { Observable, defer, delay, of, throwError } from 'rxjs';
import {
  AssessmentDetail,
  AssessmentGateway,
  AssessmentQuestion,
  AssessmentSummary,
  Attempt,
  AttemptResult,
  QuestionReview,
  ResponseValue,
} from '../contracts/assessment.contracts';

interface AssessmentDefinition {
  summary: Omit<AssessmentSummary, 'status' | 'attemptsUsed' | 'activeAttemptId' | 'lastAttemptId'> & {
    opensAt?: string;
  };
  detail: Pick<AssessmentDetail, 'instructions' | 'gradingMethod' | 'feedbackPolicy' | 'allowedResources' | 'accommodations'>;
  questions: readonly AssessmentQuestion[];
  key: Readonly<Record<string, ResponseValue | readonly string[]>>;
  skills: readonly string[];
}

interface MockState {
  attempts: Record<string, Attempt>;
  results: Record<string, AttemptResult>;
  submissions: Record<string, string>;
}

const STORAGE_KEY = 'learnova_mock_assessments_v1';
const MANUAL_TYPES = new Set(['short-answer', 'essay', 'code', 'file']);

const DEFINITIONS: readonly AssessmentDefinition[] = [
  {
    summary: {
      id: 'asm-angular-checkpoint',
      title: 'State boundaries checkpoint',
      courseId: 'modern-angular',
      courseTitle: 'Modern Angular in Practice',
      dueAt: '2026-10-24T17:00:00Z',
      timeLimitMinutes: 20,
      questionCount: 6,
      attemptsAllowed: 3,
      passingScore: 70,
    },
    detail: {
      instructions: [
        'Answer six questions about signals, facades, and data boundaries.',
        'Your answers save automatically. You can flag questions and review before submitting.',
        'Once submitted, this attempt cannot be changed.',
      ],
      gradingMethod: 'Highest attempt counts',
      feedbackPolicy: 'Correct answers and explanations appear after submission.',
      allowedResources: 'Course notes are allowed. Do not use external help.',
      accommodations: 'Extended time is applied automatically when approved on your profile.',
    },
    questions: [
      { id: 'q1', type: 'single', points: 2, prompt: 'Where should server state for a feature live?', options: [ { id: 'a', label: 'Inside a shared button component' }, { id: 'b', label: 'Behind a feature facade or store' }, { id: 'c', label: 'In a global window variable' }, { id: 'd', label: 'In route parameters only' } ] },
      { id: 'q2', type: 'multiple', points: 3, prompt: 'Which operations are generally safe to retry automatically? Select all that apply.', options: [ { id: 'a', label: 'GET requests that failed with a 503' }, { id: 'b', label: 'Idempotent PUT with the same payload' }, { id: 'c', label: 'Non-idempotent payment POST without a key' }, { id: 'd', label: 'Validation failures (400)' } ] },
      { id: 'q3', type: 'true-false', points: 1, prompt: 'Computed signals recalculate only when one of their dependencies changes.', options: [ { id: 'true', label: 'True' }, { id: 'false', label: 'False' } ] },
      { id: 'q4', type: 'matching', points: 3, prompt: 'Match each concept to its best description.', matchLeft: [ { id: 'l1', label: 'signal()' }, { id: 'l2', label: 'Observable' }, { id: 'l3', label: 'Facade' } ], matchRight: [ { id: 'r1', label: 'Synchronous reactive value' }, { id: 'r2', label: 'Stream of values over time' }, { id: 'r3', label: 'Feature-facing API over data sources' } ] },
      { id: 'q5', type: 'ordering', points: 2, prompt: 'Order the request pipeline from first to last.', orderItems: [ { id: 'o3', label: 'Map transport DTO to domain model' }, { id: 'o1', label: 'Component calls facade' }, { id: 'o4', label: 'View renders state' }, { id: 'o2', label: 'Gateway issues HTTP request' } ] },
      { id: 'q6', type: 'fill-blank', points: 1, prompt: 'Complete the sentence: Use the ____ function to derive read-only state from other signals.', placeholder: 'Type one word' },
    ],
    key: { q1: 'b', q2: ['a', 'b'], q3: 'true', q4: { l1: 'r1', l2: 'r2', l3: 'r3' }, q5: ['o1', 'o2', 'o3', 'o4'], q6: ['computed', 'computed()'] },
    skills: ['Reactive data flow', 'Interface architecture'],
  },
  {
    summary: {
      id: 'asm-api-practical',
      title: 'Resilient API practical',
      courseId: 'cloud-api-design',
      courseTitle: 'Reliable Cloud API Design',
      dueAt: '2026-10-31T17:00:00Z',
      timeLimitMinutes: 45,
      questionCount: 5,
      attemptsAllowed: 1,
      passingScore: 60,
    },
    detail: {
      instructions: [
        'This practical mixes short responses, an essay, a code challenge, and a file upload.',
        'Written and file responses are graded by your instructor using the published rubric.',
        'Uploads are scanned before instructors can open them.',
      ],
      gradingMethod: 'Instructor-graded with rubric',
      feedbackPolicy: 'Feedback is released when grading is complete.',
      allowedResources: 'Open book. Cite any external sources in your essay.',
      accommodations: 'Pause is not available. Extended time applies when approved.',
    },
    questions: [
      { id: 'p1', type: 'single', points: 2, prompt: 'Which header lets clients safely retry a create operation?', options: [ { id: 'a', label: 'Cache-Control' }, { id: 'b', label: 'Idempotency-Key' }, { id: 'c', label: 'Accept-Language' } ] },
      { id: 'p2', type: 'short-answer', points: 3, prompt: 'In one or two sentences, explain what RFC 9457 Problem Details standardizes.', placeholder: 'Short response' },
      { id: 'p3', type: 'essay', points: 5, prompt: 'Describe how you would roll out a breaking API change to 40 enterprise clients with minimal disruption.' },
      { id: 'p4', type: 'code', points: 5, language: 'TypeScript', prompt: 'Implement retryDelay(attempt) returning exponential backoff in milliseconds (base 200ms, max 5000ms).', starterCode: 'export function retryDelay(attempt: number): number {\n  // return the delay in milliseconds\n  return 0;\n}\n' },
      { id: 'p5', type: 'file', points: 5, prompt: 'Upload your API error catalogue (PDF or Markdown, up to 5 MB).', acceptedFileTypes: '.pdf,.md', maxFileSizeMb: 5 },
    ],
    key: { p1: 'b' },
    skills: ['API reliability'],
  },
  {
    summary: {
      id: 'asm-a11y-final',
      title: 'Accessibility final assessment',
      courseId: 'web-accessibility-foundations',
      courseTitle: 'Accessible Web Experiences',
      timeLimitMinutes: 30,
      questionCount: 2,
      attemptsAllowed: 2,
      passingScore: 75,
    },
    detail: {
      instructions: ['A short final check covering semantics and keyboard support.'],
      gradingMethod: 'Latest attempt counts',
      feedbackPolicy: 'Full review available after submission.',
      allowedResources: 'Closed book.',
      accommodations: 'Screen-reader compatible. Extended time applies when approved.',
    },
    questions: [
      { id: 'a1', type: 'single', points: 2, prompt: 'What is the minimum WCAG 2.2 AA target size for pointer inputs?', options: [ { id: 'a', label: '16 by 16 CSS pixels' }, { id: 'b', label: '24 by 24 CSS pixels' }, { id: 'c', label: '48 by 48 CSS pixels' } ] },
      { id: 'a2', type: 'true-false', points: 1, prompt: 'Placeholder text is an acceptable replacement for a visible label.', options: [ { id: 'true', label: 'True' }, { id: 'false', label: 'False' } ] },
    ],
    key: { a1: 'b', a2: 'false' },
    skills: ['Accessible interaction'],
  },
  {
    summary: {
      id: 'asm-data-upcoming',
      title: 'Visual hierarchy checkpoint',
      courseId: 'data-storytelling',
      courseTitle: 'Data Storytelling for Decisions',
      opensAt: '2026-11-04T09:00:00Z',
      dueAt: '2026-11-11T17:00:00Z',
      timeLimitMinutes: 25,
      questionCount: 8,
      attemptsAllowed: 2,
      passingScore: 70,
    },
    detail: {
      instructions: ['Opens on November 4. You will be notified when it becomes available.'],
      gradingMethod: 'Highest attempt counts',
      feedbackPolicy: 'Explanations appear after the due date.',
      allowedResources: 'Course notes allowed.',
      accommodations: 'Extended time applies when approved.',
    },
    questions: [],
    key: {},
    skills: ['Data communication'],
  },
];

const SEEDED_RESULT: AttemptResult = {
  attemptId: 'att-a11y-seed',
  assessmentId: 'asm-a11y-final',
  assessmentTitle: 'Accessibility final assessment',
  courseTitle: 'Accessible Web Experiences',
  status: 'graded',
  scorePercent: 100,
  passingScore: 75,
  pointsEarned: 3,
  pointsPossible: 3,
  submittedAt: '2026-10-02T14:20:00Z',
  review: [
    { questionId: 'a1', prompt: 'What is the minimum WCAG 2.2 AA target size for pointer inputs?', outcome: 'correct', pointsEarned: 2, points: 2, feedback: 'Correct. 24 by 24 CSS pixels, with spacing exceptions.' },
    { questionId: 'a2', prompt: 'Placeholder text is an acceptable replacement for a visible label.', outcome: 'correct', pointsEarned: 1, points: 1, feedback: 'Correct. Placeholders disappear and often lack contrast.' },
  ],
  masteryEffects: [{ skill: 'Accessible interaction', change: 6, reason: 'Two correct answers on target-size and labelling concepts.' }],
  remediation: [],
  retakeAllowed: true,
};

@Injectable({ providedIn: 'root' })
export class MockAssessmentGateway extends AssessmentGateway {
  private state: MockState = this.load();

  listAssessments(): Observable<readonly AssessmentSummary[]> {
    return defer(() => of(DEFINITIONS.map((definition) => this.toSummary(definition)))).pipe(delay(160));
  }

  getAssessment(assessmentId: string): Observable<AssessmentDetail> {
    return defer(() => {
      const definition = this.find(assessmentId);
      if (!definition) return throwError(() => ({ status: 404 }));
      const history = Object.values(this.state.results)
        .filter((result) => result.assessmentId === assessmentId)
        .map((result) => ({ attemptId: result.attemptId, submittedAt: result.submittedAt, scorePercent: result.scorePercent, status: result.status }));
      return of({ ...this.toSummary(definition), ...definition.detail, history });
    }).pipe(delay(140));
  }

  startOrResumeAttempt(assessmentId: string): Observable<Attempt> {
    return defer(() => {
      const definition = this.find(assessmentId);
      if (!definition) return throwError(() => ({ status: 404 }));
      const summary = this.toSummary(definition);
      if (summary.activeAttemptId) return of(this.state.attempts[summary.activeAttemptId]);
      if (summary.status === 'upcoming' || summary.attemptsUsed >= summary.attemptsAllowed) {
        return throwError(() => ({ status: 409 }));
      }
      const now = Date.now();
      const attempt: Attempt = {
        id: `att-${assessmentId.replace('asm-', '')}-${now.toString(36)}`,
        assessmentId,
        assessmentTitle: summary.title,
        courseTitle: summary.courseTitle,
        status: 'active',
        startedAt: new Date(now).toISOString(),
        deadlineAt: new Date(now + summary.timeLimitMinutes * 60_000).toISOString(),
        questions: definition.questions,
        responses: {},
        flagged: [],
        version: 1,
      };
      this.state.attempts[attempt.id] = attempt;
      this.persist();
      return of(attempt);
    }).pipe(delay(220));
  }

  getAttempt(attemptId: string): Observable<Attempt> {
    return defer(() => {
      const attempt = this.state.attempts[attemptId];
      if (!attempt) return throwError(() => ({ status: 404 }));
      if (attempt.status === 'active' && Date.parse(attempt.deadlineAt) <= Date.now()) {
        this.grade(attempt, 'expired');
      }
      return of(this.state.attempts[attemptId]);
    }).pipe(delay(140));
  }

  saveResponses(attemptId: string, responses: Readonly<Record<string, ResponseValue>>, flagged: readonly string[]): Observable<{ savedAt: string; version: number }> {
    return defer(() => {
      const attempt = this.state.attempts[attemptId];
      if (!attempt) return throwError(() => ({ status: 404 }));
      if (attempt.status !== 'active') return throwError(() => ({ status: 409 }));
      const version = attempt.version + 1;
      this.state.attempts[attemptId] = { ...attempt, responses: { ...responses }, flagged: [...flagged], version };
      this.persist();
      return of({ savedAt: new Date().toISOString(), version });
    }).pipe(delay(260));
  }

  submitAttempt(attemptId: string, idempotencyKey: string): Observable<AttemptResult> {
    return defer(() => {
      const previous = this.state.submissions[idempotencyKey];
      if (previous && this.state.results[previous]) return of(this.state.results[previous]);
      const attempt = this.state.attempts[attemptId];
      if (!attempt) return throwError(() => ({ status: 404 }));
      if (this.state.results[attemptId]) return of(this.state.results[attemptId]);
      const result = this.grade(attempt, 'submitted');
      this.state.submissions[idempotencyKey] = attemptId;
      this.persist();
      return of(result);
    }).pipe(delay(420));
  }

  getResult(attemptId: string): Observable<AttemptResult> {
    return defer(() => {
      const result = this.state.results[attemptId];
      return result ? of(result) : throwError(() => ({ status: 404 }));
    }).pipe(delay(160));
  }

  private grade(attempt: Attempt, reason: 'submitted' | 'expired'): AttemptResult {
    const definition = this.find(attempt.assessmentId)!;
    const review: QuestionReview[] = attempt.questions.map((question) => this.reviewQuestion(question, attempt.responses[question.id], definition.key[question.id]));
    const pending = review.some((item) => item.outcome === 'pending');
    const pointsPossible = review.reduce((total, item) => total + item.points, 0);
    const pointsEarned = review.reduce((total, item) => total + item.pointsEarned, 0);
    const scorePercent = pending ? null : Math.round((pointsEarned / Math.max(1, pointsPossible)) * 100);
    const weak = review.filter((item) => item.outcome === 'incorrect' || item.outcome === 'partial');
    const result: AttemptResult = {
      attemptId: attempt.id,
      assessmentId: attempt.assessmentId,
      assessmentTitle: attempt.assessmentTitle,
      courseTitle: attempt.courseTitle,
      status: pending ? 'pending-grading' : 'graded',
      scorePercent,
      passingScore: definition.summary.passingScore,
      pointsEarned,
      pointsPossible,
      submittedAt: new Date().toISOString(),
      review,
      masteryEffects: pending ? [] : definition.skills.map((skill) => ({
        skill,
        change: scorePercent! >= definition.summary.passingScore ? 5 : -2,
        reason: scorePercent! >= definition.summary.passingScore ? 'Consistent correct answers on this objective.' : 'Several related questions need another look.',
      })),
      remediation: weak.slice(0, 2).map((item) => ({ title: `Revisit: ${item.prompt.slice(0, 60)}${item.prompt.length > 60 ? '…' : ''}`, reason: 'This question was not fully correct.', link: `/catalog/courses/${definition.summary.courseId}` })),
      retakeAllowed: this.countAttempts(attempt.assessmentId) < definition.summary.attemptsAllowed,
    };
    this.state.attempts[attempt.id] = { ...attempt, status: reason === 'expired' ? 'expired' : result.status };
    this.state.results[attempt.id] = result;
    this.persist();
    return result;
  }

  private reviewQuestion(question: AssessmentQuestion, response: ResponseValue | undefined, key: ResponseValue | readonly string[] | undefined): QuestionReview {
    const base = { questionId: question.id, prompt: question.prompt, points: question.points };
    if (MANUAL_TYPES.has(question.type) || key === undefined) {
      return { ...base, outcome: 'pending', pointsEarned: 0, feedback: 'Awaiting instructor review.' };
    }
    let ratio = 0;
    if (question.type === 'fill-blank') {
      ratio = (key as readonly string[]).includes(String(response ?? '').trim().toLowerCase()) ? 1 : 0;
    } else if (question.type === 'multiple') {
      const expected = new Set(key as readonly string[]);
      const given = new Set(Array.isArray(response) ? (response as readonly string[]) : []);
      const hits = [...given].filter((id) => expected.has(id)).length;
      const misses = [...given].filter((id) => !expected.has(id)).length;
      ratio = Math.max(0, (hits - misses) / expected.size);
    } else if (question.type === 'matching') {
      const expected = key as Readonly<Record<string, string>>;
      const given = (response ?? {}) as Readonly<Record<string, string>>;
      const keys = Object.keys(expected);
      ratio = keys.filter((left) => given[left] === expected[left]).length / keys.length;
    } else if (question.type === 'ordering') {
      ratio = JSON.stringify(response) === JSON.stringify(key) ? 1 : 0;
    } else {
      ratio = response === key ? 1 : 0;
    }
    const pointsEarned = Math.round(question.points * ratio * 10) / 10;
    const outcome = ratio === 1 ? 'correct' : ratio > 0 ? 'partial' : 'incorrect';
    const feedback = outcome === 'correct' ? 'Correct.' : outcome === 'partial' ? 'Partly correct. Review the related lesson.' : response == null ? 'Not answered.' : 'Not quite. Review the related lesson.';
    return { ...base, outcome, pointsEarned, feedback };
  }

  private toSummary(definition: AssessmentDefinition): AssessmentSummary {
    const attempts = Object.values(this.state.attempts).filter((attempt) => attempt.assessmentId === definition.summary.id);
    const active = attempts.find((attempt) => attempt.status === 'active' && Date.parse(attempt.deadlineAt) > Date.now());
    const results = Object.values(this.state.results).filter((result) => result.assessmentId === definition.summary.id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    const used = this.countAttempts(definition.summary.id);
    const { opensAt, ...summary } = definition.summary;
    let status: AssessmentSummary['status'] = 'available';
    if (opensAt && Date.parse(opensAt) > Date.now()) status = 'upcoming';
    else if (active) status = 'in-progress';
    else if (results[0]?.status === 'pending-grading') status = 'pending-grading';
    else if (results.length) status = 'completed';
    return { ...summary, status, attemptsUsed: used, activeAttemptId: active?.id, lastAttemptId: results[0]?.attemptId };
  }

  private countAttempts(assessmentId: string): number {
    const ids = new Set([
      ...Object.values(this.state.attempts).filter((attempt) => attempt.assessmentId === assessmentId).map((attempt) => attempt.id),
      ...Object.values(this.state.results).filter((result) => result.assessmentId === assessmentId).map((result) => result.attemptId),
    ]);
    return ids.size;
  }

  private find(assessmentId: string): AssessmentDefinition | undefined {
    return DEFINITIONS.find((definition) => definition.summary.id === assessmentId);
  }

  private load(): MockState {
    const seed: MockState = { attempts: {}, results: { [SEEDED_RESULT.attemptId]: SEEDED_RESULT }, submissions: {} };
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return seed;
      const parsed = JSON.parse(stored) as Partial<MockState>;
      return {
        attempts: parsed.attempts ?? {},
        results: { ...seed.results, ...(parsed.results ?? {}) },
        submissions: parsed.submissions ?? {},
      };
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
