import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AssignmentSummary, LearningActivityGateway } from '../../../data-access/contracts/learning-activity.contracts';
import { EmptyStateComponent, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent, StatusTone } from '../../../shared/ui/primitives';

export const ASSIGNMENT_STATUS: Record<AssignmentSummary['status'], { label: string; tone: StatusTone }> = {
  'not-started': { label: 'Not started', tone: 'neutral' },
  draft: { label: 'Draft saved', tone: 'info' },
  submitted: { label: 'Submitted', tone: 'active' },
  returned: { label: 'Feedback ready', tone: 'success' },
  'resubmission-requested': { label: 'Resubmission requested', tone: 'warning' },
};

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [DatePipe, RouterLink, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="ws-page">
      <app-page-header eyebrow="Learner workspace" heading="Assignments" intro="Drafts save as you work. Submissions are versioned so you can see every change."></app-page-header>
      @if (loading()) { <app-skeleton [lines]="3" label="Loading assignments"></app-skeleton> }
      @else {
        <div class="responsive-table">
          <table>
            <caption class="sr-only">Assignments</caption>
            <thead><tr><th scope="col">Assignment</th><th scope="col">Course</th><th scope="col">Due</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr>
                  <td><strong>{{ item.title }}</strong><br /><span class="ws-xs ws-muted">{{ item.points }} points</span></td>
                  <td>{{ item.courseTitle }}</td>
                  <td>{{ item.dueAt | date: 'MMM d, h:mm a' }}</td>
                  <td><app-status-badge [label]="status[item.status].label" [tone]="status[item.status].tone"></app-status-badge></td>
                  <td><a class="button button--sm" [routerLink]="['/student/assignments', item.id]">{{ item.status === 'returned' ? 'View feedback' : 'Open' }}</a></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (!items().length) { <app-empty-state heading="No assignments" message="Assignments from your courses will appear here."></app-empty-state> }
      }
    </div>
  `,
})
export class AssignmentListComponent implements OnInit {
  protected readonly items = signal<readonly AssignmentSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly status = ASSIGNMENT_STATUS;
  private readonly gateway = inject(LearningActivityGateway);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.listAssignments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => {
      this.items.set(items);
      this.loading.set(false);
    });
  }
}
