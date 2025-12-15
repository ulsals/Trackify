import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TrackedDevice } from "@/utils/bluetooth-helpers";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";

interface Props {
  device: TrackedDevice | null;
  onClose: () => void;
}

export function RadarModal({ device, onClose }: Props) {
  // Nilai animasi untuk efek berdenyut (pulse)
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (device) {
      // Jalankan animasi looping saat modal terbuka
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500, // Durasi satu denyutan
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 0, // Reset instan
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0); // Reset saat tutup
    }
  }, [device]);

  if (!device) return null;

  // --- Logika Kalkulasi Sinyal ---
  const rssi = device.rssi || -100;
  // Normalisasi RSSI ke skala 0-1 untuk ukuran visual bubble
  // Asumsi: -40dBm sangat dekat (skala 1), -100dBm sangat jauh (skala 0.2)
  const normalizedScale = Math.max(0.2, Math.min(1, (100 + rssi) / 60));

  const isClose = rssi > -60;
  const isMedium = rssi > -80 && rssi <= -60;

  // Warna berdasarkan kedekatan
  const radarColor = isClose ? "#22c55e" : isMedium ? "#f59e0b" : "#ef4444"; // Green-500, Amber-500, Red-500 (Tailwind colors)

  // Teks Status
  const statusText = isClose
    ? "SANGAT DEKAT!"
    : isMedium
    ? "SEMAKIN DEKAT..."
    : "JAUH";
  const statusSubText = isClose
    ? "Barang ada di sekitar Anda"
    : isMedium
    ? "Terus berjalan mencari sinyal"
    : "Coba berpindah posisi";

  // Interpolasi animasi untuk skala dan opacity (efek riak air)
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.5],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <Modal
      isVisible={!!device}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modalContainer}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.4}
    >
      <ThemedView style={styles.cardContainer}>
        {/* --- HEADER CARD --- */}
        <View style={styles.header}>
          <View>
            <ThemedText type="subtitle" style={styles.deviceName}>
              {device.name}
            </ThemedText>
            <ThemedText style={styles.deviceSub}>
              Mode Pencarian Radar
            </ThemedText>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* --- VISUAL RADAR STAGE --- */}
        <View style={styles.radarStage}>
          {/* Cincin Statis (Background) */}
          <View style={[styles.ring, styles.ringOuter]} />
          <View style={[styles.ring, styles.ringMiddle]} />
          <View style={[styles.ring, styles.ringInner]} />

          {/* Animasi Riak (Pulse Animation) */}
          <Animated.View
            style={[
              styles.pulseRipple,
              {
                backgroundColor: radarColor,
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />

          {/* Bubble Inti (Ukuran berubah sesuai sinyal) */}
          <View
            style={[
              styles.coreBubble,
              {
                backgroundColor: radarColor,
                transform: [{ scale: normalizedScale }],
              },
            ]}
          >
            <MaterialIcons name="location-searching" size={32} color="white" />
          </View>
        </View>

        {/* --- STATUS TEXT HIERARCHY --- */}
        <View style={styles.statusContainer}>
          <ThemedText style={[styles.statusTitle, { color: radarColor }]}>
            {statusText}
          </ThemedText>
          <ThemedText style={styles.statusSubtitle}>{statusSubText}</ThemedText>

          {/* Info Teknis (Dikecilkan) */}
          <View style={styles.techInfoContainer}>
            <MaterialIcons
              name="signal-cellular-alt"
              size={14}
              color="#999"
              style={{ marginRight: 4 }}
            />
            <ThemedText style={styles.techInfoText}>
              Signal Strength: {rssi} dBm
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
  cardContainer: {
    width: "90%",
    maxWidth: 340,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  deviceSub: {
    fontSize: 12,
    color: "#666",
  },
  closeBtn: {
    padding: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },

  // --- RADAR VISUAL STYLES ---
  radarStage: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 25,
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "#e5e7eb", // Abu-abu sangat terang
    borderRadius: 999,
  },
  ringOuter: { width: 220, height: 220 },
  ringMiddle: { width: 160, height: 160 },
  ringInner: { width: 100, height: 100 },

  coreBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Pastikan di atas riak
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pulseRipple: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    zIndex: 1, // Di bawah core bubble
  },

  // --- STATUS STYLES ---
  statusContainer: {
    alignItems: "center",
    width: "100%",
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "900", // Extra bold
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },
  techInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  techInfoText: {
    fontSize: 12,
    color: "#999",
    fontFamily: Platform.select({ ios: "Courier", android: "monospace" }), // Font monospace agar angka sejajar
  },
});
