import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../../core/notifications/notification.service';
import { AssessmentDetail, AssessmentGateway } from '../../data-access/contracts/assessment.contracts';
import { EmptyStateComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui/primitives';

@Component({
  selector: 'app-assessment-overview',
  standalone: true,
  imports: [DatePipe, RouterLink, PageHeaderComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="ws-page">
      @if (loading()) { <app-skeleton [lines]="2" label="Loading assessment"></app-skeleton> }
      @else if (detail(); as item) {
        <a routerLink="/student/assessments" class="ws-small">&larr; All assessments</a>
        <app-page-header [eyebrow]="item.courseTitle" [heading]="item.title" intro="Review the policies below before you begin."></app-page-header>
        <div class="ws-split">
          <section class="ws-card" aria-labelledby="instructions-title">
            <h2 id="instructions-title">Instructions</h2>
            <ul>@for (line of item.instructions; track line) { <li>{{ line }}</li> }</ul>
            <dl class="ws-kv">
              <dt>Grading</dt><dd>{{ item.gradingMethod }}</dd>
              <dt>Feedback</dt><dd>{{ item.feedbackPolicy }}</dd>
              <dt>Resources</dt><dd>{{ item.allowedResources }}</dd>
              <dt>Accommodations</dt><dd>{{ item.accommodations }}</dd>
            </dl>
          </section>
          <aside class="ws-stack">
            <section class="ws-card" aria-label="Attempt details">
              <dl class="ws-kv">
                <dt>Questions</dt><dd>{{ item.questionCount }}</dd>
                <dt>Time limit</dt><dd>{{ item.timeLimitMinutes }} minutes</dd>
                <dt>Passing score</dt><dd>{{ item.passingScore }}%</dd>
                <dt>Attempts</dt><dd>{{ item.attemptsUsed }} of {{ item.attemptsAllowed }}</dd>
                @if (item.dueAt) { <dt>Due</dt><dd>{{ item.dueAt | date: 'MMM d, y, h:mm a' }}</dd> }
              </dl>
              @if (item.status === 'upcoming') {
                <p class="ws-banner">This assessment is not open yet.</p>
              } @else if (item.status === 'in-progress') {
                <button type="button" class="button button--primary" [disabled]="starting()" (click)="start()">{{ starting() ? 'Opening…' : 'Resume attempt' }}</button>
                <small class="ws-muted">The timer kept running while you were away.</small>
              } @else if (item.attemptsUsed < item.attemptsAllowed) {
                <button type="button" class="button button--primary" [disabled]="starting()" (click)="start()">{{ starting() ? 'Starting…' : 'Start attempt' }}</button>
                <small class="ws-muted">The {{ item.timeLimitMinutes }}-minute timer starts when you select Start.</small>
              } @else {
                <p class="ws-banner">You have used all available attempts.</p>
              }
            </section>
            <section class="ws-card" aria-labelledby="history-title">
              <h2 id="history-title" class="ws-card__title">Attempt history</h2>
              <ul class="ws-list">
                @for (attempt of item.history; track attempt.attemptId) {
                  <li><span class="ws-item__body"><strong>{{ attempt.scorePercent === null ? 'Awaiting grading' : attempt.scorePercent + '%' }}</strong><span>{{ attempt.submittedAt | date: 'MMM d, h:mm a' }}</span></span><a [routerLink]="['/learn/attempts', attempt.attemptId, 'result']">Review</a></li>
                } @empty { <li class="ws-muted ws-small">No submitted attempts yet.</li> }
              </ul>
            </section>
          </aside>
        </div>
      } @else {
        <app-empty-state tone="error" heading="Assessment not found" message="It may have been removed or you may not have access." actionLabel="Back to assessments" actionLink="/student/assessments"></app-empty-state>
      }
    </div>
  `,
})
export class AssessmentOverviewComponent implements OnInit {
  protected readonly detail = signal<AssessmentDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly starting = signal(false);
  private readonly gateway = inject(AssessmentGateway);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('assessmentId') ?? '';
    this.gateway.getAssessment(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (detail) => { this.detail.set(detail); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected start(): void {
    const detail = this.detail();
    if (!detail || this.starting()) return;
    this.starting.set(true);
    this.gateway.startOrResumeAttempt(detail.id).pipe(finalize(() => this.starting.set(false))).subscribe({
      next: (attempt) => void this.router.navigate(['/learn/attempts', attempt.id]),
      error: () => this.notifications.show('This attempt could not be started', { detail: 'It may not be open yet, or all attempts are used.', tone: 'warning' }),
    });
  }
}
