/**
 * Enhanced Firebase Authentication Service
 * Provides login/signup dengan Firebase
 */

import { firebaseConfig } from './firebase-config';

const AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';
const API_KEY = firebaseConfig.apiKey;

interface AuthUser {
  uid: string;
  email: string;
  idToken: string;
  refreshToken: string;
}

interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Sign up user dengan email/password
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${AUTH_URL}:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'Sign up failed',
      };
    }

    return {
      success: true,
      user: {
        uid: data.localId,
        email: data.email,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Sign in user dengan email/password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${AUTH_URL}:signInWithPassword?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'Sign in failed',
      };
    }

    return {
      success: true,
      user: {
        uid: data.localId,
        email: data.email,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Sign in anonymously (untuk quick testing)
 */
export async function signInAnonymously(): Promise<AuthResponse> {
  try {
    const response = await fetch(`${AUTH_URL}:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: 'Anonymous sign in failed',
      };
    }

    return {
      success: true,
      user: {
        uid: data.localId,
        email: 'anonymous',
        idToken: data.idToken,
        refreshToken: data.refreshToken,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  try {
    const response = await fetch(
      'https://securetoken.googleapis.com/v1/token?key=' + API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: 'Token refresh failed',
      };
    }

    return {
      success: true,
      user: {
        uid: data.user_id,
        email: '',
        idToken: data.access_token,
        refreshToken: data.refresh_token,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}
