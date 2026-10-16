import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RuntimeConfigService } from '../config/runtime-config';

/** Routes declare `data.featureFlag`; disabled features resolve to a safe explanatory state. */
export const featureFlagGuard: CanActivateFn = (route) => {
  const flag = route.data['featureFlag'] as string | undefined;
  if (!flag || inject(RuntimeConfigService).isFeatureEnabled(flag)) return true;
  return inject(Router).createUrlTree(['/feature-unavailable']);
};
