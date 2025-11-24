import { Injectable, signal, computed } from '@angular/core';
import { getCurrentRedirectUri } from '../utils/environment.util';

export interface AzureConfig {
  tenantId: string;
  clientId: string;
  authority: string;
  redirectUri: string;
  apiScopes: string[];
}

export interface AppConfig {
  azure: AzureConfig;
}

const STORAGE_KEY = 'app_config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  private readonly config = signal<AppConfig | null>(null);

  readonly isConfigured = computed(() => this.config() !== null);
  readonly azureConfig = computed(() => this.config()?.azure ?? null);

  constructor() {
    // Load configuration from localStorage on initialization
    this.loadFromStorage();
  }

  /**
   * Generate API scopes based on client ID
   */
  generateScopes(clientId: string): string[] {
    if (!clientId || !clientId.trim()) {
      return [];
    }

    const scopes = [
      'Relia.Create',
      'Relia.Read',
      'Relia.Update',
      'Relia.Delete'
    ];

    return scopes.map(scope => `api://${clientId}/${scope}`);
  }

  /**
   * Set complete configuration
   */
  private setConfig(config: AppConfig): void {
    this.config.set(config);
    this.saveToStorage();
  }

  /**
   * Get current configuration
   */
  getConfig(): AppConfig | null {
    return this.config();
  }

  /**
   * Clear configuration
   */
  clearConfig(): void {
    this.config.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Save configuration to localStorage
   */
  private saveToStorage(): void {
    const config = this.config();
    if (config) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (error) {
        console.error('Failed to save configuration to localStorage:', error);
      }
    }
  }

  /**
   * Load configuration from localStorage
   * Updates the redirect URI to match the current environment
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored) as AppConfig;
        // Validate the configuration
        if (this.isValidConfig(config)) {
          // Always update redirect URI to match current environment
          // This ensures correct redirect URI is used even if config was saved in different environment
          const currentRedirectUri = getCurrentRedirectUri();
          if (config.azure.redirectUri !== currentRedirectUri) {
            console.log(`[ConfigService] Updating redirect URI from "${config.azure.redirectUri}" to "${currentRedirectUri}" to match current environment`);
            config.azure.redirectUri = currentRedirectUri;
            // Save the updated config back to localStorage
            this.setConfig(config);
          } else {
            this.config.set(config);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load configuration from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Validate configuration
   */
  private isValidConfig(config: any): config is AppConfig {
    return (
      config &&
      typeof config === 'object' &&
      config.azure &&
      typeof config.azure.tenantId === 'string' &&
      typeof config.azure.clientId === 'string' &&
      typeof config.azure.authority === 'string' &&
      typeof config.azure.redirectUri === 'string' &&
      Array.isArray(config.azure.apiScopes)
    );
  }

  /**
   * Initialize app with configuration and navigate to home
   * Reloads the page to ensure MSAL is reinitialized with new config
   */
  initialize(config: AppConfig): void {
    this.setConfig(config);
    // Get base href for proper routing
    const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
    // Reload page to ensure MSAL is reinitialized with new configuration
    window.location.href = baseHref;
  }
}

