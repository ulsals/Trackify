import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { DeviceCard } from '@/components/device-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { Device } from '@/types/models';

interface DeviceRegistrationFormProps {
  devices: Device[];
  onRegister: (device: Device) => void;
  onSelectDevice: (deviceId: string) => void;
}

export function DeviceRegistrationForm({
  devices,
  onRegister,
  onSelectDevice,
}: DeviceRegistrationFormProps) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const onSubmit = () => {
    if (!id || !latitude || !longitude) return;
    const device: Device = {
      id,
      name: name || id,
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: 'online',
      lastSeen: Date.now(),
    };
    onRegister(device);
    setId('');
    setName('');
    setLatitude('');
    setLongitude('');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Register GPS Device
      </ThemedText>
      <View style={styles.row}>
        <TextInput
          placeholder="Device ID"
          value={id}
          onChangeText={setId}
          style={styles.input}
          placeholderTextColor={Colors.light.textSecondary}
        />
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={Colors.light.textSecondary}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          placeholder="Latitude"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor={Colors.light.textSecondary}
        />
        <TextInput
          placeholder="Longitude"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor={Colors.light.textSecondary}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <ThemedText style={styles.buttonText}>Register</ThemedText>
      </TouchableOpacity>

      <ThemedText type="subtitle" style={styles.title}>
        Devices
      </ThemedText>
      {devices.length === 0 ? (
        <ThemedText style={styles.empty}>Belum ada device terdaftar.</ThemedText>
      ) : (
        devices.map((d) => (
          <DeviceCard
            key={d.id}
            device={d}
            zones={[]}
            onSelect={onSelectDevice}
            userLocation={undefined}
            onAddZone={() => onSelectDevice(d.id)}
            onToggleZone={() => undefined}
            onDeleteZone={() => undefined}
          />
        ))
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
    gap: 8,
  },
  title: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 10,
    borderRadius: 10,
    color: Colors.light.text,
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    color: Colors.light.textSecondary,
    marginTop: 6,
  },
});
