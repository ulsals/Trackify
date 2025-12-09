import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { formatBatteryLevel, getBatteryColor } from '@/utils/battery-optimizer';

interface BatteryOptimizationBarProps {
  batteryLevel?: number; // 0-1
  trackingIntervalSec: number;
  storageSizeLabel?: string;
  onToggleSaver?: () => void;
  batterySaverEnabled: boolean;
}

export function BatteryOptimizationBar({
  batteryLevel,
  trackingIntervalSec,
  storageSizeLabel,
  onToggleSaver,
  batterySaverEnabled,
}: BatteryOptimizationBarProps) {
  const level = batteryLevel ?? 0.5;
  const color = getBatteryColor(level, Colors.light);

  return (
    <ThemedView style={styles.bar}>
      <View style={styles.row}>
        <View style={[styles.batteryIcon, { borderColor: color }]}>
          <View style={[styles.batteryFill, { width: `${level * 100}%`, backgroundColor: color }]} />
        </View>
        <ThemedText style={styles.text}>{formatBatteryLevel(level)}</ThemedText>
        <ThemedText style={styles.meta}>Interval: {trackingIntervalSec}s</ThemedText>
        {storageSizeLabel ? (
          <ThemedText style={styles.meta}>History: {storageSizeLabel}</ThemedText>
        ) : null}
        <TouchableOpacity onPress={onToggleSaver}>
          <ThemedText style={styles.action}>{batterySaverEnabled ? 'Saver On' : 'Saver Off'}</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bar: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  batteryIcon: {
    width: 46,
    height: 18,
    borderWidth: 2,
    borderRadius: 4,
    padding: 2,
  },
  batteryFill: {
    height: '100%',
    borderRadius: 2,
  },
  text: {
    fontWeight: '600',
  },
  meta: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  action: {
    color: Colors.light.tint,
  },
});
