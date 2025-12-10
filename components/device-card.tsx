import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { GeofenceZoneCard } from '@/components/geofence-zone-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { Device, GeofenceZone } from '@/types/models';
import { calculateDistance, formatDistance } from '@/utils/distance';

interface DeviceCardProps {
  device: Device;
  zones: GeofenceZone[];
  userLocation?: { latitude: number; longitude: number };
  onSelect?: (deviceId: string) => void;
  onDelete?: (deviceId: string) => void;
  onAddZone?: (deviceId: string) => void;
  onToggleZone?: (zoneId: string) => void;
  onDeleteZone?: (zoneId: string) => void;
}

export function DeviceCard({
  device,
  zones,
  userLocation,
  onSelect,
  onDelete,
  onAddZone,
  onToggleZone,
  onDeleteZone,
}: DeviceCardProps) {
  const distance = userLocation
    ? formatDistance(
        calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          device.latitude,
          device.longitude
        )
      )
    : 'N/A';

  const statusColor = device.status === 'online' ? Colors.light.online : Colors.light.offline;

  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <ThemedText type="title" style={styles.name}>
            {device.name || device.id}
          </ThemedText>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onSelect?.(device.id)}>
            <ThemedText style={styles.action}>Track</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete?.(device.id)}>
            <ThemedText style={styles.delete}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ThemedText style={styles.meta}>Distance: {distance}</ThemedText>
      <ThemedText style={styles.meta}>
        Last seen: {new Date(device.lastSeen).toLocaleTimeString()}
      </ThemedText>

      <View style={styles.zoneHeader}>
        <ThemedText type="defaultSemiBold">Geofence Zones</ThemedText>
        <TouchableOpacity onPress={() => onAddZone?.(device.id)}>
          <ThemedText style={styles.action}>Add Zone</ThemedText>
        </TouchableOpacity>
      </View>

      {zones.length === 0 ? (
        <ThemedText style={styles.meta}>No zones yet.</ThemedText>
      ) : (
        zones.map((z) => (
          <GeofenceZoneCard
            key={z.id}
            zone={z}
            onToggle={onToggleZone}
            onDelete={onDeleteZone}
          />
        ))
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  meta: {
    color: Colors.light.textSecondary,
    fontSize: 13,
  },
  action: {
    color: Colors.light.tint,
  },
  delete: {
    color: Colors.light.zoneCritical,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});
