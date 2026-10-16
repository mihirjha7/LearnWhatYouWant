import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LearnerDashboardModel } from '../../../../data-access/contracts/learner.models';
import { LearnerFacade } from '../../../../features/learner/learner.facade';
import { AuthService } from '../../../../services/auth-service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboardComponent implements OnInit {
  protected readonly dashboard = signal<LearnerDashboardModel | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly today = new Date();
  private readonly learner = inject(LearnerFacade);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected get firstName(): string {
    return this.auth.getCurrentUser()?.displayName.split(' ')[0] || 'Learner';
  }

  ngOnInit(): void {
    this.learner
      .getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dashboard) => {
          this.dashboard.set(dashboard);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Your dashboard could not be refreshed.');
          this.isLoading.set(false);
        },
      });
  }

  protected courseLink(courseId: string, legacyId?: number): readonly (string | number)[] {
    return legacyId ? ['/course', legacyId, 'learn'] : ['/catalog/courses', courseId];
  }
}
