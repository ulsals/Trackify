import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getDefaultApiKey, getDefaultProjectId, isFirebaseConfigured } from '@/config/firebase-helper';
import { Colors } from '@/constants/theme';

interface FirebaseSettingsProps {
  onConfigured?: (config: { deviceId: string; projectId: string; apiKey: string }) => void;
  currentConfig?: { deviceId: string; projectId: string; apiKey: string } | null;
}

export function FirebaseSettings({ onConfigured, currentConfig }: FirebaseSettingsProps) {
  const [showForm, setShowForm] = useState(false);
  const [deviceId, setDeviceId] = useState(currentConfig?.deviceId ?? '');
  const [projectId, setProjectId] = useState(currentConfig?.projectId ?? getDefaultProjectId());
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey ?? getDefaultApiKey());

  const handleSave = () => {
    if (!deviceId.trim() || !projectId.trim() || !apiKey.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    
    if (apiKey === 'YOUR_API_KEY_HERE') {
      Alert.alert(
        'API Key Required',
        'Please get your API Key from Firebase Console. See GET_API_KEY.md for instructions.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    onConfigured?.({ deviceId, projectId, apiKey });
    setShowForm(false);
  };

  const configuredInCode = isFirebaseConfigured();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Firebase Firestore
        </ThemedText>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <ThemedText style={styles.action}>{showForm ? 'Cancel' : 'Setup'}</ThemedText>
        </TouchableOpacity>
      </View>

      {currentConfig && !showForm && (
        <View style={styles.status}>
          <ThemedText style={styles.statusText}>✓ Configured</ThemedText>
          <ThemedText style={styles.meta}>Device: {currentConfig.deviceId}</ThemedText>
          <ThemedText style={styles.meta}>Project: {currentConfig.projectId}</ThemedText>
        </View>
      )}

      {showForm && (
        <View style={styles.form}>
          <ThemedText style={styles.formHint}>
            Project ID & API Key from Firebase Console (see GET_API_KEY.md)
          </ThemedText>
          <TextInput
            placeholder="Device ID (unique name for this device)"
            value={deviceId}
            onChangeText={setDeviceId}
            style={styles.input}
            placeholderTextColor={Colors.light.textSecondary}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Firebase Project ID (trackify-2025-c29e3)"
            value={projectId}
            onChangeText={setProjectId}
            style={styles.input}
            placeholderTextColor={Colors.light.textSecondary}
            autoCapitalize="none"
            editable={!configuredInCode}
          />
          <TextInput
            placeholder="Firebase API Key (starts with AIzaSy...)"
            value={apiKey}
            onChangeText={setApiKey}
            style={styles.input}
            placeholderTextColor={Colors.light.textSecondary}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <ThemedText style={styles.buttonText}>Save Configuration</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.hint}>
            Get these values from Firebase Console → Project Settings
          </ThemedText>
        </View>
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
  title: {
    fontSize: 16,
  },
  action: {
    color: Colors.light.tint,
  },
  status: {
    padding: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    color: '#4caf50',
    fontWeight: '600',
  },
  meta: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  form: {
    gap: 8,
  },
  formHint: {
    color: Colors.light.tint,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
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
    fontSize: 14,
  },
  hint: {
    color: Colors.light.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
  },
});
