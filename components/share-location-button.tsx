import { useState } from 'react';
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { createTrackingCode } from '@/services/backend-api-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ShareLocationButtonProps {
  onShared?: (code: string, deviceSecret: string) => void;
}

export function ShareLocationButton({ onShared }: ShareLocationButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    if (!deviceName.trim()) {
      Alert.alert('Error', 'Please enter a device name');
      return;
    }

    setLoading(true);
    try {
      const response = await createTrackingCode(deviceName);
      
      // Store device info locally
      await AsyncStorage.setItem('tracking_code', response.code);
      await AsyncStorage.setItem('device_secret', response.deviceSecret);
      await AsyncStorage.setItem('device_name', deviceName);

      setGeneratedCode(response.code);
      onShared?.(response.code, response.deviceSecret);

      Alert.alert(
        'Success!',
        `Your tracking code: ${response.code}\n\nShare this code with others to let them track your location.`,
        [
          { text: 'OK' },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate tracking code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setDeviceName('');
    setGeneratedCode(null);
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Share My Location</ThemedText>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setModalVisible(true)}
          >
            <ThemedText style={styles.shareButtonText}>Generate Code</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.description}>
          Generate a tracking code to share your location with others
        </ThemedText>
      </ThemedView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Share Your Location
            </ThemedText>

            {!generatedCode ? (
              <>
                <TextInput
                  placeholder="Device Name (e.g., John's Phone)"
                  value={deviceName}
                  onChangeText={setDeviceName}
                  style={styles.input}
                  placeholderTextColor={Colors.light.textSecondary}
                />

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleGenerateCode}
                  disabled={loading}
                >
                  <ThemedText style={styles.buttonText}>
                    {loading ? 'Generating...' : 'Generate Tracking Code'}
                  </ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.codeContainer}>
                <ThemedText style={styles.codeLabel}>Your Tracking Code:</ThemedText>
                <ThemedText style={styles.code}>{generatedCode}</ThemedText>
                <ThemedText style={styles.codeHint}>
                  Share this code via WhatsApp, SMS, or any messaging app
                </ThemedText>
              </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
  shareButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  button: {
    backgroundColor: Colors.light.tint,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  codeContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  code: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
    letterSpacing: 2,
    marginBottom: 8,
  },
  codeHint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  closeButton: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.light.tint,
    fontSize: 15,
  },
});
