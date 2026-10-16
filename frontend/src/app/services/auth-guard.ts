import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth-service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    const returnUrl = state.url.startsWith('/') && !state.url.startsWith('//') ? state.url : '/home';
    return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }

  const requiredPermission = route.data['requiredPermission'] as string | undefined;
  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    return router.createUrlTree(['/403']);
  }

  const expectedRole = route.data['expectedRole'] as UserRole | undefined;
  if (expectedRole && authService.getUserRole() !== expectedRole) {
    return router.createUrlTree(['/403']);
  }

  return true;
};
