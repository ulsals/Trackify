import { Device } from "react-native-ble-plx";

// --- TIPE DATA UPDATE (Tambah properti color) ---
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
  color: string; // <-- WARNA DISIMPAN DISINI (PERMANEN)
}

// --- KONFIGURASI WARNA ---
export const DEVICE_COLORS = [
  "#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FF33A8", "#33FFF5", "#FFA533",
];

// Helper untuk memilih warna acak/berurutan (dipakai saat Add Device)
export const getNextColor = (currentCount: number) => {
  return DEVICE_COLORS[currentCount % DEVICE_COLORS.length];
};

// --- HELPER MAP UPDATE (Lebih Sederhana) ---
export const getTrackedDeviceLocations = (devices: TrackedDevice[]) =>
  devices
    .filter((d) => d.lastKnownLocation)
    .map((d) => ({
      firestoreId: d.id,
      name: d.name || "Unknown Device",
      latitude: d.lastKnownLocation?.latitude ?? 0,
      longitude: d.lastKnownLocation?.longitude ?? 0,
      timestamp: d.lastKnownLocation?.timestamp ?? 0,
      address: d.lastKnownLocation?.address,
      color: d.color, // <-- AMBIL LANGSUNG DARI DATA, TIDAK DIHITUNG ULANG
    }));