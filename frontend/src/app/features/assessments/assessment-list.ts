import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AssessmentGateway, AssessmentSummary } from '../../data-access/contracts/assessment.contracts';
import { EmptyStateComponent, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent, StatusTone } from '../../shared/ui/primitives';

const STATUS: Record<AssessmentSummary['status'], { label: string; tone: StatusTone }> = {
  available: { label: 'Available', tone: 'info' },
  'in-progress': { label: 'In progress', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
  upcoming: { label: 'Opens soon', tone: 'neutral' },
  'pending-grading': { label: 'Awaiting grading', tone: 'info' },
};

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [DatePipe, RouterLink, PageHeaderComponent, StatusBadgeComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="ws-page">
      <app-page-header eyebrow="Learner workspace" heading="Assessments" intro="Quizzes and practicals across your courses. Attempts save automatically and can be resumed."></app-page-header>
      <div class="ws-tabs" role="tablist" aria-label="Filter assessments">
        @for (tab of tabs; track tab.id) {
          <button type="button" role="tab" [attr.aria-selected]="filter() === tab.id" (click)="filter.set(tab.id)">{{ tab.label }}</button>
        }
      </div>
      @if (loading()) { <app-skeleton [lines]="3" label="Loading assessments"></app-skeleton> }
      @else {
        <div class="ws-grid">
          @for (item of visible(); track item.id) {
            <article class="ws-card">
              <div class="ws-spread"><span class="ws-eyebrow">{{ item.courseTitle }}</span><app-status-badge [label]="status(item).label" [tone]="status(item).tone"></app-status-badge></div>
              <h2 class="ws-card__title">{{ item.title }}</h2>
              <dl class="ws-kv">
                <dt>Questions</dt><dd>{{ item.questionCount }}</dd>
                <dt>Time limit</dt><dd>{{ item.timeLimitMinutes }} minutes</dd>
                <dt>Attempts</dt><dd>{{ item.attemptsUsed }} of {{ item.attemptsAllowed }} used</dd>
                @if (item.dueAt) { <dt>Due</dt><dd>{{ item.dueAt | date: 'MMM d, h:mm a' }}</dd> }
              </dl>
              <div class="ws-row-flex">
                <a class="button button--primary button--sm" [routerLink]="['/student/assessments', item.id]">{{ item.status === 'in-progress' ? 'Resume' : 'View details' }}</a>
                @if (item.lastAttemptId) { <a class="button button--sm" [routerLink]="['/learn/attempts', item.lastAttemptId, 'result']">Latest result</a> }
              </div>
            </article>
          } @empty {
            <app-empty-state heading="Nothing here yet" message="Assessments appear when your courses publish them." actionLabel="Browse courses" actionLink="/catalog"></app-empty-state>
          }
        </div>
      }
    </div>
  `,
})
export class AssessmentListComponent implements OnInit {
  protected readonly tabs = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'To do' },
    { id: 'done', label: 'Completed' },
  ] as const;
  protected readonly filter = signal<'all' | 'open' | 'done'>('all');
  protected readonly items = signal<readonly AssessmentSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly visible = computed(() => {
    const filter = this.filter();
    return this.items().filter((item) => filter === 'all' || (filter === 'done' ? ['completed', 'pending-grading'].includes(item.status) : ['available', 'in-progress', 'upcoming'].includes(item.status)));
  });
  private readonly gateway = inject(AssessmentGateway);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.listAssessments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => {
      this.items.set(items);
      this.loading.set(false);
    });
  }

  protected status(item: AssessmentSummary) {
    return STATUS[item.status];
  }
}
