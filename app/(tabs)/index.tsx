import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { BatteryOptimizationBar } from '@/components/battery-optimization-bar';
import { DeviceRegistrationForm } from '@/components/device-registration-form';
import { LocationHistoryPanel } from '@/components/location-history-panel';
import { MapCard } from '@/components/map-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { startForegroundTracking, stopForegroundTracking } from '@/services/location-tracking';
import { loadDevices, loadHistory, loadSettings, loadZones, saveDevices, saveHistory, saveZones } from '@/services/storage-service';
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

  const handleDeleteZone = async (zoneId: string) => {
    const next = zones.filter((z) => z.id !== zoneId);
    setZones(next);
    await saveZones(next);
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
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

      <MapCard
        userLocation={userLocation}
        devices={devices}
        zones={zones}
        history={history}
        selectedDeviceId={selectedDeviceId}
      />

      <DeviceRegistrationForm
        devices={devices}
        onRegister={handleRegister}
        onSelectDevice={handleSelectDevice}
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

      <LocationHistoryPanel history={history} />
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
