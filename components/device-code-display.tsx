import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { getDeviceCode } from '@/services/location-tracking';

export function DeviceCodeDisplay() {
  const [deviceCode, setDeviceCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const code = await getDeviceCode();
        setDeviceCode(code);
      } catch (error) {
        console.warn('Failed to get device code:', error);
      }
    })();
  }, []);

  const handleCopyCode = async () => {
    try {
      // Use React Native's Share API as alternative
      Alert.alert(
        'Copy Code',
        deviceCode,
        [
          { text: 'Done', style: 'default' },
        ]
      );
    } catch (error) {
      console.warn('Failed to copy:', error);
      Alert.alert('Error', 'Failed to copy device code');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">📱 My Device Code</ThemedText>
        <ThemedText style={styles.hint}>Share to let others track you</ThemedText>
      </View>

      <View style={styles.codeBox}>
        <ThemedText style={styles.code}>{deviceCode || 'Loading...'}</ThemedText>
      </View>

      <TouchableOpacity
        style={[styles.button, copied && styles.buttonCopied]}
        onPress={handleCopyCode}
        disabled={!deviceCode}
      >
        <ThemedText style={styles.buttonText}>
          {copied ? '✓ Copied' : '📋 Copy Code'}
        </ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.description}>
        Use this code to let others track your location in real-time. They can input this code in their "Track Someone" section.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
    backgroundColor: Colors.light.background,
  },
  header: {
    gap: 4,
  },
  hint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  codeBox: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  code: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonCopied: {
    backgroundColor: Colors.light.online,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  description: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
});
