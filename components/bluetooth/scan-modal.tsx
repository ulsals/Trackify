import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Device } from "react-native-ble-plx";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  isVisible: boolean;
  isScanning: boolean;
  devices: Device[];
  onClose: () => void;
  onAddDevice: (device: Device) => void;
}

export function ScanModal({ isVisible, isScanning, devices, onClose, onAddDevice }: Props) {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modalScan}>
      <SafeAreaView style={styles.modalContent} edges={["bottom"]}>
        <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Scan & Tambah Perangkat</ThemedText>
        {isScanning && <ActivityIndicator color="blue" style={{ marginBottom: 8 }} />}
        
        <FlatList
          data={devices}
          keyExtractor={(d) => d.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.scanItem} onPress={() => onAddDevice(item)}>
              <Ionicons name="add-circle-outline" size={24} color="#0a7ea4" />
              <ThemedView style={{ marginLeft: 10 }}>
                <ThemedText type="defaultSemiBold">{item.name || "Unknown Device"}</ThemedText>
                <ThemedText style={{ fontSize: 10, color: "gray" }}>{item.id}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          )}
          ListEmptyComponent={!isScanning && devices.length === 0 ? <ThemedText style={styles.empty}>Tidak ada perangkat ditemukan</ThemedText> : null}
        />
        
        <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
          <ThemedText style={{ color: "white" }}>Tutup</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalScan: { justifyContent: "flex-end", margin: 0 },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 350, maxHeight: "80%", paddingBottom: 34 },
  scanItem: { flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  closeModalBtn: { backgroundColor: "#0a7ea4", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 16 },
  empty: { textAlign: "center", marginTop: 20, color: "gray" },
});