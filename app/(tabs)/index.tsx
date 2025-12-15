import { BatteryOptimizationBar } from "@/components/battery-optimization-bar";
import { DeviceCodeDisplay } from "@/components/device-code-display";
import { LocationHistoryPanel } from "@/components/location-history-panel";
import { MapCard } from "@/components/map-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
    TrackedDevice,
    TrackedDevicesList,
} from "@/components/tracked-devices-list";
import { Colors } from "@/constants/theme";
import { getLocationByCode } from "@/services/backend-api-service";
import {
    setTrackingConfig,
    startBackgroundTracking,
    startForegroundTracking,
    stopBackgroundTracking,
    stopForegroundTracking,
} from "@/services/location-tracking";
import {
    clearHistory,
    loadHistory,
    loadSettings,
    saveHistory,
} from "@/services/storage-service";
import { LocationHistoryPoint } from "@/types/models";
import { getOptimalTrackingInterval } from "@/utils/battery-optimizer";
import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [history, setHistory] = useState<LocationHistoryPoint[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  }>();
  const [batteryLevel, setBatteryLevel] = useState<number | undefined>(
    undefined
  );
  const [batterySaver, setBatterySaver] = useState(true);
  const [backgroundTracking, setBackgroundTracking] = useState(false);
  const [trackedDevices, setTrackedDevices] = useState<TrackedDevice[]>([]);
  const trackingInterval = useMemo(
    () => getOptimalTrackingInterval(batteryLevel ?? 0.5, batterySaver),
    [batteryLevel, batterySaver]
  );

  // --- PERMINTAAN IZIN BACKGROUND LOCATION (untuk GPS tracking background) ---
  useEffect(() => {
    const requestBackgroundLocation = async () => {
      if (Platform.OS === "android") {
        try {
          const { requestBackgroundPermissionsAsync } = require("expo-location");
          const bgStatus = await requestBackgroundPermissionsAsync();
          if (bgStatus.status !== "granted") {
            Alert.alert(
              "Izin Latar Belakang Diperlukan",
              "Aplikasi membutuhkan izin lokasi di latar belakang agar tracking GPS tetap berjalan saat aplikasi tidak aktif."
            );
          }
        } catch (e) {
          console.warn("Gagal meminta izin background location:", e);
        }
      }
    };
    requestBackgroundLocation();
  }, []);

  // load persisted data
  useEffect(() => {
    (async () => {
      const [h, s] = await Promise.all([loadHistory(), loadSettings()]);
      setHistory(h);
      setBatterySaver(s.batterySaverMode);
    })();
  }, []);

  // start foreground tracking and store history
  useEffect(() => {
    startForegroundTracking(async ({ location, history: updatedHistory }) => {
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setHistory(updatedHistory);
      await saveHistory(updatedHistory);
    }).catch((err) => {
      Alert.alert("Location Error", err.message);
    });

    return () => {
      stopForegroundTracking();
    };
  }, []);

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
      Alert.alert(
        "Background tracking",
        err?.message ?? "Failed to toggle background tracking"
      );
    }
  };

  const handleClearHistory = async () => {
    Alert.alert(
      "Clear Location History",
      "Delete all recorded location points? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleJoined = async (code: string, deviceName: string) => {
    if (trackedDevices.some((d) => d.firestoreId === code)) {
      Alert.alert("Error", "Device already in tracking list");
      return;
    }

    try {
      // Try to fetch location immediately
      const location = await getLocationByCode(code);
      setTrackedDevices([
        ...trackedDevices,
        {
          firestoreId: code,
          name: deviceName,
          lastLocation: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: location.timestamp,
              }
            : undefined,
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleRemoveTrackedDevice = (code: string) => {
    setTrackedDevices(trackedDevices.filter((d) => d.firestoreId !== code));
  };

  const handleRefreshTrackedDevices = async () => {
    const updated = await Promise.all(
      trackedDevices.map(async (device) => {
        try {
          const location = await getLocationByCode(device.firestoreId);
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
        } catch (error) {
          return device;
        }
      })
    );
    setTrackedDevices(updated);
  };

  // Real-time polling untuk tracked devices setiap 3 detik
  useEffect(() => {
    if (trackedDevices.length === 0) return;
    
    const interval = setInterval(() => {
      handleRefreshTrackedDevices();
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(interval);
  }, [trackedDevices.length]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title" style={styles.pageTitle}>
          GPS Tracking
        </ThemedText>

        <BatteryOptimizationBar
          batteryLevel={batteryLevel}
          trackingIntervalSec={trackingInterval}
          storageSizeLabel={
            history.length ? `${history.length} pts` : undefined
          }
          batterySaverEnabled={batterySaver}
          onToggleSaver={() => setBatterySaver((v) => !v)}
        />
        <ThemedView style={styles.panel}>
          <View style={styles.rowBetween}>
            <ThemedText type="subtitle">Background tracking</ThemedText>
            <ThemedText style={styles.action} onPress={handleToggleBackground}>
              {backgroundTracking ? "Stop" : "Start"}
            </ThemedText>
          </View>
          <ThemedText style={styles.meta}>
            {backgroundTracking
              ? "Running in background when permission is granted."
              : "Start to continue tracking when the app is not active."}
          </ThemedText>
        </ThemedView>

        <DeviceCodeDisplay />

        <TrackedDevicesList
          devices={trackedDevices}
          onAddDevice={(code, name) => handleJoined(code, name)}
          onRemoveDevice={handleRemoveTrackedDevice}
          onRefresh={handleRefreshTrackedDevices}
        />

        <MapCard
          userLocation={userLocation}
          devices={[]}
          zones={[]}
          history={history}
          selectedDeviceId={undefined}
          trackedDevices={trackedDevices.map((d) => ({
            firestoreId: d.firestoreId,
            name: d.name,
            latitude: d.lastLocation?.latitude ?? 0,
            longitude: d.lastLocation?.longitude ?? 0,
            timestamp: d.lastLocation?.timestamp ?? 0,
          }))}
        />

        <LocationHistoryPanel
          history={history}
          onClearHistory={handleClearHistory}
        />
      </ScrollView>
    </SafeAreaView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});
