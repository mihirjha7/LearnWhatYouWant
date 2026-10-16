// src/app/services/enrolled.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth-service';
import { CourseService } from './course-service';
import { catchError, map, of, switchMap } from 'rxjs';

export const enrolledGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const courseService = inject(CourseService);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: route.url.map(s => s.path).join('/') } });
    return false;
  }

  const courseId = Number(route.paramMap.get('id'));
  if (!courseId) {
    router.navigate(['/not-found']);
    return false;
  }

  return courseService.isEnrolled(courseId).pipe(
    map(enrolled => {
      if (enrolled) return true;
      router.navigate(['/courses', courseId]); // back to details
      return false;
    }),
    catchError(() => {
      router.navigate(['/courses', courseId]);
      return of(false);
    })
  );
};