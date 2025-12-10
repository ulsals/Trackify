/**
 * Backend API Service
 * Connects to Vercel backend for secure GPS tracking
 */

// 🔄 For local testing without backend, set this to true
const USE_MOCK_BACKEND = false;

// Updated with HTTPS (required by Vercel)
const VERCEL_BACKEND_URL = 'https://trackify-orcin.vercel.app';

// Local development (for `npx expo start`)
const LOCAL_BACKEND_URL = 'http://localhost:3000';

// Get actual API URL - will use mock if backend not deployed
const API_BASE_URL = __DEV__
  ? LOCAL_BACKEND_URL
  : VERCEL_BACKEND_URL;

// Add request timeout configuration
const REQUEST_TIMEOUT = 10000; // 10 seconds instead of 5

// Tracking code expiration - 5 minutes
const CODE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes = 300,000 ms

// Mock device storage (for offline development)
const mockDevices = new Map<string, { code: string; deviceSecret: string; deviceName: string; createdAt: number }>();
const mockLocations = new Map<string, { latitude: number; longitude: number; accuracy: number; timestamp: number }>();

/**
 * Generate a random 6-character code (same format as backend)
 */
function generateMockCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TRACK-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Generate a random device secret
 */
function generateMockSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}

export interface CreateShareResponse {
  success: boolean;
  code: string;
  deviceSecret: string;
  expiresAt: number;
  message: string;
}

export interface JoinShareResponse {
  success: boolean;
  code: string;
  deviceName: string;
  createdAt: number;
  expiresAt: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  updatedAt: number;
}

/**
 * Create a new tracking code
 */
export async function createTrackingCode(deviceName: string): Promise<CreateShareResponse> {
  // Try backend first, fallback to mock if fails
  if (!USE_MOCK_BACKEND) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/share/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceName }),
        timeout: 5000,
      } as any);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tracking code');
      }

      return response.json();
    } catch (error) {
      console.warn('Backend request failed, using mock:', error);
      // Fall through to mock
    }
  }

  // Mock implementation for development
  return new Promise((resolve) => {
    setTimeout(() => {
      const code = generateMockCode();
      const deviceSecret = generateMockSecret();
      const expiresAt = Date.now() + CODE_EXPIRATION_MS;

      // Store in mock storage
      mockDevices.set(code, {
        code,
        deviceSecret,
        deviceName,
        createdAt: Date.now(),
      });

      resolve({
        success: true,
        code,
        deviceSecret,
        expiresAt,
        message: 'Share this code with others to let them track your location (Mock)',
      });
    }, 300);
  });
}

/**
 * Join a tracking session with code
 */
export async function joinWithCode(code: string): Promise<JoinShareResponse> {
  // Try backend first
  if (!USE_MOCK_BACKEND) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/share/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
        timeout: 5000,
      } as any);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join tracking session');
      }

      return response.json();
    } catch (error) {
      console.warn('Backend request failed, using mock:', error);
    }
  }

  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const device = mockDevices.get(code);
      if (!device) {
        reject(new Error('Code not found or expired'));
        return;
      }

      // Check if code has expired (5 minutes)
      if (Date.now() > device.createdAt + CODE_EXPIRATION_MS) {
        reject(new Error('Code has expired'));
        return;
      }

      resolve({
        success: true,
        code,
        deviceName: device.deviceName,
        createdAt: device.createdAt,
        expiresAt: device.createdAt + CODE_EXPIRATION_MS,
      });
    }, 300);
  });
}

/**
 * Update device location
 */
export async function updateLocation(
  code: string,
  deviceSecret: string,
  latitude: number,
  longitude: number,
  accuracy: number
): Promise<void> {
  // Try backend first
  if (!USE_MOCK_BACKEND) {
    try {
      console.log('📤 Uploading location to backend...', { code, latitude, longitude });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}/api/location/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          deviceSecret,
          latitude,
          longitude,
          accuracy,
        }),
        signal: controller.signal,
      } as any);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('❌ Backend error:', response.status, errorText);
        throw new Error(`Backend error: ${response.status}`);
      }

      console.log('✅ Location uploaded successfully');
      return;
    } catch (error: any) {
      console.warn('⚠️ Backend request failed, using mock:', error?.message);
      // Fall through to mock implementation
    }
  }

  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const device = mockDevices.get(code);
      if (!device || device.deviceSecret !== deviceSecret) {
        reject(new Error('Invalid code or secret'));
        return;
      }

      // Store location
      mockLocations.set(code, {
        latitude,
        longitude,
        accuracy,
        timestamp: Date.now(),
      });

      console.log('📍 Location stored in mock (demo mode)');
      resolve();
    }, 300);
  });
}

/**
 * Get device location by code
 */
export async function getLocationByCode(code: string): Promise<LocationData | null> {
  // Try backend first
  if (!USE_MOCK_BACKEND) {
    try {
      console.log('📥 Fetching location from backend...', { code });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}/api/location?code=${encodeURIComponent(code)}`, {
        method: 'GET',
        signal: controller.signal,
      } as any);

      clearTimeout(timeoutId);

      if (response.status === 404) {
        console.warn('⚠️ Location not found for code:', code);
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('❌ Backend error:', response.status, errorText);
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Location fetched successfully:', data);
      return data.location;
    } catch (error: any) {
      console.warn('⚠️ Backend request failed, using mock:', error?.message);
      // Fall through to mock implementation
    }
  }

  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const location = mockLocations.get(code);
      if (!location) {
        console.log('📍 No location in mock storage for code:', code);
        resolve(null);
        return;
      }
      console.log('📍 Location loaded from mock (demo mode):', location);
      resolve({
        ...location,
        updatedAt: location.timestamp,
      });
    }, 300);
  });
}
