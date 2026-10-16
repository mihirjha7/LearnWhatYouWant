import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { EngagementGateway } from '../contracts/engagement.gateway';
import { EngagementSnapshot } from '../contracts/engagement.models';

const SNAPSHOT: EngagementSnapshot = {
  reviewCards: [
    { id: 'review-1', prompt: 'When should a shared UI component own business state?', answer: 'Only when the state is intrinsic to the reusable interaction. Feature and server state should remain behind a feature facade.', source: 'Modern Angular in Practice · State boundaries', skill: 'Interface architecture' },
    { id: 'review-2', prompt: 'What makes an API operation safe to retry automatically?', answer: 'It is idempotent, the failure is transient, and the retry policy has a strict limit with backoff.', source: 'Reliable Cloud API Design · Resilience', skill: 'API reliability' },
    { id: 'review-3', prompt: 'Why should essential chart meaning exist outside a tooltip?', answer: 'Tooltips are not persistently visible and can be unavailable to keyboard, touch, or assistive-technology users.', source: 'Data Storytelling · Accessible charts', skill: 'Data communication' },
  ],
  schedule: [
    { id: 'event-1', startsAt: '2026-08-30T15:00:00Z', title: 'Daily concept review', context: '8 cards · about 12 minutes', type: 'review' },
    { id: 'event-2', startsAt: '2026-09-02T13:30:00Z', title: 'Frontend cohort studio', context: 'Live session with Maya Chen', type: 'live' },
    { id: 'event-3', startsAt: '2026-09-04T17:00:00Z', title: 'Visual hierarchy checkpoint', context: 'Data Storytelling for Decisions', type: 'deadline' },
    { id: 'event-4', startsAt: '2026-09-08T10:00:00Z', title: 'Observable recovery practice', context: 'Modern Angular in Practice', type: 'lesson' },
  ],
  skills: [
    { id: 'skill-1', skill: 'Accessible interaction', mastery: 91, confidence: 'Strong', evidence: ['Keyboard navigation audit', 'Semantic structure project', 'Assessment score: 94%'], lastVerifiedAt: '2026-08-22T10:00:00Z', reason: 'Three recent assessments show consistent application across different interfaces.' },
    { id: 'skill-2', skill: 'Reactive data flow', mastery: 64, confidence: 'Established', evidence: ['Signals checkpoint', 'RxJS orchestration exercise'], lastVerifiedAt: '2026-08-29T10:00:00Z', reason: 'Core concepts are reliable; retry and cancellation scenarios need more evidence.' },
    { id: 'skill-3', skill: 'Data communication', mastery: 58, confidence: 'Developing', evidence: ['Chart selection exercise'], lastVerifiedAt: '2026-08-27T10:00:00Z', reason: 'Current evidence covers chart choice but not executive narrative or uncertainty.' },
  ],
  certificates: [
    { id: 'certificate-1', title: 'Accessible Web Experiences', issuedAt: '2026-08-22T12:00:00Z', verificationCode: 'LRN-A11Y-2026-1842', status: 'valid', skills: ['WCAG', 'Semantic HTML', 'Inclusive design'] },
    { id: 'certificate-2', title: 'Facilitation That Moves Work Forward', issuedAt: '2026-06-14T12:00:00Z', verificationCode: 'LRN-FAC-2026-0924', status: 'valid', skills: ['Facilitation', 'Decision making'] },
  ],
  notifications: [
    { id: 'notification-1', title: 'Feedback is ready', message: 'Maya left feedback on your semantic structure project.', createdAt: '2026-08-30T08:15:00Z', type: 'feedback', read: false },
    { id: 'notification-2', title: 'Checkpoint due Friday', message: 'Visual hierarchy checkpoint closes at 5:00 PM in your time zone.', createdAt: '2026-08-29T12:00:00Z', type: 'deadline', read: false },
    { id: 'notification-3', title: 'New transcript available', message: 'The transcript for State boundaries has finished processing.', createdAt: '2026-08-27T16:40:00Z', type: 'course', read: true },
  ],
  sessions: [
    { id: 'session-current', device: 'Windows · Chrome', location: 'Current device', lastActiveAt: '2026-08-30T12:00:00Z', current: true },
    { id: 'session-2', device: 'Android · Chrome', location: 'Bengaluru, approximate', lastActiveAt: '2026-08-28T09:30:00Z', current: false },
  ],
  messages: [
    { id: 'message-1', participant: 'Maya Chen', subject: 'Project feedback', preview: 'Your focus sequence is strong. One question about...', updatedAt: '2026-08-30T08:15:00Z', unread: true },
    { id: 'message-2', participant: 'Frontend cohort', subject: 'Wednesday studio', preview: 'Bring one state-management tradeoff you want to discuss.', updatedAt: '2026-08-28T14:00:00Z', unread: false },
  ],
  achievements: [
    { id: 'achievement-1', title: 'Inclusive builder', description: 'Completed three accessibility projects with verified evidence.', earnedAt: '2026-08-22T12:00:00Z', category: 'Accessibility' },
    { id: 'achievement-2', title: 'Focused week', description: 'Met a sustainable weekly learning plan four times.', earnedAt: '2026-08-18T12:00:00Z', category: 'Consistency' },
  ],
};

@Injectable({ providedIn: 'root' })
export class MockEngagementGateway implements EngagementGateway {
  getSnapshot(): Observable<EngagementSnapshot> { return of(SNAPSHOT).pipe(delay(120)); }
  rateReview(_cardId: string, _rating: 'again' | 'hard' | 'good' | 'easy'): Observable<void> { return of(undefined).pipe(delay(120)); }
  markNotificationsRead(_notificationIds: readonly string[]): Observable<void> { return of(undefined).pipe(delay(100)); }
  revokeSession(_sessionId: string): Observable<void> { return of(undefined).pipe(delay(140)); }
}
