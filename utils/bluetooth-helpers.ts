import { Device } from "react-native-ble-plx";

// --- TIPE DATA ---
export interface TrackedDevice {
  id: string;
  name: string | null;
  rssi: number;
  status: "CONNECTED" | "DISCONNECTED" | "FAR" | "SEARCHING";
  deviceObject: Device | null;
  errorCount?: number;
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
    address?: string;
  };
}

// --- KONFIGURASI WARNA ---
export const DEVICE_COLORS = [
  "#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FF33A8", "#33FFF5", "#FFA533",
];

export const getColorByIndex = (index: number) => {
  return DEVICE_COLORS[index % DEVICE_COLORS.length];
};

// --- HELPER MAP (PERBAIKAN DISINI) ---
export const getTrackedDeviceLocations = (devices: TrackedDevice[]) => {
  // Gunakan 'reduce' agar kita bisa mengakses index asli (i) 
  // sambil memfilter perangkat yang tidak punya lokasi.
  return devices.reduce((acc, d, index) => {
    if (d.lastKnownLocation) {
      acc.push({
        firestoreId: d.id,
        name: d.name || "Unknown Device",
        latitude: d.lastKnownLocation.latitude,
        longitude: d.lastKnownLocation.longitude,
        timestamp: d.lastKnownLocation.timestamp,
        address: d.lastKnownLocation.address,
        // PENTING: Gunakan 'index' asli dari array utama, bukan index hasil filter
        color: getColorByIndex(index), 
      });
    }
    return acc;
  }, [] as any[]);
};