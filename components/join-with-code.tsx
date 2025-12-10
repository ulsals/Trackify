import { useState } from 'react';
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { joinWithCode } from '@/services/backend-api-service';

interface JoinWithCodeProps {
  onJoined?: (code: string, deviceName: string) => void;
}

export function JoinWithCode({ onJoined }: JoinWithCodeProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter a tracking code');
      return;
    }

    setLoading(true);
    try {
      const response = await joinWithCode(code.trim().toUpperCase());
      
      Alert.alert(
        'Success!',
        `Now tracking: ${response.deviceName}\n\nYou can see their location on the map.`,
        [{ text: 'OK' }]
      );

      onJoined?.(response.code, response.deviceName);
      handleClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join tracking session');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setCode('');
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Track Someone</ThemedText>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => setModalVisible(true)}
          >
            <ThemedText style={styles.trackButtonText}>Enter Code</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.description}>
          Enter a tracking code to see someone's location
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
              Track Someone's Location
            </ThemedText>

            <TextInput
              placeholder="Enter Code (e.g., TRACK-ABC123)"
              value={code}
              onChangeText={setCode}
              style={styles.input}
              placeholderTextColor={Colors.light.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleJoin}
              disabled={loading}
            >
              <ThemedText style={styles.buttonText}>
                {loading ? 'Joining...' : 'Start Tracking'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <ThemedText style={styles.closeButtonText}>Cancel</ThemedText>
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
  trackButton: {
    backgroundColor: Colors.light.zoneWarning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  trackButtonText: {
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
    backgroundColor: Colors.light.zoneWarning,
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
  closeButton: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.light.tint,
    fontSize: 15,
  },
});
