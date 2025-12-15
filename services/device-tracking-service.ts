/**
 * Device Tracking Service - Firebase Integration Example
 * Menunjukkan cara menggunakan Firebase untuk tracking multiple devices
 */

import { getDefaultApiKey, getDefaultProjectId } from '@/config/firebase-helper';
import { fetchDeviceLocation, uploadLocationByCode } from '@/services/firestore-service';
import { LocationHistoryPoint } from '@/types/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TrackedDevice {
  deviceId: string;
  name: string;
  owner: string;
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
  };
  lastFetchTime?: number;
}

const TRACKED_DEVICES_KEY = 'tracked_devices_list';
const DEVICE_LOCATION_CACHE_KEY = 'device_location_';
const LOCATION_CACHE_DURATION = 5000; // 5 seconds

/**
 * Save tracked device ke local storage
 */
export async function saveTrackedDevice(device: TrackedDevice): Promise<void> {
  try {
    const devices = await getTrackedDevices();
    const index = devices.findIndex((d) => d.deviceId === device.deviceId);

    if (index >= 0) {
      devices[index] = device;
    } else {
      devices.push(device);
    }

    await AsyncStorage.setItem(TRACKED_DEVICES_KEY, JSON.stringify(devices));
    console.log('Device saved:', device.deviceId);
  } catch (error) {
    console.warn('Failed to save tracked device:', error);
  }
}

/**
 * Get all tracked devices
 */
export async function getTrackedDevices(): Promise<TrackedDevice[]> {
  try {
    const data = await AsyncStorage.getItem(TRACKED_DEVICES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('Failed to get tracked devices:', error);
    return [];
  }
}

/**
 * Get specific tracked device
 */
export async function getTrackedDevice(deviceId: string): Promise<TrackedDevice | null> {
  try {
    const devices = await getTrackedDevices();
    return devices.find((d) => d.deviceId === deviceId) || null;
  } catch (error) {
    console.warn('Failed to get tracked device:', error);
    return null;
  }
}

/**
 * Remove tracked device
 */
export async function removeTrackedDevice(deviceId: string): Promise<void> {
  try {
    const devices = await getTrackedDevices();
    const filtered = devices.filter((d) => d.deviceId !== deviceId);
    await AsyncStorage.setItem(TRACKED_DEVICES_KEY, JSON.stringify(filtered));

    // Clear cache
    await AsyncStorage.removeItem(DEVICE_LOCATION_CACHE_KEY + deviceId);

    console.log('Device removed:', deviceId);
  } catch (error) {
    console.warn('Failed to remove tracked device:', error);
  }
}

/**
 * Fetch latest location dari Firestore dengan caching
 */
export async function getTrackedDeviceLocation(
  deviceId: string,
  forceRefresh: boolean = false
): Promise<TrackedDevice['lastLocation'] | null> {
  try {
    // Check cache terlebih dahulu
    if (!forceRefresh) {
      const cacheKey = DEVICE_LOCATION_CACHE_KEY + deviceId;
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData) {
        const { location, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < LOCATION_CACHE_DURATION) {
          return location;
        }
      }
    }

    // Fetch dari Firestore
    const projectId = getDefaultProjectId();
    const apiKey = getDefaultApiKey();

    const location = await fetchDeviceLocation(deviceId, projectId, apiKey);

    if (location) {
      // Update cache
      const cacheKey = DEVICE_LOCATION_CACHE_KEY + deviceId;
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          location,
          timestamp: Date.now(),
        })
      );

      // Update tracked device dengan location terbaru
      const device = await getTrackedDevice(deviceId);
      if (device) {
        device.lastLocation = location;
        device.lastFetchTime = Date.now();
        await saveTrackedDevice(device);
      }

      return location;
    }

    return null;
  } catch (error) {
    console.warn('Failed to get device location:', error);
    return null;
  }
}

/**
 * Upload current device location ke Firestore
 */
