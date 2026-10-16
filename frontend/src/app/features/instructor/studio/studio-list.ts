import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CourseHealth, InstructorGateway } from '../../../data-access/contracts/instructor.contracts';
import { PageHeaderComponent, SkeletonComponent, StatusBadgeComponent } from '../../../shared/ui/primitives';
import { LIFECYCLE } from '../lifecycle';

@Component({
  selector: 'app-studio-list',
  standalone: true,
  imports: [DatePipe, RouterLink, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent],
  template: `
    <div class="ws-page">
      <app-page-header eyebrow="Course studio" heading="Your courses" intro="Drafts autosave. Publishing runs a readiness check first.">
        <a class="button button--primary" routerLink="/instructor/createcourse">Create course</a>
      </app-page-header>
      <div class="ws-toolbar" role="search">
        <label class="ws-field"><span>Search</span><input type="search" (input)="query.set($any($event.target).value)" /></label>
        <label class="ws-field"><span>Status</span><select (change)="status.set($any($event.target).value)"><option value="">All</option><option value="draft">Draft</option><option value="in-review">In review</option><option value="scheduled">Scheduled</option><option value="published">Published</option></select></label>
      </div>
      @if (loading()) { <app-skeleton [lines]="2" label="Loading courses"></app-skeleton> }
      @else {
        <div class="responsive-table">
          <table>
            <thead><tr><th scope="col">Course</th><th scope="col">Status</th><th scope="col">Learners</th><th scope="col">Completion</th><th scope="col">Last updated</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
            <tbody>
              @for (course of courses(); track course.id) {
                @if ((!status() || course.status === status()) && (!query() || course.title.toLowerCase().includes(query().toLowerCase()))) {
                  <tr>
                    <td><strong>{{ course.title }}</strong></td>
                    <td><app-status-badge [label]="lifecycle[course.status].label" [tone]="lifecycle[course.status].tone"></app-status-badge></td>
                    <td>{{ course.learners }}</td><td>{{ course.completion }}%</td><td>{{ course.updatedAt | date: 'MMM d, y' }}</td>
                    <td><span class="ws-row-flex"><a class="button button--sm button--primary" [routerLink]="['/instructor/studio', course.id]">{{ course.status === 'draft' ? 'Continue editing' : 'Manage' }}</a><a class="button button--sm" [routerLink]="['/catalog/courses', course.id]">Preview</a></span></td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class StudioListComponent implements OnInit {
  protected readonly courses = signal<readonly CourseHealth[]>([]);
  protected readonly loading = signal(true);
  protected readonly query = signal('');
  protected readonly status = signal('');
  protected readonly lifecycle = LIFECYCLE;
  private readonly gateway = inject(InstructorGateway);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.listStudioCourses().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((courses) => {
      this.courses.set(courses);
      this.loading.set(false);
    });
  }
}
