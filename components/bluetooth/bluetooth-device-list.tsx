import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TrackedDevice } from "@/utils/bluetooth-helpers";
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { BluetoothDeviceCard } from "./bluetooth-device-card";

interface Props {
  devices: TrackedDevice[];
  onConnect: (item: TrackedDevice) => void;
  onRemove: (id: string) => void;
  onEditName: (id: string, name: string) => void;
  onOpenRadar: (id: string) => void;
}

export function BluetoothDeviceList({ devices, onConnect, onRemove, onEditName, onOpenRadar }: Props) {
  return (
    <ThemedView style={styles.sectionFull}>
      <ThemedText type="subtitle" style={styles.sectionTitleFull}>
        Perangkat Dipantau ({devices.length})
      </ThemedText>
      
      <FlatList
        data={devices}
        keyExtractor={(d) => d.id}
        renderItem={({ item, index }) => (
          <BluetoothDeviceCard
            item={item}
            index={index}
            onConnect={onConnect}
            onRemove={onRemove}
            onEditName={onEditName}
            onOpenRadar={onOpenRadar}
          />
        )}
        contentContainerStyle={{ paddingVertical: 10, gap: 10 }}
        style={{ flex: 1 }}
        ListEmptyComponent={<ThemedText style={styles.emptyHint}>Belum ada perangkat.</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionFull: { flex: 1 },
  sectionTitleFull: { marginBottom: 8, paddingHorizontal: 16, paddingTop: 16, fontSize: 20 },
  emptyHint: { fontStyle: "italic", color: "gray", marginTop: 10, paddingHorizontal: 16 },
});