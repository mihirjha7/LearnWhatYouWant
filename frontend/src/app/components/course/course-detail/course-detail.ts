// src/app/features/course-detail/course-detail.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '../../../services/course-service';
import { AuthService } from '../../../services/auth-service';
import { Course, Lesson } from '../../../models/course.model';
import { switchMap, catchError, of } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips'; // optional if you swap to MatChip

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule, MatIconModule, MatExpansionModule, MatTooltipModule, MatDividerModule, MatChipsModule],
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.css']
})
export class CourseDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private auth = inject(AuthService);

  course = signal<Course | null>(null);
  isLoading = signal(true);
  isEnrolled = signal(false);
  enrollInFlight = signal(false);
  errorMsg = signal<string | null>(null);

  constructor() {
    // Load course
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.errorMsg.set('Invalid course id');
          return of(null);
        }
        this.isLoading.set(true);
        return this.courseService.getCourse(id);
      }),
      catchError(err => {
        console.error('getCourse failed:', err);
        this.errorMsg.set('Failed to load course');
        return of(null);
      })
    ).subscribe(c => {
      this.course.set(c);
      this.isLoading.set(false);

      // After course loaded, check enrollment status
      const id = c?.courseID;
      if (id) {
        this.courseService.isEnrolled(id).subscribe({
          next: (enrolled) => this.isEnrolled.set(enrolled),
          error: (err) => {
            // If unauthorized, user is not logged in or token expired
            if (err.status === 401) {
              // Keep isEnrolled = false and show Enroll button; optionally set a hint message
              // this.errorMsg.set('Please login to check your enrollment status.');
              this.isEnrolled.set(false);
            } else {
              console.error('is-enrolled failed:', err);
              // Do not block the page; just show a soft message
              // this.errorMsg.set('Could not check enrollment status.');
            }
          }
        });
      }
    });
  }

  onEnroll() {
    const c = this.course();
    if (!c) return;

    // Require login to enroll
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/courses/${c.courseID}` } });
      return;
    }

    this.enrollInFlight.set(true);

    // Server returns plain text; CourseService should set responseType: 'text'
    this.courseService.enroll(c.courseID).pipe(
      catchError(err => {
        console.error('Enrollment failed:', err);
        const msg =
          typeof err?.error === 'string' ? err.error :
          err?.error?.message || 'Enrollment failed. Please try again.';
        this.errorMsg.set(msg);
        this.enrollInFlight.set(false);
        return of(null);
      })
    ).subscribe(messageOrNull => {
      if (messageOrNull === null) return; // handled in catchError

      // Optionally show the server message: "User enrolled successfully."
      // e.g., via MatSnackBar if you use it:
      // this.snackBar.open(messageOrNull as string, 'Close', { duration: 3000 });

      this.enrollInFlight.set(false);
      this.isEnrolled.set(true);
      this.router.navigate(['/course', c.courseID, 'learn']);
    });
  }

  goToLearning() {
    const c = this.course();
    if (c) this.router.navigate(['/course', c.courseID, 'learn']);
  }

  trackLesson(_i: number, l: Lesson) {
    return l.lessonID;
  }
}