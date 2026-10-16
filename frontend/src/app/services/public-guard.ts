import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth-service';

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) return true;
  return router.createUrlTree([homeForRole(authService.getUserRole())]);
};

function homeForRole(role: UserRole | null): string {
  if (role === 'Admin') return '/admin/dashboard';
  if (role === 'Instructor') return '/instructor/dashboard';
  if (role === 'Student') return '/student/dashboard';
  return '/home';
}
