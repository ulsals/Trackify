import { useDeviceLocation, useFirestoreSync } from '@/hooks/use-firestore-sync';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function DeviceCodeManager() {
  const [mode, setMode] = useState<'show' | 'input'>('show');
  const [myCode, setMyCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [tracking, setTracking] = useState(false);

  const { getDeviceCode, setDeviceCode } = useFirestoreSync();
  const { location: trackedLocation, startTracking } = useDeviceLocation(inputCode);

  // Load my device code on mount
  useEffect(() => {
    (async () => {
      const code = await getDeviceCode();
      setMyCode(code);
    })();
  }, [getDeviceCode]);

  const handleStartTracking = () => {
    if (!inputCode.trim()) {
      Alert.alert('Error', 'Please enter a device code');
      return;
    }

    setTracking(true);
    const unsubscribe = startTracking((loc) => {
      console.log('📍 Tracking location:', loc);
    });

    // Return cleanup function
    return () => {
      unsubscribe();
      setTracking(false);
    };
  };

  const handleStopTracking = () => {
    setTracking(false);
    setInputCode('');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Device Tracking
      </ThemedText>

      {mode === 'show' ? (
        // Show My Code Mode
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.label}>
            My Device Code
          </ThemedText>
          <View style={styles.codeBox}>
            <ThemedText style={styles.code}>{myCode}</ThemedText>
          </View>
          <ThemedText style={styles.hint}>
            Share this code with others to let them track your location
          </ThemedText>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setMode('input')}
          >
            <ThemedText style={styles.buttonText}>Track Another Device</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        // Input Code Mode
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.label}>
            Enter Device Code to Track
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Device code"
            placeholderTextColor="#999"
            value={inputCode}
            onChangeText={setInputCode}
            editable={!tracking}
          />

          {tracking && trackedLocation ? (
            <View style={styles.locationBox}>
              <ThemedText style={styles.locationLabel}>Tracked Location:</ThemedText>
              <ThemedText style={styles.locationText}>
                Lat: {trackedLocation.latitude.toFixed(4)}
              </ThemedText>
              <ThemedText style={styles.locationText}>
                Lon: {trackedLocation.longitude.toFixed(4)}
              </ThemedText>
              <ThemedText style={styles.locationTime}>
                {new Date(trackedLocation.timestamp).toLocaleTimeString()}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            {!tracking ? (
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, { flex: 1 }]}
                onPress={handleStartTracking}
              >
                <ThemedText style={styles.buttonText}>Start Tracking</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.buttonDanger, { flex: 1 }]}
                onPress={handleStopTracking}
              >
                <ThemedText style={styles.buttonText}>Stop Tracking</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary, { flex: 1, marginLeft: 10 }]}
              onPress={() => {
                setMode('show');
                handleStopTracking();
              }}
            >
              <ThemedText style={styles.buttonText}>Back</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
  },
  section: {
    gap: 12,
  },
  label: {
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  code: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  locationBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    gap: 4,
  },
  locationLabel: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  locationTime: {
    fontSize: 12,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#E8E8E8',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontWeight: '600',
    color: '#fff',
  },
});
