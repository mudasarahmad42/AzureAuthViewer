import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';
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
  private readonly configService = inject(ConfigService);
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

  // Token lifetime (total duration in milliseconds)
  protected readonly tokenLifetime = computed(() => {
    const issuedAt = this.profileIssuedAt();
    const expiresAt = this.profileExpiresAt();
    if (!issuedAt || !expiresAt) return null;
    return expiresAt.getTime() - issuedAt.getTime();
  });

  // Current time signal for real-time updates
  private readonly currentTime = signal(Date.now());

  // Remaining lifetime in milliseconds (updates in real-time)
  protected readonly remainingLifetime = computed(() => {
    const expiresAt = this.profileExpiresAt();
    if (!expiresAt) return null;
    const now = this.currentTime();
    const remaining = expiresAt.getTime() - now;
    return remaining > 0 ? remaining : 0;
  });

  // Helper function to format duration in human-readable format
  protected formatDuration(ms: number | null): string {
    if (ms === null || ms < 0) return 'N/A';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remainingHours = hours % 24;
      if (remainingHours > 0) {
        return `${days}d ${remainingHours}h`;
      }
      return `${days}d`;
    }
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${hours}h`;
    }
    
    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      if (remainingSeconds > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      return `${minutes}m`;
    }
    
    return `${seconds}s`;
  }

  constructor() {
    // Update the decoder when the token changes
    effect(() => {
      const token = this.token();
      this.decoder.updateToken(token);
    });

    // Update current time every second for real-time remaining lifetime display
    setInterval(() => {
      this.currentTime.set(Date.now());
    }, 1000);
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

  /**
   * Clear configuration from localStorage
   */
  clearConfig(): void {
    if (confirm('Are you sure you want to delete the configuration? This will clear all saved Azure AD credentials and you will need to reconfigure the application.')) {
      this.configService.clearConfig();
      this.snackBar.open('Configuration cleared successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      
      // Reload page to reset MSAL and app state
      setTimeout(() => {
        const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
        window.location.href = baseHref;
      }, 1000);
    }
  }
}

