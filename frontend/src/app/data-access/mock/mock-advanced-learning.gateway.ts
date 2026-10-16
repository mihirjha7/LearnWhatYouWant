import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import {
  AdvancedLearningGateway,
  LabDefinition,
  LabRunResult,
  LiveRoom,
  LiveSession,
} from '../contracts/advanced-learning.contracts';

const SESSIONS: readonly LiveSession[] = [
  { id: 'live-1', title: 'Frontend cohort studio', course: 'Modern Angular in Practice', host: 'Arjun Rao', startsAt: '2026-10-14T13:30:00Z', durationMinutes: 60, status: 'live', registered: 38, recordingAvailable: false },
  { id: 'live-2', title: 'API design clinic', course: 'Reliable Cloud API Design', host: 'Priya Nair', startsAt: '2026-10-21T15:00:00Z', durationMinutes: 45, status: 'scheduled', registered: 52, recordingAvailable: false },
  { id: 'live-3', title: 'Screen reader walkthrough', course: 'Accessible Web Experiences', host: 'Maya Chen', startsAt: '2026-10-07T14:00:00Z', durationMinutes: 50, status: 'ended', registered: 64, recordingAvailable: true },
];

const LABS: Record<string, LabDefinition> = {
  'lab-backoff': {
    id: 'lab-backoff',
    title: 'Exponential backoff with a ceiling',
    course: 'Reliable Cloud API Design',
    language: 'TypeScript',
    timeLimitMinutes: 30,
    instructions: [
      'Implement retryDelay(attempt) so attempt 0 returns 200 ms and each attempt doubles the delay.',
      'Never return more than 5000 ms.',
      'Negative attempts should be treated as 0.',
    ],
    starterCode: 'export function retryDelay(attempt: number): number {\n  // Your implementation\n  return 0;\n}\n',
    tests: [
      { id: 't1', name: 'attempt 0 returns 200', visible: true },
      { id: 't2', name: 'doubles each attempt', visible: true },
      { id: 't3', name: 'caps at 5000', visible: true },
      { id: 'h1', name: 'hidden edge cases', visible: false },
      { id: 'h2', name: 'hidden performance', visible: false },
    ],
    hints: ['Use 2 ** attempt to compute the multiplier.', 'Math.min keeps a value under a ceiling.', 'Math.max(0, attempt) guards negative input.'],
  },
};

@Injectable({ providedIn: 'root' })
export class MockAdvancedLearningGateway extends AdvancedLearningGateway {
  listLiveSessions(): Observable<readonly LiveSession[]> {
    return of(SESSIONS).pipe(delay(150));
  }

  getLiveRoom(sessionId: string): Observable<LiveRoom> {
    const session = SESSIONS.find((item) => item.id === sessionId);
    if (!session) return throwError(() => ({ status: 404 }));
    return of<LiveRoom>({
      session,
      participants: [
        { id: 'p0', name: session.host, role: 'Host', handRaised: false },
        { id: 'p1', name: 'Leo Martins', role: 'Learner', handRaised: true },
        { id: 'p2', name: 'Mei Tanaka', role: 'Learner', handRaised: false },
        { id: 'p3', name: 'Sam Okafor', role: 'Learner', handRaised: false },
      ],
      chat: [
        { id: 'm1', author: session.host, body: 'Welcome! We start with a five-minute recap.', at: '2026-10-14T13:31:00Z' },
        { id: 'm2', author: 'Mei Tanaka', body: 'Will the slides be shared after?', at: '2026-10-14T13:33:00Z' },
      ],
      poll: { question: 'Which topic should we go deeper on?', options: [ { id: 'o1', label: 'Signals vs RxJS', votes: 12 }, { id: 'o2', label: 'Facade testing', votes: 7 }, { id: 'o3', label: 'Error handling', votes: 9 } ] },
      agenda: ['Recap: state boundaries', 'Live refactor', 'Q&A', 'Comprehension check'],
    }).pipe(delay(200));
  }

  getLab(labId: string): Observable<LabDefinition> {
    const lab = LABS[labId];
    return lab ? of(lab).pipe(delay(160)) : throwError(() => ({ status: 404 }));
  }

  /** Simulated server-side runner: inspects source text only and never executes learner code. */
  runLab(labId: string, code: string): Observable<LabRunResult> {
    const lab = LABS[labId];
    if (!lab) return throwError(() => ({ status: 404 }));
    const compact = code.replace(/\s+/g, ' ');
    const hasBase = /200/.test(compact);
    const doubles = /2\s*\*\*|Math\.pow\(\s*2|<<\s*attempt/.test(compact);
    const caps = /Math\.min\([^)]*5000|5000/.test(compact) && /Math\.min/.test(compact);
    const guards = /Math\.max\(\s*0/.test(compact);
    const results = [
      { testId: 't1', name: 'attempt 0 returns 200', passed: hasBase, message: hasBase ? 'Returned 200 ms.' : 'Expected 200, received 0.' },
      { testId: 't2', name: 'doubles each attempt', passed: hasBase && doubles, message: hasBase && doubles ? 'attempt 3 → 1600 ms.' : 'Expected 1600 for attempt 3.' },
      { testId: 't3', name: 'caps at 5000', passed: caps, message: caps ? 'attempt 10 → 5000 ms.' : 'Expected 5000 for attempt 10.' },
    ];
    const hiddenPassed = (guards ? 1 : 0) + (caps && doubles ? 1 : 0);
    return of({
      output: `> tsc --noEmit\n> run visible tests\n${results.map((result) => `${result.passed ? 'PASS' : 'FAIL'}  ${result.name}`).join('\n')}`,
      results,
      hiddenSummary: { passed: hiddenPassed, total: 2 },
    }).pipe(delay(900));
  }
}
