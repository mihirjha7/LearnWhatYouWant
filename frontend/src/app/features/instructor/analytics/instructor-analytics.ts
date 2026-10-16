import { DatePipe, PercentPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AtRiskLearner, CourseAnalytics, InstructorGateway } from '../../../data-access/contracts/instructor.contracts';
import { BarDatum, BarListComponent, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent } from '../../../shared/ui/primitives';

@Component({
  selector: 'app-instructor-analytics',
  standalone: true,
  imports: [DatePipe, PercentPipe, PageHeaderComponent, SkeletonComponent, BarListComponent, StatusBadgeComponent],
  template: `
    <div class="ws-page">
      <app-page-header eyebrow="Insights" heading="Course analytics" [intro]="data() ? data()!.courseTitle + ' · last 90 days' : ''">
        <button type="button" class="button" (click)="exportCsv()" [disabled]="!data()">Export aggregate CSV</button>
      </app-page-header>
      @if (loading()) { <app-skeleton [lines]="3" label="Loading analytics"></app-skeleton> }
      @else if (data(); as d) {
        <p class="ws-banner">Groups smaller than {{ d.privacyThreshold }} learners are hidden to protect privacy. Every chart below is a readable list.</p>
        <div class="ws-grid ws-grid--2">
          <section class="ws-card" aria-labelledby="funnel-title">
            <h2 id="funnel-title" class="ws-card__title">Learner funnel</h2>
            <p class="ws-small ws-muted">Activated = opened at least one lesson. Mastered = passed every assessed outcome.</p>
            <app-bar-list [data]="funnel()" label="Learner funnel"></app-bar-list>
          </section>
          <section class="ws-card" aria-labelledby="engagement-title">
            <h2 id="engagement-title" class="ws-card__title">Lesson engagement</h2>
            <p class="ws-small ws-muted">Share of active learners who completed each lesson.</p>
            <app-bar-list [data]="engagement()" unit="%" label="Lesson completion rate"></app-bar-list>
          </section>
          <section class="ws-card" aria-labelledby="retention-title">
            <h2 id="retention-title" class="ws-card__title">Concept retention</h2>
            <p class="ws-small ws-muted">Average recall on spaced review after first mastery.</p>
            <app-bar-list [data]="retention()" unit="%" label="Retention over time"></app-bar-list>
          </section>
          <section class="ws-card" aria-labelledby="items-title">
            <h2 id="items-title" class="ws-card__title">Assessment item analysis</h2>
            <div class="responsive-table">
              <table>
                <thead><tr><th scope="col">Item</th><th scope="col">Difficulty (p)</th><th scope="col">Discrimination</th></tr></thead>
                <tbody>@for (item of d.itemAnalysis; track item.item) { <tr><td><strong>{{ item.item }}</strong><br /><span class="ws-xs ws-muted">{{ item.note }}</span></td><td>{{ item.difficulty | percent }}</td><td [style.color]="item.discrimination < 0.2 ? 'var(--warning)' : null">{{ item.discrimination }}</td></tr> }</tbody>
              </table>
            </div>
          </section>
        </div>

        <section class="ws-card" aria-labelledby="risk-title">
          <div class="ws-spread"><h2 id="risk-title">Learners who may need support</h2><span class="ws-small ws-muted">Factors are shown so you can judge, not just a score.</span></div>
          <ul class="ws-list">
            @for (learner of d.atRisk; track learner.id) {
              <li>
                <app-status-badge [label]="learner.level" [tone]="learner.level === 'Urgent' ? 'danger' : learner.level === 'Reach out' ? 'warning' : 'info'"></app-status-badge>
                <span class="ws-item__body">
                  <strong>{{ learner.learner }}</strong>
                  <span>{{ learner.course }} · last active {{ learner.lastActive | date: 'MMM d' }}</span>
                  <ul class="ws-small" style="margin: 0.25rem 0 0; padding-left: 1.1rem">@for (factor of learner.factors; track factor) { <li>{{ factor }}</li> }</ul>
                  @if (outcomes()[learner.id]; as outcome) { <small style="color: var(--success)">Recorded: {{ outcome }}</small> }
                </span>
                <label class="ws-field" style="min-width: 12rem"><span class="sr-only">Intervention for {{ learner.learner }}</span>
                  <select #action><option value="Sent supportive message">Send a message</option><option value="Assigned remediation lesson">Assign remediation</option><option value="Extended deadline">Extend deadline</option><option value="Reviewed, no action needed">No action needed</option></select>
                </label>
                <button type="button" class="button button--sm" (click)="intervene(learner, action.value)">Record</button>
              </li>
            }
          </ul>
        </section>
      }
    </div>
  `,
})
export class InstructorAnalyticsComponent implements OnInit {
  protected readonly data = signal<CourseAnalytics | null>(null);
  protected readonly loading = signal(true);
  protected readonly outcomes = signal<Record<string, string>>({});
  protected readonly funnel = computed<BarDatum[]>(() => (this.data()?.funnel ?? []).map((item) => ({ ...item, tone: 'brand' })));
  protected readonly engagement = computed<BarDatum[]>(() => (this.data()?.lessonEngagement ?? []).map((item) => ({ ...item, max: 100, tone: item.value < 50 ? 'warm' : 'progress' })));
  protected readonly retention = computed<BarDatum[]>(() => (this.data()?.retention ?? []).map((item) => ({ ...item, max: 100 })));
  private readonly gateway = inject(InstructorGateway);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.getAnalytics().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.data.set(data);
      this.loading.set(false);
    });
  }

  protected intervene(learner: AtRiskLearner, action: string): void {
    this.gateway.recordIntervention(learner.id, action).subscribe(() => {
      this.outcomes.update((outcomes) => ({ ...outcomes, [learner.id]: action }));
      this.notifications.show('Intervention recorded', { detail: `${learner.learner}: ${action}`, tone: 'success' });
    });
  }

  /** Aggregate-only export: no learner-level PII leaves the page. */
  protected exportCsv(): void {
    const d = this.data();
    if (!d) return;
    const rows = [['metric', 'label', 'value'], ...d.funnel.map((item) => ['funnel', item.label, item.value]), ...d.lessonEngagement.map((item) => ['lesson_completion_pct', item.label, item.value]), ...d.retention.map((item) => ['retention_pct', item.label, item.value])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'course-analytics.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
