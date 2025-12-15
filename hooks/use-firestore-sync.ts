/**
 * Firestore Location Sync Hook - Device Code Based
 * Each device has a unique code, no backend needed
 */

import { getDefaultApiKey, getDefaultProjectId } from '@/config/firebase-helper';
import {
    fetchLocationByCode,
    FirestoreLocation,
    startListeningToLocation,
    uploadLocationByCode
} from '@/services/firestore-service';
import { LocationHistoryPoint } from '@/types/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY_DEVICE_CODE = 'device_code';
const STORAGE_KEY_TRACKED_DEVICE_CODE = 'tracked_device_code';

export interface UseFirestoreSyncReturn {
  isUploading: boolean;
  uploadError: string | null;
  uploadLocation: (location: LocationHistoryPoint) => Promise<void>;
  getDeviceCode: () => Promise<string>;
  setDeviceCode: (code: string) => Promise<void>;
}

/**
 * Hook untuk upload lokasi device ke Firestore menggunakan device code
 */
export function useFirestoreSync(): UseFirestoreSyncReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getDeviceCode = useCallback(async (): Promise<string> => {
    try {
      let code = await AsyncStorage.getItem(STORAGE_KEY_DEVICE_CODE);
      if (!code) {
        // Generate unique device code in format: TRACK-XXXXXXX
        const randomPart = Math.random().toString(36).substr(2, 7).toUpperCase();
        code = `TRACK-${randomPart}`;
        await AsyncStorage.setItem(STORAGE_KEY_DEVICE_CODE, code);
        console.log('✅ Generated new device code:', code);
      }
      return code;
    } catch (error) {
      console.warn('Failed to get device code:', error);
      return 'TRACK-UNKNOWN';
    }
  }, []);

  const setDeviceCode = useCallback(async (code: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_DEVICE_CODE, code);
    } catch (error) {
      console.warn('Failed to set device code:', error);
    }
  }, []);

  const uploadLocation = useCallback(
    async (location: LocationHistoryPoint) => {
      setIsUploading(true);
      setUploadError(null);

      try {
        const deviceCode = await getDeviceCode();
        const projectId = getDefaultProjectId();
        const apiKey = getDefaultApiKey();

        const success = await uploadLocationByCode(
          deviceCode,
          projectId,
          location,
          apiKey
        );

        if (!success) {
          setUploadError('Upload throttled or failed');
        }
      } catch (error) {
        const errorMsg = String(error);
        setUploadError(errorMsg);
        console.warn('Upload error:', errorMsg);
      } finally {
        setIsUploading(false);
      }
    },
    [getDeviceCode]
  );

  return {
    isUploading,
    uploadError,
    uploadLocation,
    getDeviceCode,
    setDeviceCode,
  };
}

export interface UseDeviceLocationReturn {
  location: FirestoreLocation | null;
  loading: boolean;
  error: string | null;
  fetchLocation: () => Promise<void>;
  startTracking: (onUpdate: (loc: FirestoreLocation) => void) => () => void;
}

/**
 * Hook untuk track lokasi device berdasarkan device code
 */
export function useDeviceLocation(deviceCode: string): UseDeviceLocationReturn {
  const [location, setLocation] = useState<FirestoreLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchLocation = useCallback(async () => {
    if (!deviceCode) return;

    setLoading(true);
    setError(null);

    try {
      const projectId = getDefaultProjectId();
      const apiKey = getDefaultApiKey();
      const loc = await fetchLocationByCode(deviceCode, projectId, apiKey);
      
      if (loc) {
        setLocation(loc);
      }
    } catch (err) {
      setError(String(err));
      console.warn('Failed to fetch location:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceCode]);

  const startTracking = useCallback(
    (onUpdate: (loc: FirestoreLocation) => void) => {
      if (!deviceCode) return () => {};

      try {
        const projectId = getDefaultProjectId();
        const apiKey = getDefaultApiKey();

        unsubscribeRef.current = startListeningToLocation(
          deviceCode,
          projectId,
          apiKey,
          (loc) => {
            setLocation(loc);
            onUpdate(loc);
          },
          3000 // Poll every 3 seconds
        );
      } catch (err) {
        setError(String(err));
        console.warn('Failed to start tracking:', err);
      }

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    },
    [deviceCode]
  );

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    location,
    loading,
    error,
    fetchLocation,
    startTracking,
  };
}
