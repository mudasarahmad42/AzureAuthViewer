import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { catchError, switchMap, throwError } from 'rxjs';

import { ConfigService } from '../services/config.service';

/**
 * MSAL HTTP Interceptor
 * Automatically attaches the Azure AD access token to outgoing API requests
 * that target the configured backend API base URL.
 */
export const msalInterceptor: HttpInterceptorFn = (req, next) => {
  const msalService = inject(MsalService);
  const configService = inject(ConfigService);

  const apiConfig = configService.apiConfig();
  const azureConfig = configService.azureConfig();

  // Only attach token to requests to the backend API
  if (!apiConfig?.apiBaseUrl || !req.url.startsWith(apiConfig.apiBaseUrl)) {
    return next(req);
  }

  if (!azureConfig) {
    return next(req);
  }

  // Get the active account
  const account = msalService.instance.getActiveAccount();
  if (!account) {
    // If no account, proceed without token (will likely result in 401)
    return next(req);
  }

  // Acquire token silently and attach to request
  return msalService.acquireTokenSilent({
    account,
    scopes: azureConfig.apiScopes
  }).pipe(
    switchMap((response) => {
      // Clone the request and add the Authorization header
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${response.accessToken}`
        }
      });
      return next(clonedRequest);
    }),
    catchError((error) => {
      // If token acquisition fails, proceed without token
      // The API will return 401 for unauthorized requests
      console.warn('Failed to acquire token for API request:', error);
      return next(req);
    })
  );
};

