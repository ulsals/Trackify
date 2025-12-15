import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TrackedDevice, getColorByIndex } from "@/utils/bluetooth-helpers";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  item: TrackedDevice;
  index: number;
  onConnect: (item: TrackedDevice) => void;
  onRemove: (id: string) => void;
  onEditName: (id: string, name: string) => void;
  onOpenRadar: (id: string) => void;
}

export function BluetoothDeviceCard({
  item,
  index,
  onConnect,
  onRemove,
  onEditName,
  onOpenRadar,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name || "");
  const deviceColor = getColorByIndex(index);

  const isConnected = item.status === "CONNECTED" || item.status === "FAR";
  const isFar = item.status === "FAR";

  // --- ANIMASI BERDENYUT (PULSING) ---
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFar) {
      // Loop animasi: Merah -> Putih -> Merah
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false, // false karena kita menganimasikan warna
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      // Reset animasi jika tidak Far
      pulseAnim.setValue(0);
      pulseAnim.stopAnimation();
    }
  }, [isFar]);

  // Interpolasi warna (0 = Putih/Abu, 1 = Merah Bahaya)
  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#f5f5f5", "#ffcccc"], // Dari abu-abu muda ke merah muda terang
  });

  const handleSaveName = () => {
    onEditName(item.id, editValue);
    setIsEditing(false);
  };

  return (
    // Gunakan Animated.View agar bisa berubah warna
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor, // Warna background dinamis
          borderColor: isFar ? "red" : "#ddd", // Border jadi merah solid jika Far
          borderLeftColor: deviceColor,
          borderLeftWidth: 6,
        },
      ]}
    >
      <ThemedView style={styles.cardHeaderFull}>
        <MaterialIcons
          name={isConnected ? "bluetooth-connected" : "bluetooth-disabled"}
          size={28}
          color={isConnected ? (isFar ? "red" : "green") : "gray"} // Ikon jadi merah jika Far
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
              style={styles.editNameInput}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus
              onBlur={handleSaveName}
              onSubmitEditing={handleSaveName}
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

          {!isConnected && item.lastKnownLocation && (
            <Ionicons
              name="location"
              size={16}
              color={deviceColor}
              style={{ marginLeft: 5 }}
            />
          )}

          {!isEditing && (
            <TouchableOpacity
              onPress={() => {
                setIsEditing(true);
                setEditValue(item.name || "");
              }}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="pencil" size={18} color="#0a7ea4" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="trash-outline" size={22} color="red" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.cardBody}>
        {item.status === "SEARCHING" ? (
          <ActivityIndicator color="blue" />
        ) : (
          <>
            <ThemedText
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: isConnected ? (isFar ? "red" : "green") : "gray",
              }}
            >
              {isConnected ? `${item.rssi} dBm` : "--"}
            </ThemedText>

            {isConnected && (
              <TouchableOpacity
                style={[styles.radarBtn, { backgroundColor: deviceColor }]}
                onPress={() => onOpenRadar(item.id)}
              >
                <MaterialIcons name="radar" size={20} color="white" />
                <ThemedText
                  style={{
                    color: "white",
                    fontSize: 12,
                    marginLeft: 5,
                    fontWeight: "bold",
                  }}
                >
                  RADAR
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* Teks Peringatan yang Lebih Mencolok */}
            <ThemedText
              style={[
                styles.statusText,
                isFar && { color: "red", fontSize: 12 },
              ]}
            >
              {isFar ? "⚠️ PERANGKAT MENJAUH! ⚠️" : item.status}
            </ThemedText>

            {!isConnected && item.lastKnownLocation?.address && (
              <ThemedText style={styles.addressText} numberOfLines={2}>
                📍 {item.lastKnownLocation.address}
              </ThemedText>
            )}
          </>
        )}
      </ThemedView>

      {!isConnected && item.status !== "SEARCHING" && (
        <TouchableOpacity
          style={styles.reconnectBtn}
          onPress={() => onConnect(item)}
        >
          <ThemedText style={{ color: "white", fontSize: 12 }}>
            Sambung Ulang
          </ThemedText>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "96%",
    alignSelf: "center",
    padding: 18,
    borderRadius: 16,
    marginVertical: 6,
    borderWidth: 1,
    elevation: 2,
  },
  cardHeaderFull: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  cardBody: { alignItems: "center", backgroundColor: "transparent" },
  editNameInput: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1,
    borderColor: "#0a7ea4",
    paddingVertical: 2,
  },
  radarBtn: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: 5,
  },
  statusText: { fontSize: 10, marginTop: 5, fontWeight: "bold" },
  addressText: {
    fontSize: 10,
    color: "gray",
    textAlign: "center",
    marginTop: 4,
  },
  reconnectBtn: {
    marginTop: 10,
    backgroundColor: "#0a7ea4",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
  },
});
