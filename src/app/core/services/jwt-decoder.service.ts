import { Injectable, signal, effect } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtDecoderService {
  private readonly tokenSource = signal<string | null>(null);
  private readonly decodedValue = signal<Record<string, unknown> | null>(null);
  private readonly decodeError = signal<string | null>(null);

  readonly error = this.decodeError.asReadonly();
  readonly decoded = this.decodedValue.asReadonly();

  constructor() {
    // Use an effect to decode the token when it changes
    // This allows us to write to signals outside of computed contexts
    effect(() => {
      const token = this.tokenSource();
      this.decodeError.set(null);
      
      if (!token) {
        this.decodedValue.set(null);
        return;
      }

      // Basic JWT format validation (should have 3 parts separated by dots)
      if (!token.includes('.')) {
        const errorMsg = 'Invalid JWT format: token does not contain dots';
        this.decodeError.set(errorMsg);
        this.decodedValue.set(null);
        console.error(errorMsg);
        return;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        const errorMsg = `Invalid JWT format: expected 3 parts, got ${parts.length}`;
        this.decodeError.set(errorMsg);
        this.decodedValue.set(null);
        console.error(errorMsg);
        return;
      }

      try {
        const decoded = jwtDecode<Record<string, unknown>>(token);
        this.decodedValue.set(decoded);
        this.decodeError.set(null); // Clear any previous errors
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred while decoding JWT';
        this.decodeError.set(errorMsg);
        this.decodedValue.set(null);
        console.error('Failed to decode JWT:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
        }
      }
    });
  }

  /**
   * Update the token to decode
   * This triggers the effect which decodes the token
   */
  updateToken(token: string | null): void {
    this.tokenSource.set(token);
  }
}

