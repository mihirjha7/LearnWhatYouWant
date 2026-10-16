import { Observable } from 'rxjs';

export interface LiveSession {
  id: string;
  title: string;
  course: string;
  host: string;
  startsAt: string;
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'ended';
  registered: number;
  recordingAvailable: boolean;
}

export interface LiveRoom {
  session: LiveSession;
  participants: readonly { id: string; name: string; role: 'Host' | 'Learner'; handRaised: boolean }[];
  chat: readonly { id: string; author: string; body: string; at: string }[];
  poll?: { question: string; options: readonly { id: string; label: string; votes: number }[] };
  agenda: readonly string[];
}

export interface LabTest {
  id: string;
  name: string;
  visible: boolean;
}

export interface LabDefinition {
  id: string;
  title: string;
  course: string;
  language: string;
  instructions: readonly string[];
  starterCode: string;
  tests: readonly LabTest[];
  hints: readonly string[];
  timeLimitMinutes: number;
}

export interface LabRunResult {
  output: string;
  results: readonly { testId: string; name: string; passed: boolean; message: string }[];
  hiddenSummary: { passed: number; total: number };
}

export abstract class AdvancedLearningGateway {
  abstract listLiveSessions(): Observable<readonly LiveSession[]>;
  abstract getLiveRoom(sessionId: string): Observable<LiveRoom>;
  abstract getLab(labId: string): Observable<LabDefinition>;
  abstract runLab(labId: string, code: string): Observable<LabRunResult>;
}
