import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundTask from "expo-background-task";
import { BackgroundTaskResult } from "expo-background-task"; 
import * as TaskManager from "expo-task-manager";
import { useEffect, useRef, useState } from "react";
import { Alert, Vibration } from "react-native";
import { BleManager, Device, ScanMode } from "react-native-ble-plx";
import { TrackedDevice } from "../utils/bluetooth-helpers";
import { useLocationAndNotification } from "./use-location-and-notification";

// ... (Bagian atas file sama seperti sebelumnya) ...
// ... (Global Manager, TaskManager, constants sama) ...
let bleManager: BleManager;
const getManager = () => {
  if (!bleManager) bleManager = new BleManager();
  return bleManager;
};

const STORAGE_KEY = "@trackify_myDevices";
const BLE_MONITOR_TASK = "ble-monitor-task";

TaskManager.defineTask(BLE_MONITOR_TASK, async () => {
  try {
    const manager = getManager();
    await manager.state(); 
    return BackgroundTaskResult.Success; 
  } catch (e) {
    return BackgroundTaskResult.Failed; 
  }
});

export const useBluetoothManager = () => {
  const manager = getManager();
  const [myDevices, setMyDevices] = useState<TrackedDevice[]>([]);
  const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  
  const myDevicesRef = useRef<TrackedDevice[]>([]);
  const monitorIntervalRef = useRef<any>(null);

  const { getCurrentLocationAndAddress, sendLostNotification } = useLocationAndNotification();

  // ... (Bagian Persistence & useEffect sama) ...
  useEffect(() => {
    myDevicesRef.current = myDevices;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(myDevices)).catch(() => {});
  }, [myDevices]);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setMyDevices(JSON.parse(saved));
      BackgroundTask.registerTaskAsync(BLE_MONITOR_TASK, { minimumInterval: 15 * 60 }).catch(() => {});
    })();
    return () => { stopMonitoring(); manager.stopDeviceScan(); };
  }, []);

  // ... (Bagian Actions & Connection Logic sama) ...
  const startScan = async () => { /* ... kode sama ... */ 
      if (isScanning) return;
      const state = await manager.state();
      if (state !== "PoweredOn") { Alert.alert("Bluetooth Mati", "Nyalakan Bluetooth dulu."); return; }
      setScannedDevices([]); setIsScanning(true);
      manager.startDeviceScan(null, { scanMode: ScanMode.LowLatency }, (error, device) => {
        if (error || !device) return;
        const displayName = device.name || (device as any).localName || "Unknown Device";
        const deviceWithName = Object.assign(Object.create(Object.getPrototypeOf(device)), device, { name: displayName });
        const isSaved = myDevicesRef.current.some((d) => d.id === device.id);
        if (!isSaved) {
          setScannedDevices((prev) => {
            if (prev.find((d) => d.id === device.id)) return prev;
            return [...prev, deviceWithName];
          });
        }
      });
      setTimeout(() => { manager.stopDeviceScan(); setIsScanning(false); }, 8000);
  };
  const addDevice = (device: Device) => { /* ... kode sama ... */ 
      manager.stopDeviceScan(); setIsScanning(false);
      const newTracked: TrackedDevice = { id: device.id, name: device.name || "Unknown Device", rssi: 0, status: "DISCONNECTED", deviceObject: null };
      setMyDevices((prev) => [...prev, newTracked]);
      connectToDevice(newTracked);
  };
  const removeDevice = async (id: string) => { /* ... kode sama ... */ 
      try { await manager.cancelDeviceConnection(id); } catch (e) {}
      setMyDevices((prev) => prev.filter((d) => d.id !== id));
  };
  const updateDeviceName = (id: string, newName: string) => { /* ... kode sama ... */ 
      setMyDevices((prev) => prev.map((d) => (d.id === id ? { ...d, name: newName } : d)));
  };
  const connectToDevice = async (trackItem: TrackedDevice) => { /* ... kode sama ... */ 
      let timeoutId: any = null;
      try {
        updateDeviceState(trackItem.id, { status: "SEARCHING" });
        const connectPromise = (async () => {
          const isConnected = await manager.isDeviceConnected(trackItem.id).catch(() => false);
          if (isConnected) return (await manager.devices([trackItem.id]))[0];
          const dev = await manager.connectToDevice(trackItem.id, { autoConnect: false });
          await dev.discoverAllServicesAndCharacteristics();
          return dev;
        })();
        const connectedDevice = await Promise.race([
          connectPromise,
          new Promise((_, reject) => { timeoutId = setTimeout(() => reject(new Error("Timeout")), 10000); }),
        ]);
        if (timeoutId) clearTimeout(timeoutId);
        updateDeviceState(trackItem.id, { status: "CONNECTED", deviceObject: connectedDevice as Device, errorCount: 0 });
        if (!monitorIntervalRef.current) startMonitoring();
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        scanForReconnection(trackItem);
      }
  };
  const scanForReconnection = (item: TrackedDevice) => { /* ... kode sama ... */ 
      manager.startDeviceScan(null, { scanMode: ScanMode.LowLatency }, (error, device) => {
        if (device && device.id === item.id) {
          manager.stopDeviceScan(); connectToDevice({ ...item, id: device.id });
        }
      });
      setTimeout(() => { manager.stopDeviceScan(); updateDeviceState(item.id, { status: "DISCONNECTED" }); }, 5000);
  };

  // --- BAGIAN YANG DIUBAH (LOGIC GETARAN) ---

  const startMonitoring = () => {
    if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
    monitorIntervalRef.current = setInterval(async () => {
      setMyDevices((currentDevices) => {
        currentDevices.forEach(async (item) => {
          if (item.status === "DISCONNECTED" || item.status === "SEARCHING" || !item.deviceObject) return;
          try {
            const isConnected = await manager.isDeviceConnected(item.id);
            if (!isConnected) { handleDeviceLost(item); return; }

            const updatedDev = await item.deviceObject.readRSSI();
            const newRssi = updatedDev.rssi || -100;
            let newStatus: TrackedDevice["status"] = "CONNECTED";
            
            // Threshold FAR (misal lebih lemah dari -90)
            if (newRssi < -90) newStatus = "FAR";

            // PERBAIKAN 1: Getaran Berulang
            // Jika status FAR, getarkan HP setiap detik (looping)
            // Pola: 0ms delay, 400ms getar
            if (newStatus === "FAR") {
              Vibration.vibrate([0, 400]); 
            }

            if (item.rssi !== newRssi || item.status !== newStatus) {
              updateDeviceState(item.id, { rssi: newRssi, status: newStatus, errorCount: 0 });
            }
          } catch (error) {
            const errCount = (item.errorCount || 0) + 1;
            if (errCount >= 3) handleDeviceLost(item);
            else updateDeviceState(item.id, { errorCount: errCount });
          }
        });
        return currentDevices; 
      });
    }, 1000) as unknown as number;
  };

  const stopMonitoring = () => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
  };

  const handleDeviceLost = async (item: TrackedDevice) => {
    const locData = await getCurrentLocationAndAddress();
    
    // PERBAIKAN 2: Getaran 3 Kali Kuat
    // Pola: Getar 800ms, Jeda 300ms, Getar 800ms, Jeda 300ms, Getar 800ms
    Vibration.vibrate([0, 800, 300, 800, 300, 800]);

    if (locData) {
      sendLostNotification(item.name || "Perangkat", locData.address || "Lokasi tidak diketahui");
      Alert.alert("Koneksi Terputus!", `Perangkat ${item.name} terputus.\nLokasi: ${locData.address}`);
    } else {
       Alert.alert("Koneksi Terputus!", `Perangkat ${item.name} terputus.`);
    }

    updateDeviceState(item.id, {
      status: "DISCONNECTED",
      rssi: 0,
      errorCount: 0,
      deviceObject: null,
      lastKnownLocation: locData || undefined,
    });
  };

  const updateDeviceState = (id: string, updates: Partial<TrackedDevice>) => {
    setMyDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  return {
    myDevices,
    scannedDevices,
    isScanning,
    startScan,
    addDevice,
    removeDevice,
    connectToDevice,
    updateDeviceName,
  };
};