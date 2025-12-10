import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
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

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'No data';
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatCoords = (location?: TrackedDevice['lastLocation']) => {
    if (!location) return 'No location';
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Tracked Devices</ThemedText>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
          <ThemedText style={styles.action}>{isAdding ? 'Cancel' : '+ Add'}</ThemedText>
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View style={styles.form}>
          <TextInput
            placeholder="Firestore Device ID"
            value={newDeviceId}
            onChangeText={setNewDeviceId}
            style={styles.input}
            placeholderTextColor={Colors.light.textSecondary}
          />
          <TextInput
            placeholder="Display Name"
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
        <ThemedText style={styles.empty}>No devices being tracked yet.</ThemedText>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(d) => d.firestoreId}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.deviceItem}>
              <View style={styles.deviceInfo}>
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                <ThemedText style={styles.deviceId}>{item.firestoreId}</ThemedText>
                <ThemedText style={styles.location}>{formatCoords(item.lastLocation)}</ThemedText>
                <ThemedText style={styles.timestamp}>{formatTime(item.lastLocation?.timestamp)}</ThemedText>
              </View>
              <TouchableOpacity onPress={() => onRemoveDevice?.(item.firestoreId)}>
                <ThemedText style={styles.delete}>Remove</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {devices.length > 0 && (
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <ThemedText style={styles.refreshText}>⟳ Refresh Locations</ThemedText>
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
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  action: {
    color: Colors.light.tint,
  },
  form: {
    gap: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  empty: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    marginVertical: 8,
  },
  deviceItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
    gap: 2,
  },
  deviceId: {
    color: Colors.light.textSecondary,
    fontSize: 11,
  },
  location: {
    color: Colors.light.tint,
    fontSize: 12,
    fontWeight: '500',
  },
  timestamp: {
    color: Colors.light.textSecondary,
    fontSize: 10,
  },
  delete: {
    color: Colors.light.zoneCritical,
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 10,
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshText: {
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 13,
  },
});
