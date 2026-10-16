import { Observable } from 'rxjs';
import { EngagementSnapshot } from './engagement.models';

export abstract class EngagementGateway {
  abstract getSnapshot(): Observable<EngagementSnapshot>;
  abstract rateReview(cardId: string, rating: 'again' | 'hard' | 'good' | 'easy'): Observable<void>;
  abstract markNotificationsRead(notificationIds: readonly string[]): Observable<void>;
  abstract revokeSession(sessionId: string): Observable<void>;
}
