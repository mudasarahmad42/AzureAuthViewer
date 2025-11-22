import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ConfigService } from '../services/config.service';

/**
 * Guard that checks if the application is configured.
 * If not configured, redirects to /config.
 */
export const configGuard: CanActivateFn = () => {
  const configService = inject(ConfigService);
  const router = inject(Router);

  if (configService.isConfigured()) {
    return true;
  }

  return router.createUrlTree(['/config']);
};

/**
 * Guard that ensures configuration is NOT set.
 * Used to prevent access to config page if already configured.
 */
export const configPageGuard: CanActivateFn = () => {
  const configService = inject(ConfigService);
  const router = inject(Router);

  if (!configService.isConfigured()) {
    return true;
  }

  return router.createUrlTree(['/']);
};

