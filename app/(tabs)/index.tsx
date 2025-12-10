import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { BatteryOptimizationBar } from '@/components/battery-optimization-bar';
import { DeviceRegistrationForm } from '@/components/device-registration-form';
import { FirebaseSettings } from '@/components/firebase-settings';
import { LocationHistoryPanel } from '@/components/location-history-panel';
import { MapCard } from '@/components/map-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrackedDevice, TrackedDevicesList } from '@/components/tracked-devices-list';
import { Colors } from '@/constants/theme';
import { fetchDeviceLocation } from '@/services/firestore-service';
import { setFirestoreConfig, startBackgroundTracking, startForegroundTracking, stopBackgroundTracking, stopForegroundTracking } from '@/services/location-tracking';
import { clearHistory, loadDevices, loadHistory, loadSettings, loadZones, saveDevices, saveHistory, saveZones } from '@/services/storage-service';
import { Device, GeofenceZone, LocationHistoryPoint } from '@/types/models';
import { getOptimalTrackingInterval } from '@/utils/battery-optimizer';

export default function HomeScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [zones, setZones] = useState<GeofenceZone[]>([]);
  const [history, setHistory] = useState<LocationHistoryPoint[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>();
  const [batteryLevel, setBatteryLevel] = useState<number | undefined>(undefined);
  const [batterySaver, setBatterySaver] = useState(true);
  const [backgroundTracking, setBackgroundTracking] = useState(false);
  const [firestoreConfig, setFirestoreConfigState] = useState<{ deviceId: string; projectId: string; apiKey: string } | null>(null);
  const [trackedDevices, setTrackedDevices] = useState<TrackedDevice[]>([]);
  const trackingInterval = useMemo(() => getOptimalTrackingInterval(batteryLevel ?? 0.5, batterySaver), [batteryLevel, batterySaver]);

  // load persisted data
  useEffect(() => {
    (async () => {
      const [d, z, h, s] = await Promise.all([
        loadDevices(),
        loadZones(),
        loadHistory(),
        loadSettings(),
      ]);
      setDevices(d);
      setZones(z);
      setHistory(h);
      setBatterySaver(s.batterySaverMode);
    })();
  }, []);

  // start foreground tracking and store history
  useEffect(() => {
    startForegroundTracking(async ({ location, history: updatedHistory }) => {
      setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      setHistory(updatedHistory);
      await saveHistory(updatedHistory);
    }).catch((err) => {
      Alert.alert('Location Error', err.message);
    });

    return () => {
      stopForegroundTracking();
    };
  }, []);

  const handleRegister = async (device: Device) => {
    const next = [...devices, device];
    setDevices(next);
    await saveDevices(next);
  };

  const handleAddZone = async (deviceId: string) => {
    const baseDevice = devices.find((d) => d.id === deviceId);
    if (!baseDevice) return;
    const newZone: GeofenceZone = {
      id: `${deviceId}-zone-${Date.now()}`,
      deviceId,
      name: 'Default Zone',
      latitude: baseDevice.latitude,
      longitude: baseDevice.longitude,
      radius: 200,
      type: 'warning',
      enabled: true,
      notificationSound: true,
      notificationVibration: true,
    };
    const next = [...zones, newZone];
    setZones(next);
    await saveZones(next);
  };

  const handleToggleZone = async (zoneId: string) => {
    const next = zones.map((z) => (z.id === zoneId ? { ...z, enabled: !z.enabled } : z));
    setZones(next);
    await saveZones(next);
  };

  const handleToggleBackground = async () => {
    try {
      if (backgroundTracking) {
        await stopBackgroundTracking();
        setBackgroundTracking(false);
      } else {
        await startBackgroundTracking();
        setBackgroundTracking(true);
      }
    } catch (err: any) {
      Alert.alert('Background tracking', err?.message ?? 'Failed to toggle background tracking');
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    Alert.alert(
      'Delete Device',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const next = devices.filter((d) => d.id !== deviceId);
            setDevices(next);
            await saveDevices(next);
            // Remove zones for this device too
            const nextZones = zones.filter((z) => z.deviceId !== deviceId);
            setZones(nextZones);
            await saveZones(nextZones);
          },
        },
      ]
    );
  };

  const handleDeleteZone = async (zoneId: string) => {
    const next = zones.filter((z) => z.id !== zoneId);
    setZones(next);
    await saveZones(next);
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear Location History',
      'Delete all recorded location points? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleConfigureFirebase = (config: { deviceId: string; projectId: string; apiKey: string }) => {
    setFirestoreConfigState(config);
    setFirestoreConfig(config);
    Alert.alert('Success', 'Firebase configured. Location will be uploaded every 90 seconds.');
  };

  const handleAddTrackedDevice = (firestoreId: string, name: string) => {
    if (trackedDevices.some((d) => d.firestoreId === firestoreId)) {
      Alert.alert('Error', 'Device already in tracking list');
      return;
    }
    setTrackedDevices([...trackedDevices, { firestoreId, name }]);
  };

  const handleRemoveTrackedDevice = (firestoreId: string) => {
    setTrackedDevices(trackedDevices.filter((d) => d.firestoreId !== firestoreId));
  };

  const handleRefreshTrackedDevices = async () => {
    if (!firestoreConfig) {
      Alert.alert('Error', 'Firebase not configured');
      return;
    }

    const updated = await Promise.all(
      trackedDevices.map(async (device) => {
        const location = await fetchDeviceLocation(
          device.firestoreId,
          firestoreConfig.projectId,
          firestoreConfig.apiKey
        );
        return {
          ...device,
          lastLocation: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: location.timestamp,
              }
            : undefined,
        };
      })
    );
    setTrackedDevices(updated);
  };

  const filteredZones = useMemo(() => zones.filter((z) => z.deviceId === selectedDeviceId), [zones, selectedDeviceId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.pageTitle}>
        GPS Tracking
      </ThemedText>

      <BatteryOptimizationBar
        batteryLevel={batteryLevel}
        trackingIntervalSec={trackingInterval}
        storageSizeLabel={history.length ? `${history.length} pts` : undefined}
        batterySaverEnabled={batterySaver}
        onToggleSaver={() => setBatterySaver((v) => !v)}
      />

      <ThemedView style={styles.panel}>
        <View style={styles.rowBetween}>
          <ThemedText type="subtitle">Background tracking</ThemedText>
          <ThemedText
            style={styles.action}
            onPress={handleToggleBackground}
          >
            {backgroundTracking ? 'Stop' : 'Start'}
          </ThemedText>
        </View>
        <ThemedText style={styles.meta}>
          {backgroundTracking
            ? 'Running in background when permission is granted.'
            : 'Start to continue tracking when the app is not active.'}
        </ThemedText>
      </ThemedView>

      <MapCard
        userLocation={userLocation}
        devices={devices}
        zones={zones}
        history={history}
        selectedDeviceId={selectedDeviceId}
        trackedDevices={trackedDevices.map(d => ({
          firestoreId: d.firestoreId,
          name: d.name,
          latitude: d.lastLocation?.latitude ?? 0,
          longitude: d.lastLocation?.longitude ?? 0,
          timestamp: d.lastLocation?.timestamp ?? 0,
        }))}
      />

      <DeviceRegistrationForm
        devices={devices}
        onRegister={handleRegister}
        onSelectDevice={handleSelectDevice}
        onDeleteDevice={handleDeleteDevice}
      />

      <ThemedView style={styles.panel}>
        <View style={styles.rowBetween}>
          <ThemedText type="subtitle">Zones</ThemedText>
          {selectedDeviceId ? (
            <ThemedText style={styles.meta}>Device: {selectedDeviceId}</ThemedText>
          ) : (
            <ThemedText style={styles.meta}>Select device to manage zones</ThemedText>
          )}
        </View>
        {selectedDeviceId ? (
          <>
            {filteredZones.map((zone) => (
              <View key={zone.id} style={{ marginBottom: 8 }}>
                <View style={styles.zoneRow}>
                  <ThemedText>{zone.name}</ThemedText>
                  <View style={styles.zoneActions}>
                    <ThemedText style={styles.action} onPress={() => handleToggleZone(zone.id)}>
                      {zone.enabled ? 'Disable' : 'Enable'}
                    </ThemedText>
                    <ThemedText style={styles.delete} onPress={() => handleDeleteZone(zone.id)}>
                      Delete
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.meta}>
                  Radius {Math.round(zone.radius)} m • {zone.type}
                </ThemedText>
              </View>
            ))}
            <ThemedText style={styles.action} onPress={() => handleAddZone(selectedDeviceId)}>
              + Add zone
            </ThemedText>
          </>
        ) : (
          <ThemedText style={styles.meta}>No device selected.</ThemedText>
        )}
      </ThemedView>

      <LocationHistoryPanel history={history} onClearHistory={handleClearHistory} />

      <FirebaseSettings onConfigured={handleConfigureFirebase} currentConfig={firestoreConfig} />

      <TrackedDevicesList
        devices={trackedDevices}
        projectId={firestoreConfig?.projectId}
        apiKey={firestoreConfig?.apiKey}
        onAddDevice={handleAddTrackedDevice}
        onRemoveDevice={handleRemoveTrackedDevice}
        onRefresh={handleRefreshTrackedDevices}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  pageTitle: {
    marginBottom: 4,
  },
  panel: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    color: Colors.light.textSecondary,
  },
  action: {
    color: Colors.light.tint,
  },
  delete: {
    color: Colors.light.zoneCritical,
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
