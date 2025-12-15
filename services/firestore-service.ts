import { LocationHistoryPoint } from '@/types/models';

/**
 * Firestore service for device tracking using unique device codes
 * 
 * Database Structure:
 * devices/ (collection)
 *   └─ {deviceCode}/ (document, e.g., "TRACK-ABC123")
 *      ├─ latitude: number
 *      ├─ longitude: number
 *      ├─ timestamp: number
 *      └─ accuracy: number
 */

const DB_URL = 'https://firestore.googleapis.com/v1';

export interface FirestoreLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

let lastUploadTime = 0;
const UPLOAD_INTERVAL_MS = 10000; // Upload every 10 seconds

/**
 * Upload current location to Firestore for a device code
 * Path: /devices/{deviceCode}
 * Creates or updates device document with location fields
 */
export async function uploadLocationByCode(
  deviceCode: string,
  projectId: string,
  location: LocationHistoryPoint,
  apiKey: string
): Promise<boolean> {
  const now = Date.now();
  if (now - lastUploadTime < UPLOAD_INTERVAL_MS) {
    return false; // Throttled
  }

  try {
    // Use document path without trailing /location
    const url = `${DB_URL}/projects/${projectId}/databases/(default)/documents/devices/${deviceCode}?key=${apiKey}`;

    const body = {
      fields: {
        latitude: { doubleValue: location.latitude },
        longitude: { doubleValue: location.longitude },
        timestamp: { integerValue: String(location.timestamp || now) },
        accuracy: { doubleValue: location.accuracy ?? 0 },
      },
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      lastUploadTime = now;
      console.log('✅ Location uploaded', { deviceCode, timestamp: now });
      return true;
    } else {
      const errorData = await response.text();
      console.warn('❌ Upload failed:', response.status, errorData);
      return false;
    }
  } catch (err) {
    console.warn('Firestore upload error:', err);
    return false;
  }
}

/**
 * Fetch location of a device by code
 * Path: /devices/{deviceCode}
 */
export async function fetchLocationByCode(
  deviceCode: string,
  projectId: string,
  apiKey: string
): Promise<FirestoreLocation | null> {
  try {
    const url = `${DB_URL}/projects/${projectId}/databases/(default)/documents/devices/${deviceCode}?key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.fields) return null;

    return {
      latitude: data.fields.latitude?.doubleValue || 0,
      longitude: data.fields.longitude?.doubleValue || 0,
      timestamp: parseInt(data.fields.timestamp?.integerValue || '0', 10),
      accuracy: data.fields.accuracy?.doubleValue,
    };
  } catch (err) {
    console.warn('Error fetching location:', err);
    return null;
  }
}

/**
 * Real-time listener for device location (polling)
 */
export function startListeningToLocation(
  deviceCode: string,
  projectId: string,
  apiKey: string,
  onUpdate: (location: FirestoreLocation) => void,
  pollIntervalMs: number = 3000
) {
  let lastLocation: FirestoreLocation | null = null;
  
  const interval = setInterval(async () => {
    const location = await fetchLocationByCode(deviceCode, projectId, apiKey);
    if (location && (!lastLocation || location.timestamp !== lastLocation.timestamp)) {
      lastLocation = location;
      onUpdate(location);
    }
  }, pollIntervalMs);

  return () => clearInterval(interval);
}

/**
 * Validate device code format (basic check)
 */
export function isValidDeviceCode(code: string): boolean {
  return code && code.length > 0 && code.length <= 50;
}

/**
 * Check if device code exists in Firestore
 * Returns true if location data exists for the device code
 */
export async function checkDeviceCodeExists(
  deviceCode: string,
  projectId: string,
  apiKey: string
): Promise<boolean> {
  try {
    const location = await fetchLocationByCode(deviceCode, projectId, apiKey);
    return location !== null;
  } catch (err) {
    console.warn('Error checking device code:', err);
    return false;
  }
}

/**
 * Stop listening to location updates
 */
export function stopListeningToLocation(unsubscribe: (() => void) | null): void {
  if (unsubscribe) {
    unsubscribe();
  }
}
