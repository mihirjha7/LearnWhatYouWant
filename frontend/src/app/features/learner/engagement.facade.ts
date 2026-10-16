import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EngagementSnapshot } from '../../data-access/contracts/engagement.models';
import { MockEngagementGateway } from '../../data-access/mock/mock-engagement.gateway';

@Injectable({ providedIn: 'root' })
export class EngagementFacade {
  private readonly gateway = inject(MockEngagementGateway);
  getSnapshot(): Observable<EngagementSnapshot> { return this.gateway.getSnapshot(); }
  rateReview(cardId: string, rating: 'again' | 'hard' | 'good' | 'easy'): Observable<void> { return this.gateway.rateReview(cardId, rating); }
  markNotificationsRead(ids: readonly string[]): Observable<void> { return this.gateway.markNotificationsRead(ids); }
  revokeSession(sessionId: string): Observable<void> { return this.gateway.revokeSession(sessionId); }
}
