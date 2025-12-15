import { BluetoothDeviceList } from "@/components/bluetooth/bluetooth-device-list";
import { RadarModal } from "@/components/bluetooth/radar-modal";
import { ScanModal } from "@/components/bluetooth/scan-modal";
import { MapCard } from "@/components/map-card";
import { ThemedView } from "@/components/themed-view";
import { useBluetoothManager } from "@/hooks/use-bluetooth-manager";
import { getTrackedDeviceLocations } from "@/utils/bluetooth-helpers";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Device } from "react-native-ble-plx"; // <-- Pastikan Import Device ada

export default function BluetoothScreen() {
  // Logic dari Hooks
  const {
    myDevices,
    scannedDevices,
    isScanning,
    startScan,
    addDevice, // Fungsi logic murni (hanya update data)
    removeDevice,
    connectToDevice,
    updateDeviceName,
  } = useBluetoothManager();

  // State UI
  const [showScanModal, setShowScanModal] = useState(false);
  const [radarDeviceId, setRadarDeviceId] = useState<string | null>(null);

  // --- SOLUSI: Wrapper Function ---
  // Fungsi ini menggabungkan Logic + UI Action
  const handleAddDevice = (device: Device) => {
    // 1. Jalankan logic penambahan perangkat (Data)
    addDevice(device);
    
    // 2. Tutup Modal (UI)
    setShowScanModal(false);
  };

  return (
    <ThemedView style={styles.container}>
      {/* 1. Map Component */}
      <MapCard trackedDevices={getTrackedDeviceLocations(myDevices)} />

      {/* 2. List Devices */}
      <BluetoothDeviceList 
        devices={myDevices}
        onConnect={connectToDevice}
        onRemove={removeDevice}
        onEditName={updateDeviceName}
        onOpenRadar={setRadarDeviceId}
      />

      {/* 3. Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => { setShowScanModal(true); startScan(); }}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* 4. Modals */}
      <ScanModal
        isVisible={showScanModal}
        isScanning={isScanning}
        devices={scannedDevices}
        onClose={() => setShowScanModal(false)}
        // PERBAIKAN DISINI: Gunakan handleAddDevice, bukan addDevice langsung
        onAddDevice={handleAddDevice} 
      />

      <RadarModal
        device={myDevices.find((d) => d.id === radarDeviceId) || null}
        onClose={() => setRadarDeviceId(null)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, backgroundColor: "#fff" },
  fab: { position: "absolute", right: 24, bottom: 32, backgroundColor: "#0a7ea4", width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", elevation: 6, zIndex: 100 },
});