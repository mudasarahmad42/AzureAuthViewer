import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ConfigService, AppConfig } from '../../core/services/config.service';
import { getCurrentRedirectUri, getEnvironmentName } from '../../core/utils/environment.util';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent {
  private readonly configService = inject(ConfigService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  configForm: FormGroup;

  readonly generatedScopes = signal<string[]>([]);

  /**
   * Get the current redirect URI (automatically detected based on environment)
   */
  get currentRedirectUri(): string {
    return getCurrentRedirectUri();
  }

  /**
   * Get the current environment name
   */
  get environmentName(): string {
    return getEnvironmentName();
  }

  constructor() {
    // Load existing config if available
    const existingConfig = this.configService.getConfig();

    this.configForm = this.fb.group({
      tenantId: [existingConfig?.azure.tenantId || '', Validators.required],
      clientId: [existingConfig?.azure.clientId || '', Validators.required],
      redirectUri: [existingConfig?.azure.redirectUri || getCurrentRedirectUri(), Validators.required]
    });

    // Auto-generate scopes when clientId changes
    this.configForm.get('clientId')?.valueChanges.subscribe((clientId: string) => {
      if (clientId && clientId.trim()) {
        const scopes = this.configService.generateScopes(clientId.trim());
        this.generatedScopes.set(scopes);
      } else {
        this.generatedScopes.set([]);
      }
    });

    // Auto-generate authority when tenantId changes
    this.configForm.get('tenantId')?.valueChanges.subscribe((tenantId: string) => {
      if (tenantId && tenantId.trim() && !this.configForm.get('authority')?.dirty) {
        // Authority will be auto-generated in onSubmit
      }
    });

    // Initialize scopes if clientId is already filled
    if (existingConfig?.azure.clientId) {
      const scopes = this.configService.generateScopes(existingConfig.azure.clientId);
      this.generatedScopes.set(scopes);
    }
  }

  onSubmit(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    const formValue = this.configForm.value;
    const tenantId = formValue.tenantId.trim();
    const clientId = formValue.clientId.trim();

    // Build authority from tenantId (using v2.0 endpoint)
    const authority = `https://login.microsoftonline.com/${tenantId}/v2.0`;

    // Get generated scopes
    const apiScopes = this.generatedScopes();

    const config: AppConfig = {
      azure: {
        tenantId,
        clientId,
        authority,
        redirectUri: formValue.redirectUri.trim() || getCurrentRedirectUri(),
        apiScopes
      }
    };

    // Initialize the app with configuration
    this.configService.initialize(config);
  }

  getFormControlError(controlName: string): string | null {
    const control = this.configForm.get(controlName);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return `${controlName} is required`;
      }
      if (control.errors?.['pattern']) {
        return `Please enter a valid URL`;
      }
    }
    return null;
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
      
      // Reset form
      this.configForm.reset({
        tenantId: '',
        clientId: '',
        redirectUri: getCurrentRedirectUri()
      });
      this.generatedScopes.set([]);
      
      // Reload page to reset MSAL and app state
      setTimeout(() => {
        const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
        window.location.href = baseHref;
      }, 1000);
    }
  }
}

