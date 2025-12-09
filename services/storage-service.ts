import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, Device, GeofenceEvent, GeofenceZone, LocationHistoryPoint } from '@/types/models';

const KEYS = {
  devices: '@trackify/devices',
  zones: '@trackify/zones',
  settings: '@trackify/settings',
  history: '@trackify/history',
  geofenceEvents: '@trackify/geofence-events',
} as const;

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('storage parse error', key, err);
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadDevices(): Promise<Device[]> {
  return getJSON<Device[]>(KEYS.devices, []);
}

export async function saveDevices(devices: Device[]): Promise<void> {
  return setJSON(KEYS.devices, devices);
}

export async function loadZones(): Promise<GeofenceZone[]> {
  return getJSON<GeofenceZone[]>(KEYS.zones, []);
}

export async function saveZones(zones: GeofenceZone[]): Promise<void> {
  return setJSON(KEYS.zones, zones);
}

export async function loadSettings(): Promise<AppSettings> {
  const defaults: AppSettings = {
    trackingInterval: 30,
    batterySaverMode: true,
    historicalDataRetentionDays: 30,
    notificationChannelEnabled: true,
    backgroundTrackingEnabled: true,
  };
  return getJSON<AppSettings>(KEYS.settings, defaults);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  return setJSON(KEYS.settings, settings);
}

export async function loadHistory(): Promise<LocationHistoryPoint[]> {
  return getJSON<LocationHistoryPoint[]>(KEYS.history, []);
}

export async function saveHistory(history: LocationHistoryPoint[]): Promise<void> {
  return setJSON(KEYS.history, history);
}

export async function loadGeofenceEvents(): Promise<GeofenceEvent[]> {
  return getJSON<GeofenceEvent[]>(KEYS.geofenceEvents, []);
}

export async function saveGeofenceEvents(events: GeofenceEvent[]): Promise<void> {
  return setJSON(KEYS.geofenceEvents, events);
}
