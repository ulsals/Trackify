import { LocationHistoryPoint } from '@/types/models';

/**
 * Firestore service for syncing GPS locations across devices
 * 
 * Database Structure:
 * firestore/
 *   └─ devices/
 *      └─ {deviceId}/
 *         ├─ info/ (device metadata)
 *         └─ locations/
 *            └─ {timestamp}/ (latest location with timestamp as ID)
 *               ├─ latitude
 *               ├─ longitude
 *               ├─ timestamp
 *               ├─ accuracy
 */

const DB_URL = 'https://firestore.googleapis.com/v1';

interface FirestoreLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

interface FirestoreLocationDoc {
  fields: {
    latitude: { doubleValue: number };
    longitude: { doubleValue: number };
    timestamp: { integerValue: string };
    accuracy?: { doubleValue: number };
  };
}

let lastUploadTime = 0;
const UPLOAD_INTERVAL_MS = 90000; // 1 minute 30 seconds

/**
 * Upload current location to Firestore
 * Returns true if uploaded, false if throttled (< 90 seconds since last upload)
 */
export async function uploadLocationToFirestore(
  deviceId: string,
  projectId: string,
  location: LocationHistoryPoint,
  apiKey: string
): Promise<boolean> {
  const now = Date.now();
  if (now - lastUploadTime < UPLOAD_INTERVAL_MS) {
    return false; // Throttled - skip upload
  }

  try {
    const docId = `location_${now}`;
    const url = `${DB_URL}/projects/${projectId}/databases/(default)/documents/devices/${deviceId}/locations/${docId}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          latitude: { doubleValue: location.latitude },
          longitude: { doubleValue: location.longitude },
          timestamp: { integerValue: String(location.timestamp || now) },
          accuracy: { doubleValue: location.accuracy ?? 0 },
        },
      }),
    });

    if (response.ok) {
      lastUploadTime = now;
      console.log('Location uploaded to Firestore', { deviceId, timestamp: now });
      return true;
    } else {
      console.warn('Failed to upload location', response.status);
      return false;
    }
  } catch (err) {
    console.warn('Firestore upload error:', err);
    return false;
  }
}

/**
 * Fetch latest location of a specific device from Firestore
 */
export async function fetchDeviceLocation(
  deviceId: string,
  projectId: string,
  apiKey: string
): Promise<FirestoreLocation | null> {
  try {
    const url = `${DB_URL}/projects/${projectId}/databases/(default)/documents/devices/${deviceId}/locations?key=${apiKey}&pageSize=1&orderBy.field.fieldPath=timestamp&orderBy.direction=DESCENDING`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      const doc = data.documents[0] as FirestoreLocationDoc;
      return {
        latitude: doc.fields.latitude.doubleValue,
        longitude: doc.fields.longitude.doubleValue,
        timestamp: parseInt(doc.fields.timestamp.integerValue, 10),
        accuracy: doc.fields.accuracy?.doubleValue,
      };
    }
    return null;
  } catch (err) {
    console.warn('Error fetching device location:', err);
    return null;
  }
}

/**
 * Fetch all location history of a device from Firestore
 */
export async function fetchDeviceLocationHistory(
  deviceId: string,
  projectId: string,
  apiKey: string,
  limit: number = 100
): Promise<FirestoreLocation[]> {
  try {
    const url = `${DB_URL}/projects/${projectId}/databases/(default)/documents/devices/${deviceId}/locations?key=${apiKey}&pageSize=${limit}&orderBy.field.fieldPath=timestamp&orderBy.direction=DESCENDING`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.documents) return [];

    return data.documents.map((doc: FirestoreLocationDoc) => ({
      latitude: doc.fields.latitude.doubleValue,
      longitude: doc.fields.longitude.doubleValue,
      timestamp: parseInt(doc.fields.timestamp.integerValue, 10),
      accuracy: doc.fields.accuracy?.doubleValue,
    }));
  } catch (err) {
    console.warn('Error fetching location history:', err);
    return [];
  }
}

/**
 * Listen to real-time updates of a device location (polling method for free tier)
 * For production, consider using Cloud Functions or proper Real-time listeners
 */
export function startListeningToDeviceLocation(
  deviceId: string,
  projectId: string,
  apiKey: string,
  onUpdate: (location: FirestoreLocation) => void,
  pollIntervalMs: number = 10000 // Poll every 10 seconds
) {
  const interval = setInterval(async () => {
    const location = await fetchDeviceLocation(deviceId, projectId, apiKey);
    if (location) {
      onUpdate(location);
    }
  }, pollIntervalMs);

  return () => clearInterval(interval);
}
