import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MSAL_GUARD_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration
} from '@azure/msal-angular';
import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation
} from '@azure/msal-browser';

import { routes } from './app.routes';
import { ConfigService } from './core/services/config.service';
import { msalInterceptor } from './core/interceptors/msal.interceptor';
import { getBaseUrl } from './core/utils/environment.util';

/**
 * MSAL Instance Factory
 * Creates and configures the MSAL PublicClientApplication instance
 * Uses ConfigService if available, otherwise uses defaults
 */
export function MSALInstanceFactory(): IPublicClientApplication {
  // Try to get config from localStorage (ConfigService isn't available yet)
  let azureConfig = null;
  try {
    const stored = localStorage.getItem('app_config');
    if (stored) {
      const config = JSON.parse(stored);
      azureConfig = config?.azure;
    }
  } catch {
    // Ignore errors
  }

  // Always calculate redirect URI from current environment to ensure it's correct
  // This prevents issues when stored config has incorrect redirect URI from different environment
  const currentRedirectUri = getBaseUrl();
  
  // Use stored config values if available, but always use current calculated redirect URI
  const redirectUri = currentRedirectUri;
  const clientId = azureConfig?.clientId || '00000000-0000-0000-0000-000000000000';
  const authority = azureConfig?.authority || `https://login.microsoftonline.com/common/v2.0`;
  
  // Log the redirect URI being used for debugging
  console.log('[MSAL] Using redirect URI:', redirectUri);
  
  const msalInstance = new PublicClientApplication({
    auth: {
      clientId,
      authority,
      redirectUri
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: false
    }
  });

  return msalInstance;
}

/**
 * MSAL Initializer
 * Initializes MSAL before the app starts
 */
export function MSALInitializerFactory(msalInstance: IPublicClientApplication): () => Promise<void> {
  return () => msalInstance.initialize();
}

/**
 * MSAL Guard Configuration Factory
 * Configures which routes require authentication
 */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  // Try to get config from localStorage
  let apiScopes: string[] = [];
  try {
    const stored = localStorage.getItem('app_config');
    if (stored) {
      const config = JSON.parse(stored);
      apiScopes = config?.azure?.apiScopes || [];
    }
  } catch {
    // Ignore errors
  }

  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: apiScopes.length > 0 ? apiScopes : ['User.Read']
    }
  };
}

/**
 * MSAL Interceptor Configuration Factory
 * Configures which API calls should include the access token
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  // Try to get config from localStorage
  const protectedResourceMap = new Map<string, Array<string>>();
  
  try {
    const stored = localStorage.getItem('app_config');
    if (stored) {
      const config = JSON.parse(stored);
      if (config?.azure?.apiScopes) {
        // Attach token to all relative URLs and same-origin requests
        protectedResourceMap.set(window.location.origin, config.azure.apiScopes);
      }
    }
  } catch {
    // Ignore errors
  }

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([msalInterceptor])),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: APP_INITIALIZER,
      useFactory: MSALInitializerFactory,
      deps: [MSAL_INSTANCE],
      multi: true
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};
