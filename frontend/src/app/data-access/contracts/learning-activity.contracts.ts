import { Observable } from 'rxjs';

export type AssignmentStatus = 'not-started' | 'draft' | 'submitted' | 'returned' | 'resubmission-requested';

export interface RubricCriterion {
  id: string;
  criterion: string;
  description: string;
  points: number;
  levels: readonly { label: string; points: number; description: string }[];
}

export interface AssignmentSummary {
  id: string;
  title: string;
  courseTitle: string;
  dueAt: string;
  status: AssignmentStatus;
  points: number;
}

export interface SubmissionFile {
  name: string;
  sizeKb: number;
  scanStatus: 'pending' | 'clean' | 'blocked';
}

export interface SubmissionVersion {
  version: number;
  submittedAt: string;
  status: 'submitted' | 'returned' | 'resubmission-requested';
  score?: number;
  text?: string;
  link?: string;
  files: readonly SubmissionFile[];
}

export interface AssignmentFeedback {
  grader: string;
  returnedAt: string;
  summary: string;
  scores: readonly { criterionId: string; score: number; comment: string }[];
}

export interface AssignmentDetail extends AssignmentSummary {
  instructions: readonly string[];
  latePolicy: string;
  timeZone: string;
  resources: readonly { name: string; sizeKb: number }[];
  submissionTypes: readonly ('text' | 'link' | 'file')[];
  rubric: readonly RubricCriterion[];
  history: readonly SubmissionVersion[];
  feedback?: AssignmentFeedback;
  draft: { text: string; link: string; files: readonly SubmissionFile[]; savedAt?: string };
}

export interface DiscussionReply {
  id: string;
  author: string;
  role: 'Learner' | 'Instructor' | 'Teaching assistant';
  body: string;
  createdAt: string;
  accepted?: boolean;
  helpfulCount: number;
}

export interface DiscussionThread {
  id: string;
  courseTitle: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  pinned: boolean;
  answered: boolean;
  tags: readonly string[];
  replies: readonly DiscussionReply[];
}

export interface LearnerNote {
  id: string;
  courseTitle: string;
  lessonTitle: string;
  timestamp?: string;
  body: string;
  tags: readonly string[];
  updatedAt: string;
}

export interface CredentialVerification {
  code: string;
  state: 'valid' | 'revoked' | 'expired' | 'not-found';
  holder?: string;
  title?: string;
  issuer?: string;
  issuedAt?: string;
  expiresAt?: string;
  skills?: readonly string[];
  evidence?: readonly string[];
}

export abstract class LearningActivityGateway {
  abstract listAssignments(): Observable<readonly AssignmentSummary[]>;
  abstract getAssignment(id: string): Observable<AssignmentDetail>;
  abstract saveAssignmentDraft(id: string, draft: AssignmentDetail['draft']): Observable<{ savedAt: string }>;
  abstract submitAssignment(id: string, draft: AssignmentDetail['draft'], idempotencyKey: string): Observable<AssignmentDetail>;
  abstract listThreads(): Observable<readonly DiscussionThread[]>;
  abstract reply(threadId: string, body: string): Observable<DiscussionReply>;
  abstract createThread(title: string, body: string, courseTitle: string): Observable<DiscussionThread>;
  abstract reportReply(threadId: string, replyId: string, reason: string): Observable<void>;
  abstract listNotes(): Observable<readonly LearnerNote[]>;
  abstract saveNote(note: Omit<LearnerNote, 'id' | 'updatedAt'> & { id?: string }): Observable<LearnerNote>;
  abstract deleteNote(id: string): Observable<void>;
  abstract verifyCredential(code: string): Observable<CredentialVerification>;
}
