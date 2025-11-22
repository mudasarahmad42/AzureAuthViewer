import { Component, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthError } from '@azure/msal-browser';

@Component({
  selector: 'app-msal-redirect-handler',
  standalone: true,
  template: ''
})
export class MsalRedirectHandlerComponent {
  private readonly msal = inject(MsalService);

  constructor() {
    this.msal.handleRedirectObservable().subscribe({
      next: () => {
        // Successfully handled redirect
      },
      error: (error: unknown) => {
        // Log the error for debugging
        console.error('MSAL redirect error:', error);

        // Check if it's the SPA configuration error
        if (error instanceof AuthError || (error && typeof error === 'object' && 'errorCode' in error)) {
          const authError = error as AuthError;
          if (authError.errorCode === 'invalid_request' && authError.errorMessage?.includes('9002326')) {
            console.error(
              '\n❌ Azure AD Configuration Error:\n' +
              'Your app registration is configured as a "Web" application instead of "Single-Page Application (SPA)".\n\n' +
              'To fix this:\n' +
              '1. Go to Azure Portal → Azure Active Directory → App registrations\n' +
              '2. Select your app\n' +
              '3. Go to Authentication section\n' +
              '4. Delete any "Web" platform configurations\n' +
              '5. Add a "Single-page application" platform\n' +
              '6. Add redirect URI: ' + window.location.origin + '\n' +
              '7. Save the changes\n\n' +
              'See the configuration page for detailed instructions.'
            );
          }
        }
      }
    });
  }
}

