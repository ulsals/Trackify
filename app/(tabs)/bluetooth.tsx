import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as BackgroundTask from "expo-background-task";
import { BackgroundTaskResult } from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { BleManager, Device, ScanMode } from "react-native-ble-plx";
// --- BACKGROUND BLE MONITORING TASK ---
const BLE_MONITOR_TASK = "ble-monitor-task";
TaskManager.defineTask(BLE_MONITOR_TASK, async () => {
  try {
    const manager = new BleManager();
    // Ambil daftar perangkat yang ingin dipantau dari storage (untuk demo, hardcode id)
    // Untuk produksi, gunakan SecureStore/AsyncStorage untuk menyimpan id perangkat
    // Contoh: const trackedIds = await AsyncStorage.getItem('trackedDeviceIds');
    // Di sini, scan semua device dan kirim notifikasi jika tidak ditemukan
    const devices = await manager.devices([]); // Kosongkan array untuk scan semua
    // Demo: jika tidak ada device ditemukan, kirim notifikasi
    if (!devices || devices.length === 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Trackify: Tidak ada perangkat terdeteksi",
          body: "Perangkat Anda tidak terdeteksi di background!",
          sound: true,
        },
        trigger: null,
      });
    }
    return BackgroundTaskResult.Success;
  } catch (e) {
    return BackgroundTaskResult.Failed;
  }
});

import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

// Interface
interface TrackedDevice {
  id: string;
  name: string | null;
  rssi: number;
  status: "CONNECTED" | "DISCONNECTED" | "FAR" | "SEARCHING";
  deviceObject: Device | null;
  errorCount?: number;
}

// Global Manager (Anti-Zombie)
const manager = new BleManager();

