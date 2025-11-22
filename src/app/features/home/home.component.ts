import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { JwtDecoderService } from '../../core/services/jwt-decoder.service';
import { JsonViewerComponent } from '../../shared/components/json-viewer/json-viewer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    JsonViewerComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly auth = inject(AuthService);
  private readonly decoder = inject(JwtDecoderService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly token = this.auth.token;
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly isLoading = this.auth.isLoading;
  protected readonly error = this.auth.error;
  protected readonly decodeError = this.decoder.error;

  // Use the decoded signal directly instead of calling decode() from computed
  protected readonly decodedToken = this.decoder.decoded;

  // Refresh token debug signals
  protected readonly lastRefreshRequest = this.auth.lastRefreshRequest;
  protected readonly lastRefreshResponse = this.auth.lastRefreshResponse;

  // Profile information computed from decoded token
  protected readonly profileName = computed(() => {
    const token = this.decodedToken();
    if (!token) return null;
    return (token['name'] as string) || 
           (token['preferred_username'] as string) || 
           (token['upn'] as string) || 
           null;
  });

  protected readonly profileEmail = computed(() => {
    const token = this.decodedToken();
    if (!token) return null;
    return (token['upn'] as string) || 
           (token['preferred_username'] as string) || 
           (token['email'] as string) || 
           null;
  });

  protected readonly profileInitials = computed(() => {
    const token = this.decodedToken();
    if (!token) return '';
    
    const name = (token['name'] as string) || '';
    const givenName = (token['given_name'] as string) || '';
    const familyName = (token['family_name'] as string) || '';
    
    if (givenName && familyName) {
      return `${givenName.charAt(0).toUpperCase()}${familyName.charAt(0).toUpperCase()}`;
    }
    
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0).toUpperCase()}${parts[parts.length - 1].charAt(0).toUpperCase()}`;
      }
      if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
      }
    }
    
    // Fallback to email initials
    const email = (token['upn'] as string) || (token['preferred_username'] as string) || '';
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    
    return '';
  });

  protected readonly profileIssuedAt = computed(() => {
    const token = this.decodedToken();
    if (!token || !token['iat']) return null;
    const iat = token['iat'];
    if (typeof iat === 'number') {
      return new Date(iat * 1000);
    }
    return null;
  });

  protected readonly profileExpiresAt = computed(() => {
    const token = this.decodedToken();
    if (!token || !token['exp']) return null;
    const exp = token['exp'];
    if (typeof exp === 'number') {
      return new Date(exp * 1000);
    }
    return null;
  });

  constructor() {
    // Update the decoder when the token changes
    effect(() => {
      const token = this.token();
      this.decoder.updateToken(token);
    });
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }

  refreshToken(): void {
    this.auth.refreshToken();
  }

  async copyToken(): Promise<void> {
    const token = this.token();
    if (!token) {
      this.snackBar.open('No token available to copy', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(token);
      this.snackBar.open('Access token copied to clipboard!', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Failed to copy token:', error);
      this.snackBar.open('Failed to copy token to clipboard', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }
}

