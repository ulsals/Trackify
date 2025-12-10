/**
 * Backend API Service
 * Connects to Vercel backend for secure GPS tracking
 */

// TODO: Update this after deploying to Vercel
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000' // Local development
  : 'https://trackify-backend.vercel.app'; // Production

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
  const response = await fetch(`${API_BASE_URL}/api/share/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ deviceName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create tracking code');
  }

  return response.json();
}

/**
 * Join a tracking session with code
 */
export async function joinWithCode(code: string): Promise<JoinShareResponse> {
  const response = await fetch(`${API_BASE_URL}/api/share/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to join tracking session');
  }

  return response.json();
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
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update location');
  }
}

/**
 * Get device location by code
 */
export async function getLocationByCode(code: string): Promise<LocationData | null> {
  const response = await fetch(`${API_BASE_URL}/api/location?code=${encodeURIComponent(code)}`, {
    method: 'GET',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch location');
  }

  const data = await response.json();
  return data.location;
}
