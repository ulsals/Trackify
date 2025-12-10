/**
 * Firebase Helper Functions
 * Provides easy access to Firebase configuration
 */

import { firebaseConfig } from './firebase-config';

/**
 * Get default Firebase Project ID
 * User can override this in app settings
 */
export function getDefaultProjectId(): string {
  return firebaseConfig.projectId;
}

/**
 * Get default Firebase API Key
 * User can override this in app settings
 */
export function getDefaultApiKey(): string {
  return firebaseConfig.apiKey;
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.projectId !== 'trackify-demo' &&
    firebaseConfig.apiKey !== 'YOUR_API_KEY_HERE' &&
    firebaseConfig.apiKey.length > 0
  );
}

/**
 * Get full Firebase configuration
 */
export function getFirebaseConfig() {
  return firebaseConfig;
}

/**
 * Validate Firebase credentials
 */
export function validateFirebaseCredentials(
  projectId: string,
  apiKey: string
): { valid: boolean; error?: string } {
  if (!projectId || projectId.trim().length === 0) {
    return { valid: false, error: 'Project ID is required' };
  }

  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: 'API Key is required' };
  }

  if (apiKey.length < 30) {
    return { valid: false, error: 'API Key seems too short' };
  }

  return { valid: true };
}
