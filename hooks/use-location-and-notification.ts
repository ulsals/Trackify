import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Alert, PermissionsAndroid, Platform } from "react-native";

export const useLocationAndNotification = () => {
  // Setup Handler Notifikasi
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Request Permissions saat Mount
  useEffect(() => {
    (async () => {
      // 1. Notifikasi
      await Notifications.requestPermissionsAsync({
        ios: { allowSound: true, allowBadge: true },
        android: {},
      });

      // 2. Lokasi Foreground
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Lokasi", "Diperlukan untuk menyimpan lokasi terakhir barang.");
      }

      // 3. Android 12+ Bluetooth Permissions
      if (Platform.OS === "android" && Platform.Version >= 31) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      }
    })();
  }, []);

  // Fungsi Helper: Ambil Lokasi & Alamat Saat Ini
  const getCurrentLocationAndAddress = async () => {
    try {
      const loc = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("GPS Timeout")), 5000)),
      ]) as Location.LocationObject;

      const addresses = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      let addressText = "Lokasi tidak diketahui";
      if (addresses.length > 0) {
        const addr = addresses[0];
        addressText = `${addr.street || addr.name || ""}, ${addr.district || ""}`.replace(/^, /, "");
      }

      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        timestamp: loc.timestamp,
        address: addressText,
      };
    } catch (e) {
      console.log("Gagal ambil lokasi:", e);
      return null;
    }
  };

  const sendLostNotification = async (deviceName: string, address: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ TERPUTUS!",
        body: `${deviceName} tertinggal di: ${address}`,
        sound: true,
      },
      trigger: null,
    });
  };

  return { getCurrentLocationAndAddress, sendLostNotification };
};