export default function BluetoothScreen() {
  const myDevicesRef = useRef<TrackedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
  const [myDevices, setMyDevices] = useState<TrackedDevice[]>([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [editNameId, setEditNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const monitorIntervalRef = useRef<number | null>(null);

  // Sync Ref
  useEffect(() => {
    myDevicesRef.current = myDevices;
  }, [myDevices]);

  // --- 0. SETUP NOTIFIKASI & BACKGROUND TASK ---
  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    // Daftarkan background task BLE monitor
    BackgroundTask.registerTaskAsync(BLE_MONITOR_TASK, {
      minimumInterval: 15 * 60, // 15 menit (Android minimum)
    });
  }, []);

  // --- 1. SETUP PERIZINAN PINTAR (Sesuai Versi Android) & BACKGROUND LOCATION ---
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === "android") {
        try {
          // Cek Versi Android
          const apiLevel = parseInt(Platform.Version.toString(), 10);
          console.log("Android API Level:", apiLevel);

          if (apiLevel >= 31) {
            // Android 12+ (Butuh BLUETOOTH_SCAN & CONNECT)
            const result = await PermissionsAndroid.requestMultiple([
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);

            const isScan =
              result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
              PermissionsAndroid.RESULTS.GRANTED;
            const isConnect =
              result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
              PermissionsAndroid.RESULTS.GRANTED;
            const isLoc =
              result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
              PermissionsAndroid.RESULTS.GRANTED;

            console.log("Permissions (Android 12+):", {
              isScan,
              isConnect,
              isLoc,
            });
            if (!isScan || !isConnect || !isLoc) {
              Alert.alert(
                "Izin Ditolak",
                "Mohon izinkan Bluetooth (Nearby Devices) dan Lokasi agar aplikasi bisa scan."
              );
            }
          } else {
            // Android 11 ke bawah (Cuma butuh Lokasi)
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            console.log("Permissions (Android <12):", granted);
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              Alert.alert(
                "Izin Lokasi Ditolak",
                "Aplikasi butuh lokasi untuk scan bluetooth di Android versi ini."
              );
            }
          }

          // Tambahan: Minta izin background location (Android 10+)
          // Gunakan expo-location agar dialog izin background muncul
          try {
            const {
              requestBackgroundPermissionsAsync,
            } = require("expo-location");
            const bgStatus = await requestBackgroundPermissionsAsync();
            if (bgStatus.status !== "granted") {
              Alert.alert(
                "Izin Latar Belakang Diperlukan",
                "Aplikasi membutuhkan izin lokasi di latar belakang agar BLE monitoring tetap berjalan saat aplikasi tidak aktif."
              );
            }
          } catch (e) {
            console.warn("Gagal meminta izin background location:", e);
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestPermissions();

    return () => {
      stopMonitoring();
      manager.stopDeviceScan();
    };
  }, []);

  // --- 2. START SCAN (LOGGING LENGKAP) ---
  const startScan = async () => {
    if (isScanning) return;

    // Cek State Bluetooth
    const state = await manager.state();
    console.log("Bluetooth State:", state); // LOG 1

    if (state !== "PoweredOn") {
      Alert.alert("Bluetooth Mati", "Nyalakan Bluetooth & GPS dulu.");
      return;
    }

    setScannedDevices([]);
    setIsScanning(true);
    console.log("Mulai Scan... (Mode LowLatency)"); // LOG 2

    // Scan Mode: LowLatency (Paling Agresif)
    manager.startDeviceScan(
      null,
      { scanMode: ScanMode.LowLatency },
      (error, device) => {
        if (error) {
          // Jika masuk sini, berarti ada masalah sistem
          console.log("SCAN ERROR:", error.reason);
          if (error.reason?.includes("Location")) {
            Alert.alert("GPS Mati", "Nyalakan GPS/Lokasi di status bar HP.");
          }
          return;
        }

        if (device) {
          // LOG SEMUA YANG DITEMUKAN (Bahkan yang tanpa nama)
          // console.log("Device Found:", device.id, device.name, device.rssi);

          // Fallback Nama
          let displayName = device.name;
          if (!displayName && (device as any).localName)
            displayName = (device as any).localName;

          // Tetap tampilkan walau tanpa nama (untuk testing)
          const finalName = displayName || "Unknown Device";

          // Buat objek device baru dengan nama
          const deviceWithName = Object.assign(
            Object.create(Object.getPrototypeOf(device)),
            device,
            { name: finalName }
          ) as Device;

          // Filter: Jangan tampilkan jika sudah ada di "My Devices"
          const isSaved = myDevicesRef.current.some((d) => d.id === device.id);

          if (!isSaved) {
            setScannedDevices((prev) => {
              // Cek duplikat di list hasil scan
              const index = prev.findIndex((d) => d.id === device.id);
              if (index !== -1) {
                // Update jika nama berubah dari Unknown -> Ada Nama
                if (
                  prev[index].name === "Unknown Device" &&
                  finalName !== "Unknown Device"
                ) {
                  const newList = [...prev];
                  newList[index] = deviceWithName;
                  return newList;
                }
                return prev;
              }
              return [...prev, deviceWithName];
            });
          }
        }
      }
    );

    // Stop otomatis setelah 8 detik
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
      console.log("Scan Selesai.");
    }, 8000);
  };

  // --- 3. ADD DEVICE ---
  const addDevice = async (device: Device) => {
    manager.stopDeviceScan();
    setIsScanning(false);
    setShowScanModal(false);

    const newTracked: TrackedDevice = {
      id: device.id,
      name: device.name || "Unknown Device",
      rssi: 0,
      status: "DISCONNECTED",
      deviceObject: null,
    };
    setMyDevices((prev) => [...prev, newTracked]);
    setScannedDevices((prev) => prev.filter((d) => d.id !== device.id));
    connectToDevice(newTracked);
  };

  // --- 4. CONNECT ---
  const connectToDevice = async (trackItem: TrackedDevice) => {
    let didTimeout = false;
    let timeoutId: number | null = null;
    try {
      updateDeviceState(trackItem.id, { status: "SEARCHING" });

      // Timeout: 10 detik
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          didTimeout = true;
          reject(new Error("Timeout: Gagal terhubung ke perangkat."));
        }, 10000);
      });

      const connectPromise = (async () => {
        const isConnected = await manager
          .isDeviceConnected(trackItem.id)
          .catch(() => false);
        let connectedDevice;
        if (isConnected) {
          const devices = await manager.devices([trackItem.id]);
          if (devices[0]) connectedDevice = devices[0];
        }
        if (!connectedDevice) {
          connectedDevice = await manager.connectToDevice(trackItem.id, {
            autoConnect: false,
          });
        }
        await connectedDevice.discoverAllServicesAndCharacteristics();
        return connectedDevice;
      })();

      const connectedDevice = await Promise.race([
        connectPromise,
        timeoutPromise,
      ]);
      if (timeoutId) clearTimeout(timeoutId);
      updateDeviceState(trackItem.id, {
        status: "CONNECTED",
        deviceObject: connectedDevice as Device,
        errorCount: 0,
      });
      if (!monitorIntervalRef.current) startMonitoring();
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      if (didTimeout) {
        Alert.alert(
          "Timeout",
          "Gagal terhubung ke perangkat. Coba ulangi atau periksa perangkat Anda.",
          [
            {
              text: "OK",
              onPress: () =>
                updateDeviceState(trackItem.id, { status: "DISCONNECTED" }),
            },
          ]
        );
        updateDeviceState(trackItem.id, { status: "DISCONNECTED" });
        return;
      }
      // Hindari error null/undefined dilempar ke native
      console.log("Connect Fail, Reconnecting...", error?.message || error);
      scanForReconnection(trackItem);
    }
  };

  const scanForReconnection = (item: TrackedDevice) => {
    manager.startDeviceScan(
      null,
      { scanMode: ScanMode.LowLatency },
      (error, device) => {
        if (device) {
          const foundName = device.name || (device as any).localName;
          if (foundName === item.name) {
            manager.stopDeviceScan();
            setMyDevices((prev) =>
              prev.map((d) =>
                d.name === item.name
                  ? { ...d, id: device.id, status: "SEARCHING" }
                  : d
              )
            );
            connectToDevice({ ...item, id: device.id });
          }
        }
      }
    );
    setTimeout(() => {
      manager.stopDeviceScan();
      updateDeviceState(item.id, { status: "DISCONNECTED" });
    }, 5000);
  };

  const removeDevice = async (id: string) => {
    try {
      // Cari deviceObject dari myDevices
      const device = myDevicesRef.current.find((d) => d.id === id);
      if (device && device.deviceObject) {
        await manager.cancelDeviceConnection(id);
      }
    } catch (e) {
      // Ignore error
    }
    setMyDevices((prev) => prev.filter((d) => d.id !== id));
  };

  // --- 5. MONITORING ---
  const startMonitoring = () => {
    if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
    monitorIntervalRef.current = setInterval(async () => {
      setMyDevices((currentDevices) => {
        currentDevices.forEach(async (item) => {
          if (
            item.status === "DISCONNECTED" ||
            item.status === "SEARCHING" ||
            !item.deviceObject
          )
            return;
          try {
            const isConnected = await manager.isDeviceConnected(item.id);
            if (!isConnected) {
              handleDeviceLost(item);
              return;
            }

            const updatedDev = await item.deviceObject.readRSSI();
            const newRssi = updatedDev.rssi || -100;
            if (item.errorCount && item.errorCount > 0)
              updateDeviceState(item.id, { errorCount: 0 });

            let newStatus: TrackedDevice["status"] = "CONNECTED";
            if (newRssi < -90) newStatus = "FAR";

            if (item.rssi !== newRssi || item.status !== newStatus) {
              updateDeviceState(item.id, { rssi: newRssi, status: newStatus });
              if (newStatus === "FAR") triggerAlarm();
            }
          } catch (error) {
            const errCount = (item.errorCount || 0) + 1;
            if (errCount >= 3) handleDeviceLost(item);
            else updateDeviceState(item.id, { errorCount: errCount });
          }
        });
        return currentDevices;
      });
    }, 2000) as unknown as number;
  };

  const handleDeviceLost = (item: TrackedDevice) => {
    // Dapatkan waktu sekarang
    const now = new Date();
    const tanggal = now.toLocaleDateString();
    const waktu = now.toLocaleTimeString();
    // Notifikasi lokal (expo-notifications)
    Notifications.scheduleNotificationAsync({
      content: {
        title: "PERINGATAN! Perangkat Terputus",
        body: `Perangkat: ${
          item.name || "Unknown Device"
        }\nTanggal: ${tanggal}\nWaktu: ${waktu}\nKoneksi perangkat terputus! Segera cek barang Anda!`,
        sound: true,
        vibrate: [700, 400, 700, 400, 700],
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
    // Tampilkan alert jika app sedang aktif
    Alert.alert(
      "PERINGATAN! Perangkat Terputus",
      `Perangkat: ${
        item.name || "Unknown Device"
      }\nTanggal: ${tanggal}\nWaktu: ${waktu}\n\nKoneksi perangkat terputus! Segera cek barang Anda!`,
      [{ text: "OK" }]
    );
    // Getaran lebih lama dan berulang
    triggerAlarm();
    updateDeviceState(item.id, {
      status: "DISCONNECTED",
      rssi: 0,
      errorCount: 0,
      deviceObject: null,
    });
  };

  const updateDeviceState = (id: string, updates: Partial<TrackedDevice>) => {
    setMyDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const stopMonitoring = () => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
  };

  // Getaran lebih lama dan berulang (3x getar)
  const triggerAlarm = () => {
    // Pola: getar 700ms, diam 400ms, ulang 3x
    Vibration.vibrate([700, 400, 700, 400, 700], false);
  };

  // --- UI ---
  const renderMyDevice = ({ item }: { item: TrackedDevice }) => {
    const isConnected = item.status === "CONNECTED" || item.status === "FAR";
    const isFar = item.status === "FAR";
    const isEditing = editNameId === item.id;
    return (
      <ThemedView style={[styles.card, isFar && styles.cardDanger]}>
        <ThemedView style={styles.cardHeaderFull}>
          <MaterialIcons
            name={isConnected ? "bluetooth-connected" : "bluetooth-disabled"}
            size={28}
            color={isConnected ? (isFar ? "orange" : "green") : "gray"}
          />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 10,
            }}
          >
            {isEditing ? (
              <TextInput
                style={styles.editNameInputMinimal}
                value={editNameValue}
                onChangeText={setEditNameValue}
                autoFocus
                onBlur={() => setEditNameId(null)}
                onSubmitEditing={() => {
                  setMyDevices((prev) =>
                    prev.map((d) =>
                      d.id === item.id ? { ...d, name: editNameValue } : d
                    )
                  );
                  setEditNameId(null);
                }}
                placeholder="Nama Perangkat"
                maxLength={32}
                returnKeyType="done"
              />
            ) : (
              <ThemedText
                type="defaultSemiBold"
                numberOfLines={1}
                style={{ flex: 1, fontSize: 18 }}
              >
                {item.name}
              </ThemedText>
            )}
            {/* Icon edit di luar area nama */}
            {!isEditing && (
              <TouchableOpacity
                onPress={() => {
                  setEditNameId(item.id);
                  setEditNameValue(item.name || "");
                }}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="pencil" size={18} color="#0a7ea4" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => removeDevice(item.id)}
            style={{ marginLeft: 10 }}
          >
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={styles.cardBody}>
          {item.status === "SEARCHING" ? (
            <>
              <ActivityIndicator color="blue" />
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() =>
                  updateDeviceState(item.id, { status: "DISCONNECTED" })
                }
              >
                <ThemedText style={{ color: "#0a7ea4", fontSize: 12 }}>
                  Batal
                </ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ThemedText
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: isConnected ? (isFar ? "orange" : "green") : "gray",
                }}
              >
                {isConnected ? `${item.rssi} dBm` : "--"}
              </ThemedText>
              <ThemedText style={styles.statusText}>
                {item.status === "FAR" ? "MENJAUH ⚠️" : item.status}
              </ThemedText>
            </>
          )}
        </ThemedView>
        {!isConnected && item.status !== "SEARCHING" && (
          <TouchableOpacity
            style={styles.reconnectBtn}
            onPress={() => connectToDevice(item)}
          >
            <ThemedText style={{ color: "white", fontSize: 12 }}>
              Sambung Ulang
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.sectionFull}>
        <ThemedText type="subtitle" style={styles.sectionTitleFull}>
          Perangkat Dipantau ({myDevices.length})
        </ThemedText>
        {myDevices.length === 0 ? (
          <ThemedText style={styles.emptyHint}>Belum ada perangkat.</ThemedText>
        ) : (
          <FlatList
            data={myDevices}
            renderItem={renderMyDevice}
            keyExtractor={(d) => d.id}
            horizontal={false}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingVertical: 10, gap: 10 }}
            style={{ flex: 1 }}
          />
        )}
      </ThemedView>
      <View
        style={{ height: 1, backgroundColor: "#ccc", marginVertical: 10 }}
      />
      {/* Tombol Plus (+) di kanan bawah */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setShowScanModal(true);
          startScan();
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Modal Pop Up Scan */}
      <Modal
        isVisible={showScanModal}
        onBackdropPress={() => setShowScanModal(false)}
        style={styles.modalScan}
      >
        <SafeAreaView style={styles.modalContent} edges={["bottom"]}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
            Scan & Tambah Perangkat
          </ThemedText>
          {isScanning && (
            <ActivityIndicator color="blue" style={{ marginBottom: 8 }} />
          )}
          <FlatList
            data={scannedDevices}
            keyExtractor={(d) => d.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.scanItem}
                onPress={() => addDevice(item)}
              >
                <Ionicons name="add-circle-outline" size={24} color="#0a7ea4" />
                <ThemedView style={{ marginLeft: 10 }}>
                  <ThemedText type="defaultSemiBold">
                    {item.name || "Unknown Device"}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 10, color: "gray" }}>
                    {item.id}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !isScanning && scannedDevices.length === 0 ? (
                <ThemedText
                  style={{ textAlign: "center", marginTop: 20, color: "gray" }}
                >
                  Tidak ada perangkat ditemukan
                </ThemedText>
              ) : null
            }
          />
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => setShowScanModal(false)}
          >
            <ThemedText style={{ color: "white" }}>Tutup</ThemedText>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, backgroundColor: "#fff" },
  sectionFull: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sectionTitleFull: {
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 20,
  },
  emptyHint: {
    fontStyle: "italic",
    color: "gray",
    marginTop: 10,
    paddingHorizontal: 16,
  },
  card: {
    width: "96%",
    alignSelf: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeaderFull: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "transparent",
    width: "100%",
  },
  editNameInputMinimal: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1,
    borderColor: "#0a7ea4",
    paddingVertical: 2,
    color: "#222",
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingHorizontal: 0,
    minWidth: 60,
    marginRight: 0,
  },
  cancelBtn: {
    marginTop: 8,
    alignItems: "center",
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#0a7ea4",
    backgroundColor: "#eaf7fa",
    alignSelf: "center",
    minWidth: 60,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: "#0a7ea4",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
  },
  modalScan: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 350,
    maxHeight: "80%",
    paddingBottom: 34, // Tambahan agar tidak tertimpa navigation bar
  },
  closeModalBtn: {
    backgroundColor: "#0a7ea4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  cardDanger: { borderColor: "red", backgroundColor: "#ffe6e6" },
  cardBody: { alignItems: "center", backgroundColor: "transparent" },
  statusText: { fontSize: 10, marginTop: 5, fontWeight: "bold" },
  reconnectBtn: {
    marginTop: 10,
    backgroundColor: "#0a7ea4",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  scanBtn: {
    backgroundColor: "#0a7ea4",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  scanItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
