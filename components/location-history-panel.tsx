import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { LocationHistoryPoint } from '@/types/models';
import { formatDistance } from '@/utils/distance';
import { calculateTotalDistance } from '@/utils/location-history';

interface LocationHistoryPanelProps {
  history: LocationHistoryPoint[];
}

export function LocationHistoryPanel({ history }: LocationHistoryPanelProps) {
  const totalDistance = calculateTotalDistance(history);

  return (
    <ThemedView style={styles.panel}>
      <ThemedText type="defaultSemiBold">Historical Location</ThemedText>
      <ThemedText style={styles.meta}>
        Points: {history.length} • Traveled: {formatDistance(totalDistance)}
      </ThemedText>
      {history.slice(-5).reverse().map((p, idx) => (
        <View key={idx} style={styles.item}>
          <ThemedText>
            {new Date(p.timestamp).toLocaleTimeString()} — {p.latitude.toFixed(4)},{' '}
            {p.longitude.toFixed(4)}
          </ThemedText>
        </View>
      ))}
      {history.length === 0 && <ThemedText style={styles.meta}>No history yet.</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },
  meta: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  item: {
    paddingVertical: 2,
  },
});
