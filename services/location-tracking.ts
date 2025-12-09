import { GeofenceZone, LocationHistoryPoint } from '@/types/models';
import { checkAllGeofences, getHighestPriorityBreach } from '@/utils/geofencing';
import { addLocationToHistory } from '@/utils/location-history';
import { sendGeofenceNotification } from '@/utils/notifications';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { AppState } from 'react-native';
import { loadHistory, saveHistory } from './storage-service';

export const LOCATION_TASK = 'TRACKIFY_LOCATION_TASK';

export type LocationUpdateHandler = (params: {
  location: Location.LocationObject;
  history: LocationHistoryPoint[];
}) => void;

let foregroundSubscription: Location.LocationSubscription | null = null;
let locationHandler: LocationUpdateHandler | null = null;

// Register background task handler
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('TaskManager error', error);
    return;
  }
  const { locations } = data as { locations: Location.LocationObject[] };
  if (!locations || locations.length === 0) return;

  const latest = locations[locations.length - 1];
  await handleLocation(latest);
});

async function handleLocation(location: Location.LocationObject) {
  const currentHistory = await loadHistory();
  const point: LocationHistoryPoint = {
    deviceId: 'local-device',
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    timestamp: location.timestamp ?? Date.now(),
    accuracy: location.coords.accuracy ?? undefined,
  };
  const updatedHistory = addLocationToHistory(currentHistory, point);
  await saveHistory(updatedHistory);
  if (locationHandler) {
    locationHandler({ location, history: updatedHistory });
  }
}

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return false;
  const bg = await Location.requestBackgroundPermissionsAsync();
  return bg.status === 'granted';
}

export async function startForegroundTracking(handler: LocationUpdateHandler) {
  locationHandler = handler;
  const isGranted = await requestPermissions();
  if (!isGranted) {
    throw new Error('Location permission not granted');
  }
  foregroundSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 5, // meters
      timeInterval: 5000,
    },
    async (loc) => {
      await handleLocation(loc);
    }
  );
}

export async function stopForegroundTracking() {
  await foregroundSubscription?.remove();
  foregroundSubscription = null;
}

export async function startBackgroundTracking() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
  if (!isRegistered) {
    const granted = await requestPermissions();
    if (!granted) return;
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 10,
      timeInterval: 10000,
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: true,
    });
  }
}

export async function stopBackgroundTracking() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
}

/**
 * Check geofences for a given position and notify if breach
 */
export async function evaluateGeofences(
  latitude: number,
  longitude: number,
  deviceName: string,
  zones: GeofenceZone[]
) {
  const statuses = checkAllGeofences(latitude, longitude, zones);
  const breach = getHighestPriorityBreach(statuses);
  if (breach) {
    await sendGeofenceNotification(deviceName, breach.zone, 'breach');
  }
}

// Cleanup when app goes to background/foreground
AppState.addEventListener('change', (state) => {
  if (state === 'active') return;
  // Optionally pause foreground tracking when app is not active
});
