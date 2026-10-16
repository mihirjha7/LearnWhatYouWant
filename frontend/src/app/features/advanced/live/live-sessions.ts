import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdvancedLearningGateway, LiveSession } from '../../../data-access/contracts/advanced-learning.contracts';
import { PageHeaderComponent, SkeletonComponent, StatusBadgeComponent } from '../../../shared/ui/primitives';

@Component({
  selector: 'app-live-sessions',
  standalone: true,
  imports: [DatePipe, RouterLink, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent],
  template: `
    <div class="ws-page">
      <app-page-header eyebrow="Live learning" heading="Live sessions" intro="Join live classes, catch up on recordings, and prepare your device ahead of time."></app-page-header>
      @if (loading()) { <app-skeleton [lines]="2" label="Loading sessions"></app-skeleton> }
      @else {
        <div class="ws-grid">
          @for (session of sessions(); track session.id) {
            <article class="ws-card">
              <div class="ws-spread"><span class="ws-eyebrow">{{ session.course }}</span>
                <app-status-badge [label]="session.status === 'live' ? 'Live now' : session.status === 'scheduled' ? 'Scheduled' : 'Ended'" [tone]="session.status === 'live' ? 'danger' : session.status === 'scheduled' ? 'info' : 'neutral'"></app-status-badge></div>
              <h2 class="ws-card__title">{{ session.title }}</h2>
              <dl class="ws-kv"><dt>Host</dt><dd>{{ session.host }}</dd><dt>When</dt><dd>{{ session.startsAt | date: 'EEE, MMM d · h:mm a' }}</dd><dt>Length</dt><dd>{{ session.durationMinutes }} min</dd><dt>Registered</dt><dd>{{ session.registered }}</dd></dl>
              @if (session.status === 'live') { <a class="button button--primary button--sm" [routerLink]="['/learn/live', session.id]">Join session</a> }
              @else if (session.status === 'scheduled') { <a class="button button--sm" [routerLink]="['/learn/live', session.id]">Device check and details</a> }
              @else if (session.recordingAvailable) { <a class="button button--sm" [routerLink]="['/learn/live', session.id]">Watch recording</a> }
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class LiveSessionsComponent implements OnInit {
  protected readonly sessions = signal<readonly LiveSession[]>([]);
  protected readonly loading = signal(true);
  private readonly gateway = inject(AdvancedLearningGateway);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.listLiveSessions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((sessions) => {
      this.sessions.set(sessions);
      this.loading.set(false);
    });
  }
}
