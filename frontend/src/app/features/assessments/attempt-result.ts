import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssessmentGateway, AttemptResult } from '../../data-access/contracts/assessment.contracts';
import { EmptyStateComponent, MetricCardComponent, SkeletonComponent, StatusBadgeComponent } from '../../shared/ui/primitives';

@Component({
  selector: 'app-attempt-result',
  standalone: true,
  imports: [DatePipe, RouterLink, SkeletonComponent, EmptyStateComponent, MetricCardComponent, StatusBadgeComponent],
  template: `
    <div class="ws-focus">
      <header class="ws-focus__bar">
        <a routerLink="/student/assessments">&larr; Back to assessments</a>
        <strong>Attempt result</strong>
      </header>
      <div class="ws-focus__body ws-page">
        @if (loading()) { <app-skeleton [lines]="3" label="Loading result"></app-skeleton> }
        @else if (result(); as r) {
          <header class="ws-header">
            <div>
              <p class="ws-eyebrow">{{ r.courseTitle }}</p>
              <h1>{{ r.assessmentTitle }}</h1>
              <span class="ws-header__intro">Submitted {{ r.submittedAt | date: 'MMM d, y, h:mm a' }}</span>
            </div>
            @if (r.status === 'pending-grading') { <app-status-badge label="Awaiting instructor grading" tone="info"></app-status-badge> }
            @else if ((r.scorePercent ?? 0) >= r.passingScore) { <app-status-badge label="Passed" tone="success"></app-status-badge> }
            @else { <app-status-badge label="Not yet passed" tone="warning"></app-status-badge> }
          </header>

          <div class="ws-metrics">
            <app-metric-card label="Score" [value]="r.scorePercent === null ? 'Pending' : r.scorePercent + '%'" [context]="'Passing score ' + r.passingScore + '%'" tone="brand"></app-metric-card>
            <app-metric-card label="Points" [value]="r.pointsEarned + ' / ' + r.pointsPossible" [context]="r.status === 'pending-grading' ? 'Auto-graded portion only' : 'All questions graded'"></app-metric-card>
            @for (effect of r.masteryEffects; track effect.skill) {
              <app-metric-card [label]="effect.skill" [value]="(effect.change > 0 ? '+' : '') + effect.change + ' mastery'" [context]="effect.reason" [tone]="effect.change > 0 ? 'progress' : 'warm'"></app-metric-card>
            }
          </div>

          @if (r.status === 'pending-grading') {
            <p class="ws-banner">Written, code, and file responses are graded by your instructor. You will be notified when feedback is released.</p>
          }

          <div class="ws-split">
            <section class="ws-card" aria-labelledby="review-title">
              <h2 id="review-title">Question review</h2>
              <ol class="ws-list" style="padding: 0">
                @for (item of r.review; track item.questionId; let i = $index) {
                  <li>
                    <span class="ws-item__body"><strong>{{ i + 1 }}. {{ item.prompt }}</strong><span>{{ item.feedback }}</span></span>
                    <span class="ws-row-flex">
                      <span class="ws-small">{{ item.pointsEarned }}/{{ item.points }}</span>
                      <app-status-badge [label]="outcomeLabel[item.outcome]" [tone]="outcomeTone[item.outcome]"></app-status-badge>
                    </span>
                  </li>
                }
              </ol>
            </section>
            <aside class="ws-stack">
              <section class="ws-card">
                <h2 class="ws-card__title">Recommended next steps</h2>
                @for (step of r.remediation; track step.title) {
                  <a [routerLink]="step.link" class="ws-stack" style="gap: 0"><strong>{{ step.title }}</strong><span class="ws-small ws-muted">{{ step.reason }}</span></a>
                } @empty { <p class="ws-small ws-muted">No remediation needed. Continue with your next lesson.</p> }
              </section>
              <section class="ws-card">
                @if (r.retakeAllowed) { <a class="button button--primary" [routerLink]="['/student/assessments', r.assessmentId]">Retake assessment</a> }
                <a class="button" routerLink="/student/dashboard">Return to dashboard</a>
              </section>
            </aside>
          </div>
        } @else {
          <app-empty-state tone="error" heading="Result not available" message="This attempt may still be in progress or belong to another account." actionLabel="Back to assessments" actionLink="/student/assessments"></app-empty-state>
        }
      </div>
    </div>
  `,
})
export class AttemptResultComponent implements OnInit {
  protected readonly result = signal<AttemptResult | null>(null);
  protected readonly loading = signal(true);
  protected readonly outcomeLabel = { correct: 'Correct', incorrect: 'Incorrect', partial: 'Partial', pending: 'Pending' } as const;
  protected readonly outcomeTone = { correct: 'success', incorrect: 'danger', partial: 'warning', pending: 'info' } as const;
  private readonly gateway = inject(AssessmentGateway);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('attemptId') ?? '';
    this.gateway.getResult(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => { this.result.set(result); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
