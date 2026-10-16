import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { LearnerCourseSummary, LearningStatus } from '../../../../data-access/contracts/learner.models';
import { LearnerFacade } from '../../../../features/learner/learner.facade';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-my-courses.html',
  styleUrl: './student-my-courses.css',
})
export class MyCoursesComponent implements OnInit {
  protected readonly courses = signal<readonly LearnerCourseSummary[]>([]);
  protected readonly activeStatus = signal<LearningStatus | 'all'>('active');
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly sort = new FormControl<'recent' | 'progress' | 'deadline'>('recent', { nonNullable: true });
  protected readonly filterVersion = signal(0);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly filteredCourses = computed(() => {
    this.filterVersion();
    const term = this.search.value.trim().toLowerCase();
    const status = this.activeStatus();
    let courses = this.courses().filter((course) => (status === 'all' || course.status === status) && (!term || `${course.title} ${course.instructorName} ${course.category}`.toLowerCase().includes(term)));
    if (this.sort.value === 'progress') courses = [...courses].sort((a, b) => b.progress - a.progress);
    else if (this.sort.value === 'deadline') courses = [...courses].sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'));
    else courses = [...courses].sort((a, b) => b.lastAccessedAt.localeCompare(a.lastAccessedAt));
    return courses;
  });
  protected readonly tabs: readonly { label: string; value: LearningStatus | 'all' }[] = [
    { label: 'Active', value: 'active' }, { label: 'Completed', value: 'completed' }, { label: 'Assigned', value: 'assigned' }, { label: 'Saved', value: 'saved' }, { label: 'All', value: 'all' },
  ];
  private readonly learner = inject(LearnerFacade);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.learner.getMyLearning().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (courses) => { this.courses.set(courses); this.isLoading.set(false); }, error: () => { this.errorMessage.set('Your learning library could not be refreshed.'); this.isLoading.set(false); } });
    this.search.valueChanges.pipe(debounceTime(120), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.filterVersion.update((value) => value + 1));
    this.sort.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.filterVersion.update((value) => value + 1));
  }

  protected setStatus(status: LearningStatus | 'all'): void { this.activeStatus.set(status); }
  protected countForStatus(status: LearningStatus | 'all'): number { return status === 'all' ? this.courses().length : this.courses().filter((course) => course.status === status).length; }
  protected courseLink(course: LearnerCourseSummary): readonly (string | number)[] { return course.legacyId ? ['/course', course.legacyId, 'learn'] : ['/catalog/courses', course.id]; }
  protected clearSearch(): void { this.search.setValue(''); }
}
