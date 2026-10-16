import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { InstructorGateway, InstructorOverview } from '../../data-access/contracts/instructor.contracts';
import { AuthService } from '../../services/auth-service';
import { MetricCardComponent, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent } from '../../shared/ui/primitives';
import { LIFECYCLE } from './lifecycle';

@Component({
  selector: 'app-instructor-overview',
  standalone: true,
  imports: [DatePipe, RouterLink, PageHeaderComponent, MetricCardComponent, SkeletonComponent, StatusBadgeComponent],
  template: `
    <div class="ws-page">
      <app-page-header eyebrow="Teaching workspace" [heading]="'Welcome back, ' + firstName" intro="What needs you today, and how your courses are doing.">
        <a class="button" routerLink="/instructor/createcourse">Quick create</a>
        <a class="button button--primary" routerLink="/instructor/studio">Open course studio</a>
      </app-page-header>
      @if (loading()) { <app-skeleton [lines]="3" label="Loading teaching overview"></app-skeleton> }
      @else if (data(); as d) {
        <div class="ws-metrics">
          @for (metric of d.metrics; track metric.label) { <app-metric-card [label]="metric.label" [value]="metric.value" [context]="metric.context" [tone]="metric.tone"></app-metric-card> }
        </div>
        <div class="ws-split">
          <div class="ws-stack">
            <section class="ws-card" aria-labelledby="attention-title">
              <div class="ws-spread"><h2 id="attention-title">Needs attention</h2><span class="ws-small ws-muted">{{ d.attention.length }} items</span></div>
              <ul class="ws-list">
                @for (item of d.attention; track item.id) {
                  <li>
                    <span class="ws-chip">{{ kindLabel[item.kind] }}</span>
                    <span class="ws-item__body"><strong>{{ item.title }}</strong><span>{{ item.detail }}</span></span>
                    <a class="button button--sm" [routerLink]="item.link">Open</a>
                  </li>
                } @empty { <li class="ws-muted">You are all caught up.</li> }
              </ul>
            </section>
            <section class="ws-card ws-card--flush" aria-labelledby="health-title">
              <div class="ws-spread" style="padding: 1.25rem 1.25rem 0"><h2 id="health-title">Course health</h2><a routerLink="/instructor/analytics" class="ws-small">View analytics</a></div>
              <div class="responsive-table" style="border: 0; border-radius: 0">
                <table>
                  <thead><tr><th scope="col">Course</th><th scope="col">Status</th><th scope="col">Learners</th><th scope="col">Completion</th><th scope="col">Mastery</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead>
                  <tbody>
                    @for (course of d.courses; track course.id) {
                      <tr>
                        <td><strong>{{ course.title }}</strong><br /><span class="ws-xs ws-muted">Updated {{ course.updatedAt | date: 'MMM d' }}</span></td>
                        <td><app-status-badge [label]="lifecycle[course.status].label" [tone]="lifecycle[course.status].tone"></app-status-badge></td>
                        <td>{{ course.learners }}</td><td>{{ course.completion }}%</td><td>{{ course.mastery }}%</td>
                        <td><a class="button button--sm" [routerLink]="['/instructor/studio', course.id]">{{ course.status === 'draft' ? 'Continue editing' : 'Manage' }}</a></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          <aside class="ws-stack">
            <section class="ws-card" aria-labelledby="upcoming-title">
              <h2 id="upcoming-title" class="ws-card__title">Upcoming</h2>
              <ul class="ws-list">@for (item of d.upcoming; track item.id) { <li><span class="ws-item__body"><strong>{{ item.title }}</strong><span>{{ item.startsAt | date: 'EEE, MMM d · h:mm a' }} · {{ item.context }}</span></span></li> }</ul>
            </section>
            <section class="ws-card">
              <h2 class="ws-card__title">Shortcuts</h2>
              <a routerLink="/instructor/grading">Grading queue</a>
              <a routerLink="/instructor/question-bank">Question bank</a>
              <a routerLink="/instructor/live">Live sessions</a>
            </section>
          </aside>
        </div>
      }
    </div>
  `,
})
export class InstructorOverviewComponent implements OnInit {
  protected readonly data = signal<InstructorOverview | null>(null);
  protected readonly loading = signal(true);
  protected readonly lifecycle = LIFECYCLE;
  protected readonly kindLabel = { grading: 'Grading', upload: 'Media', question: 'Question', publish: 'Publish' } as const;
  protected readonly firstName = inject(AuthService).getCurrentUser()?.displayName.split(' ')[0] ?? 'Instructor';
  private readonly gateway = inject(InstructorGateway);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.getOverview().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.data.set(data);
      this.loading.set(false);
    });
  }
}
