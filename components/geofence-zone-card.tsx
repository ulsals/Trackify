import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { GeofenceZone } from '@/types/models';

interface GeofenceZoneCardProps {
  zone: GeofenceZone;
  onToggle?: (zoneId: string) => void;
  onDelete?: (zoneId: string) => void;
}

export function GeofenceZoneCard({ zone, onToggle, onDelete }: GeofenceZoneCardProps) {
  const colorMap: Record<GeofenceZone['type'], string> = {
    safe: Colors.light.zoneSafe,
    warning: Colors.light.zoneWarning,
    caution: Colors.light.zoneCaution,
    critical: Colors.light.zoneCritical,
  };

  return (
    <ThemedView style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: colorMap[zone.type] }]} />
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold">{zone.name}</ThemedText>
          <ThemedText style={styles.meta}>
            Radius: {Math.round(zone.radius)} m • {zone.type}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => onToggle?.(zone.id)}>
          <ThemedText style={styles.action}>{zone.enabled ? 'On' : 'Off'}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete?.(zone.id)}>
          <ThemedText style={styles.delete}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  meta: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  action: {
    color: Colors.light.tint,
    paddingHorizontal: 8,
  },
  delete: {
    color: Colors.light.zoneCritical,
    paddingHorizontal: 8,
  },
});