export async function uploadMyLocation(
  deviceId: string,
  location: LocationHistoryPoint
): Promise<boolean> {
  try {
    const projectId = getDefaultProjectId();
    const apiKey = getDefaultApiKey();

    const success = await uploadLocationByCode(deviceId, projectId, location, apiKey);

    if (success) {
      // Update local device info
      const device = await getTrackedDevice(deviceId);
      if (device) {
        device.lastLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp || Date.now(),
          accuracy: location.accuracy,
        };
        device.lastFetchTime = Date.now();
        await saveTrackedDevice(device);
      }

      // Clear cache untuk force refresh next time
      await AsyncStorage.removeItem(DEVICE_LOCATION_CACHE_KEY + deviceId);
    }

    return success;
  } catch (error) {
    console.warn('Failed to upload location:', error);
    return false;
  }
}

/**
 * Batch fetch locations dari multiple devices
 */
export async function fetchAllTrackedDevicesLocations(): Promise<Map<string, TrackedDevice>> {
  try {
    const devices = await getTrackedDevices();
    const updatedDevices = new Map<string, TrackedDevice>();

    // Fetch semua locations secara parallel (tapi limited)
    const fetchPromises = devices.map(async (device) => {
      const location = await getTrackedDeviceLocation(device.deviceId);
      if (location) {
        device.lastLocation = location;
        device.lastFetchTime = Date.now();
      }
      return { deviceId: device.deviceId, device };
    });

    const results = await Promise.all(fetchPromises);

    for (const { deviceId, device } of results) {
      updatedDevices.set(deviceId, device);
      // Save updated device
      await saveTrackedDevice(device);
    }

    return updatedDevices;
  } catch (error) {
    console.warn('Failed to fetch all device locations:', error);
    return new Map();
  }
}

/**
 * Add device by code (when scanning QR atau entering device ID)
 */
export async function addTrackedDeviceByCode(code: string): Promise<{
  success: boolean;
  device?: TrackedDevice;
  error?: string;
}> {
  try {
    // code format: "device_xxxxx" atau "xxxxx"
    const deviceId = code.startsWith('device_') ? code : 'device_' + code;

    // Try to fetch location untuk verify device exists
    const location = await getTrackedDeviceLocation(deviceId, true);

    if (!location) {
      // Device tidak ditemukan atau tidak ada location history
      // Tapi tetap allow add (device mungkin baru)
      console.warn('Device tidak memiliki location history, tapi tetap ditambah');
    }

    const newDevice: TrackedDevice = {
      deviceId,
      name: 'Tracked Device - ' + deviceId.slice(-6),
      owner: 'Unknown',
      lastLocation: location || undefined,
      lastFetchTime: Date.now(),
    };

    await saveTrackedDevice(newDevice);

    return {
      success: true,
      device: newDevice,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Register device dengan nama custom
 */
export async function registerDeviceWithName(
  deviceId: string,
  name: string,
  owner: string = 'Unknown'
): Promise<TrackedDevice> {
  const device: TrackedDevice = {
    deviceId,
    name,
    owner,
    lastFetchTime: Date.now(),
  };

  await saveTrackedDevice(device);
  return device;
}

/**
 * Calculate distance antara 2 lokasi (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Check if device is within geofence
 */
export function isWithinGeofence(
  latitude: number,
  longitude: number,
  centerLat: number,
  centerLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(latitude, longitude, centerLat, centerLon);
  return distance <= radiusKm;
}

/**
 * Get summary dari semua tracked devices
 */
export async function getDevicesSummary(): Promise<{
  totalDevices: number;
  devicesWithLocation: number;
  devicesWithoutLocation: number;
  lastUpdateTime: number;
}> {
  try {
    const devices = await getTrackedDevices();
    const devicesWithLocation = devices.filter((d) => d.lastLocation).length;

    return {
      totalDevices: devices.length,
      devicesWithLocation,
      devicesWithoutLocation: devices.length - devicesWithLocation,
      lastUpdateTime: Math.max(...devices.map((d) => d.lastFetchTime || 0)),
    };
  } catch (error) {
    return {
      totalDevices: 0,
      devicesWithLocation: 0,
      devicesWithoutLocation: 0,
      lastUpdateTime: 0,
    };
  }
}
