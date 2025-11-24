import { Injectable, computed, signal, inject } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus, AuthenticationResult, AccountInfo } from '@azure/msal-browser';
import { filter, take } from 'rxjs';

import { ConfigService } from './config.service';

export interface RefreshTokenRequest {
  timestamp: Date;
  account: {
    username: string;
    homeAccountId: string;
    localAccountId: string;
  } | null;
  scopes: string[];
  authority: string;
  endpoint: string;
}

export interface RefreshTokenResponse {
  timestamp: Date;
  success: boolean;
  accessToken?: string;
  expiresOn?: Date;
  tokenType?: string;
  scopes?: string[];
  error?: string;
  errorDetails?: any;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly msal = inject(MsalService);
  private readonly msalBroadcast = inject(MsalBroadcastService);
  private readonly configService = inject(ConfigService);

  private readonly accessToken = signal<string | null>(null);
  private readonly tokenError = signal<string | null>(null);
  private readonly loading = signal(false);

  // Refresh token debug tracking
  private readonly refreshRequest = signal<RefreshTokenRequest | null>(null);
  private readonly refreshResponse = signal<RefreshTokenResponse | null>(null);

  readonly token = this.accessToken.asReadonly();
  readonly error = this.tokenError.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.accessToken()));

  // Debug signals for refresh token flow
  readonly lastRefreshRequest = this.refreshRequest.asReadonly();
  readonly lastRefreshResponse = this.refreshResponse.asReadonly();

  constructor() {
    // Initialize after MSAL is ready (APP_INITIALIZER ensures MSAL is initialized)
    // Use setTimeout to ensure initialization happens after Angular's dependency injection
    setTimeout(() => {
      this.initializeActiveAccount();
    }, 0);

    this.msalBroadcast.inProgress$
      .pipe(filter((status) => status === InteractionStatus.None))
      .subscribe(() => {
        this.initializeActiveAccount();
      });
  }

  login(): void {
    const azureConfig = this.configService.azureConfig();
    if (!azureConfig) {
      console.error('Azure configuration is not available');
      return;
    }
    this.msal.loginRedirect({
      scopes: azureConfig.apiScopes
    });
  }

  logout(): void {
    this.accessToken.set(null);
    this.msal.logoutRedirect();
  }

  refreshToken(): void {
    // Clear previous refresh tracking
    this.refreshRequest.set(null);
    this.refreshResponse.set(null);

    const account = this.msal.instance.getActiveAccount();
    
    if (account) {
      this.acquireToken(account, true);
    } else {
      this.initializeActiveAccount();
    }
  }

  private initializeActiveAccount(): void {
    try {
      // Check if MSAL is initialized
      if (!this.msal.instance) {
        console.warn('MSAL instance not available yet');
        return;
      }

      const currentAccount =
        this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts()[0] ?? null;

      if (!currentAccount) {
        this.accessToken.set(null);
        return;
      }

      this.msal.instance.setActiveAccount(currentAccount);
      this.acquireToken(currentAccount);
    } catch (error) {
      console.warn('Error in initializeActiveAccount:', error);
      // If initialization fails, just clear the token
      this.accessToken.set(null);
    }
  }

  private acquireToken(account: AccountInfo, isManualRefresh = false): void {
    this.loading.set(true);
    this.tokenError.set(null);

    const azureConfig = this.configService.azureConfig();
    if (!azureConfig) {
      this.loading.set(false);
      this.tokenError.set('Azure configuration is not available');
      return;
    }

    // Build the token endpoint URL
    const authority = azureConfig.authority;
    const tokenEndpoint = `${authority}/oauth2/v2.0/token`;

    // Track request details if this is a manual refresh
    if (isManualRefresh) {
      const request: RefreshTokenRequest = {
        timestamp: new Date(),
        account: {
          username: account.username,
          homeAccountId: account.homeAccountId,
          localAccountId: account.localAccountId
        },
        scopes: azureConfig.apiScopes,
        authority: authority,
        endpoint: tokenEndpoint
      };
      this.refreshRequest.set(request);
    }

    this.msal
      .acquireTokenSilent({
        account,
        scopes: azureConfig.apiScopes
      })
      .pipe(take(1))
      .subscribe({
        next: (result: AuthenticationResult) => {
          this.accessToken.set(result.accessToken);
          this.loading.set(false);

          if (isManualRefresh) {
            const response: RefreshTokenResponse = {
              timestamp: new Date(),
              success: true,
              accessToken: result.accessToken,
              expiresOn: result.expiresOn ? new Date(result.expiresOn) : undefined,
              tokenType: result.tokenType,
              scopes: result.scopes
            };
            this.refreshResponse.set(response);
          }
        },
        error: (error: unknown) => {
          this.loading.set(false);
          const errorMessage = error instanceof Error ? error.message : 'Unable to acquire access token.';
          this.tokenError.set(errorMessage);

          if (isManualRefresh) {
            const errorResponse: RefreshTokenResponse = {
              timestamp: new Date(),
              success: false,
              error: errorMessage,
              errorDetails: error instanceof Error ? {
                name: error.name,
                message: error.message
              } : error
            };
            this.refreshResponse.set(errorResponse);
          }
        }
      });
  }

}

