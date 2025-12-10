import { useState } from 'react';
import { Alert, FlatList, StyleSheet, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

export interface TrackedDevice {
  firestoreId: string;
  name: string;
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

interface TrackedDevicesListProps {
  devices: TrackedDevice[];
  projectId?: string;
  apiKey?: string;
  onAddDevice?: (firestoreId: string, name: string) => void;
  onRemoveDevice?: (firestoreId: string) => void;
  onRefresh?: () => void;
}

export function TrackedDevicesList({
  devices,
  onAddDevice,
  onRemoveDevice,
  onRefresh,
}: TrackedDevicesListProps) {
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!newDeviceId.trim() || !newDeviceName.trim()) return;
    onAddDevice?.(newDeviceId, newDeviceName);
    setNewDeviceId('');
    setNewDeviceName('');
    setIsAdding(false);
  };

  const handleDeleteConfirm = (firestoreId: string, deviceName: string) => {
    Alert.alert(
      'Stop Tracking',
      `Stop tracking "${deviceName}"? You can add it back later with the tracking code.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Tracking',
          style: 'destructive',
          onPress: () => onRemoveDevice?.(firestoreId),
        },
      ]
    );
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'No data yet';
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatCoords = (location?: TrackedDevice['lastLocation']) => {
    if (!location) return 'Waiting for location...';
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const getStatusColor = (timestamp?: number) => {
    if (!timestamp) return Colors.light.offline;
    const diffMs = Date.now() - timestamp;
    const diffMin = diffMs / 60000;
    return diffMin < 2 ? Colors.light.online : Colors.light.offline;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">🔴 Track Someone</ThemedText>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
          <ThemedText style={styles.action}>{isAdding ? '✕ Cancel' : '+ Add'}</ThemedText>
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View style={styles.form}>
          <TextInput
            placeholder="Enter tracking code (e.g., TRACK-ABC123)"
            value={newDeviceId}
            onChangeText={setNewDeviceId}
            style={styles.input}
            placeholderTextColor={Colors.light.textSecondary}
          />
          <TextInput
            placeholder="Display name for this device"
            value={newDeviceName}
            onChangeText={setNewDeviceName}
            style={styles.input}
            placeholderTextColor={Colors.light.textSecondary}
          />
          <TouchableOpacity style={styles.button} onPress={handleAdd}>
            <ThemedText style={styles.buttonText}>Add Tracked Device</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {devices.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No devices being tracked yet.</ThemedText>
          <ThemedText style={styles.emptySubtext}>Enter a tracking code to start monitoring someone's location.</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(d) => d.firestoreId}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <ThemedView style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.lastLocation?.timestamp) }]} />
                <View style={styles.cardTitleContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.deviceName}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.deviceId}>
                    Code: {item.firestoreId}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteConfirm(item.firestoreId, item.name)}
                >
                  <ThemedText style={styles.deleteIcon}>✕</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>📍 Location:</ThemedText>
                  <ThemedText style={styles.location}>
                    {formatCoords(item.lastLocation)}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>🕐 Updated:</ThemedText>
                  <ThemedText style={styles.timestamp}>
                    {formatTime(item.lastLocation?.timestamp)}
                  </ThemedText>
                </View>
                <View style={styles.statusIndicator}>
                  <View
                    style={[
                      styles.statusDotSmall,
                      { backgroundColor: getStatusColor(item.lastLocation?.timestamp) },
                    ]}
                  />
                  <ThemedText style={styles.statusText}>
                    {item.lastLocation && Date.now() - item.lastLocation.timestamp < 120000
                      ? 'Active now'
                      : 'Last seen'}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          )}
        />
      )}

      {devices.length > 0 && (
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <ThemedText style={styles.refreshIcon}>⟳</ThemedText>
          <ThemedText style={styles.refreshText}>Refresh Locations</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  action: {
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 13,
  },
  form: {
    gap: 8,
    padding: 10,
    backgroundColor: 'rgba(26, 115, 232, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 10,
    borderRadius: 8,
    color: Colors.light.text,
    fontSize: 12,
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  emptySubtext: {
    color: Colors.light.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: Colors.light.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardTitleContainer: {
    flex: 1,
    gap: 2,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
  },
  deviceId: {
    color: Colors.light.textSecondary,
    fontSize: 11,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: Colors.light.zoneCritical,
    fontSize: 16,
    fontWeight: '600',
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  location: {
    color: Colors.light.tint,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  timestamp: {
    color: Colors.light.textSecondary,
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  statusDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: Colors.light.textSecondary,
    fontSize: 11,
  },
  refreshButton: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  refreshIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  refreshText: {
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 13,
  },
});
