import { Observable } from 'rxjs';

export type QuestionType =
  | 'single'
  | 'multiple'
  | 'true-false'
  | 'matching'
  | 'ordering'
  | 'fill-blank'
  | 'short-answer'
  | 'essay'
  | 'code'
  | 'file';

export type AssessmentStatus = 'available' | 'in-progress' | 'completed' | 'upcoming' | 'pending-grading';
export type AttemptStatus = 'active' | 'submitted' | 'pending-grading' | 'graded' | 'expired';

/** Matching responses map left-item IDs to right-option IDs; ordering uses ordered IDs. */
export type ResponseValue = string | readonly string[] | Readonly<Record<string, string>> | null;

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  options?: readonly ChoiceOption[];
  matchLeft?: readonly ChoiceOption[];
  matchRight?: readonly ChoiceOption[];
  orderItems?: readonly ChoiceOption[];
  placeholder?: string;
  starterCode?: string;
  language?: string;
  acceptedFileTypes?: string;
  maxFileSizeMb?: number;
}

export interface AssessmentSummary {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  status: AssessmentStatus;
  dueAt?: string;
  timeLimitMinutes: number;
  questionCount: number;
  attemptsAllowed: number;
  attemptsUsed: number;
  passingScore: number;
  activeAttemptId?: string;
  lastAttemptId?: string;
}

export interface AssessmentDetail extends AssessmentSummary {
  instructions: readonly string[];
  gradingMethod: string;
  feedbackPolicy: string;
  allowedResources: string;
  accommodations: string;
  history: readonly AttemptHistoryItem[];
}

export interface AttemptHistoryItem {
  attemptId: string;
  submittedAt: string;
  scorePercent: number | null;
  status: AttemptStatus;
}

export interface Attempt {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  courseTitle: string;
  status: AttemptStatus;
  startedAt: string;
  deadlineAt: string;
  questions: readonly AssessmentQuestion[];
  responses: Readonly<Record<string, ResponseValue>>;
  flagged: readonly string[];
  version: number;
}

export interface QuestionReview {
  questionId: string;
  prompt: string;
  outcome: 'correct' | 'incorrect' | 'partial' | 'pending';
  pointsEarned: number;
  points: number;
  feedback: string;
}

export interface AttemptResult {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  courseTitle: string;
  status: 'graded' | 'pending-grading';
  scorePercent: number | null;
  passingScore: number;
  pointsEarned: number;
  pointsPossible: number;
  submittedAt: string;
  review: readonly QuestionReview[];
  masteryEffects: readonly { skill: string; change: number; reason: string }[];
  remediation: readonly { title: string; reason: string; link: string }[];
  retakeAllowed: boolean;
}

export abstract class AssessmentGateway {
  abstract listAssessments(): Observable<readonly AssessmentSummary[]>;
  abstract getAssessment(assessmentId: string): Observable<AssessmentDetail>;
  abstract startOrResumeAttempt(assessmentId: string): Observable<Attempt>;
  abstract getAttempt(attemptId: string): Observable<Attempt>;
  abstract saveResponses(
    attemptId: string,
    responses: Readonly<Record<string, ResponseValue>>,
    flagged: readonly string[],
  ): Observable<{ savedAt: string; version: number }>;
  abstract submitAttempt(attemptId: string, idempotencyKey: string): Observable<AttemptResult>;
  abstract getResult(attemptId: string): Observable<AttemptResult>;
}
