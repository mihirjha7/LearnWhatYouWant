import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogCourseDetail } from '../../../data-access/contracts/catalog.models';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AuthService } from '../../../services/auth-service';
import { CatalogFacade } from '../catalog.facade';

@Component({
  selector: 'app-catalog-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog-course-detail.html',
  styleUrl: './catalog-course-detail.css',
})
export class CatalogCourseDetailComponent implements OnInit {
  protected readonly course = signal<CatalogCourseDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly enrollInFlight = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  private readonly catalog = inject(CatalogFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId');
    if (!courseId) {
      this.isLoading.set(false);
      return;
    }

    this.catalog
      .getCourse(courseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (course) => {
          this.course.set(course);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('We could not load this course. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  protected enroll(): void {
    const course = this.course();
    if (!course || this.enrollInFlight()) return;

    if (!this.auth.isLoggedIn()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/catalog/courses/${encodeURIComponent(course.id)}` },
      });
      return;
    }

    this.enrollInFlight.set(true);
    this.errorMessage.set(null);
    this.catalog
      .enroll(course.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.course.update((value) => (value ? { ...value, enrollmentState: result.state } : value));
          this.enrollInFlight.set(false);
          this.notifications.show('Course added to My Learning', {
            detail: 'Your progress will be saved from the first lesson.',
            tone: 'success',
          });
        },
        error: () => {
          this.errorMessage.set('Enrollment could not be completed. Please retry.');
          this.enrollInFlight.set(false);
        },
      });
  }

  protected continueLearning(): void {
    const course = this.course();
    if (!course) return;
    void this.router.navigate(
      course.legacyId ? ['/course', course.legacyId, 'learn'] : ['/student/my-courses'],
    );
  }

  protected totalLessons(course: CatalogCourseDetail): number {
    return course.modules.reduce((total, module) => total + module.lessons.length, 0);
  }

  protected durationLabel(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours ? `${hours}h` : ''}${hours && remainder ? ' ' : ''}${remainder ? `${remainder}m` : ''}`;
  }
}
