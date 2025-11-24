/**
 * Environment utility functions
 * Helps detect and work with different deployment environments (local vs GitHub Pages)
 */

/**
 * Check if the app is running on localhost
 */
export function isLocalhost(): boolean {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname === '[::1]';
}

/**
 * Check if the app is running on GitHub Pages
 */
export function isGitHubPages(): boolean {
  return window.location.hostname.includes('github.io');
}

/**
 * Get the base URL including base href
 * This works for both local development and GitHub Pages deployment
 */
export function getBaseUrl(): string {
  const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
  
  // If base href is just '/', we're in local development
  if (baseHref === '/') {
    return window.location.origin;
  }
  
  // For GitHub Pages or other deployments with a base path
  // Remove trailing slash and combine with origin
  const basePath = baseHref.replace(/\/$/, '');
  return `${window.location.origin}${basePath}`;
}

/**
 * Get the current redirect URI (the URL where Azure AD should redirect after login)
 * This automatically detects the environment and returns the correct URL
 */
export function getCurrentRedirectUri(): string {
  return getBaseUrl();
}

/**
 * Get a human-readable environment name
 */
export function getEnvironmentName(): string {
  if (isLocalhost()) {
    return 'Local Development';
  }
  if (isGitHubPages()) {
    return 'GitHub Pages';
  }
  return 'Production';
}

