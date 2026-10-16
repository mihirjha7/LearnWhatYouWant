import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth-service';
import { CourseService } from './course-service';
import { catchError, map, of } from 'rxjs';

export const quizEnrolledGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const courseService = inject(CourseService);

  // 1. Check if user is logged in (same pattern as enrolledGuard)
  if (!auth.isLoggedIn()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: route.url.map(s => s.path).join('/') } 
    });
    return false;
  }

  const courseId = Number(route.paramMap.get('courseId'));
  
  if (!courseId) {
    console.error('Quiz Guard: No courseId found in route');
    router.navigate(['/home']);
    return false;
  }

  return courseService.isEnrolled(courseId).pipe(
    map(enrolled => {
      if (enrolled) {
        return true; // User is enrolled, allow access to quiz
      }
      router.navigate(['/course', courseId]);
      return false;
    }),
    catchError((error) => {
      console.error('Quiz Enrollment Guard Error:', error);
      // On error, redirect to course detail page
      router.navigate(['/course', courseId]);
      return of(false);
    })
  );
};