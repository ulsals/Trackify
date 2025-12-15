/**
 * Firebase Integration Setup Component
 * Memudahkan setup Firebase credentials dan test koneksi
 */

import { getDefaultApiKey, getDefaultProjectId, isFirebaseConfigured } from '@/config/firebase-helper';
import { useColors } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FirebaseSetupState {
  projectId: string;
  apiKey: string;
  deviceId: string;
  isLoading: boolean;
  testResult: string | null;
  isTesting: boolean;
}

export function FirebaseSetupComponent() {
  const colors = useColors();
  const [state, setState] = useState<FirebaseSetupState>({
    projectId: getDefaultProjectId(),
    apiKey: getDefaultApiKey(),
    deviceId: 'device_' + Math.random().toString(36).substr(2, 9),
    isLoading: false,
    testResult: null,
    isTesting: false,
  });

  // Load saved credentials on mount
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const savedProjectId = await AsyncStorage.getItem('firebase_project_id');
      const savedApiKey = await AsyncStorage.getItem('firebase_api_key');
      const savedDeviceId = await AsyncStorage.getItem('device_id');

      setState((prev) => ({
        ...prev,
        projectId: savedProjectId || prev.projectId,
        apiKey: savedApiKey || prev.apiKey,
        deviceId: savedDeviceId || prev.deviceId,
        isLoading: false,
      }));
    } catch (error) {
      console.warn('Failed to load credentials:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const saveCredentials = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await AsyncStorage.multiSet([
        ['firebase_project_id', state.projectId],
        ['firebase_api_key', state.apiKey],
        ['device_id', state.deviceId],
      ]);

      Alert.alert('Success', 'Firebase credentials saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save credentials: ' + String(error));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const testConnection = async () => {
    setState((prev) => ({ ...prev, isTesting: true, testResult: null }));

    try {
      // Test upload lokasi
      const timestamp = Date.now();
      const testUrl = `https://firestore.googleapis.com/v1/projects/${state.projectId}/databases/(default)/documents/devices/${state.deviceId}/locations/test_${timestamp}?key=${state.apiKey}`;

      const response = await fetch(testUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            latitude: { doubleValue: -6.2088 },
            longitude: { doubleValue: 106.8456 },
            timestamp: { integerValue: String(timestamp) },
            accuracy: { doubleValue: 10 },
          },
        }),
      });

      if (response.ok) {
        // Test fetch
        const fetchUrl = `https://firestore.googleapis.com/v1/projects/${state.projectId}/databases/(default)/documents/devices/${state.deviceId}/locations?key=${state.apiKey}&pageSize=1`;
        const fetchResponse = await fetch(fetchUrl);
        const fetchData = await fetchResponse.json();

        if (fetchResponse.ok) {
          setState((prev) => ({
            ...prev,
            testResult: '✅ Firestore connection successful!',
            isTesting: false,
          }));
          Alert.alert('Success', 'Firestore connection test passed!');
        } else {
          throw new Error('Fetch failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }
    } catch (error) {
      const errorMsg = String(error);
      setState((prev) => ({
        ...prev,
        testResult: '❌ Connection failed: ' + errorMsg,
        isTesting: false,
      }));
      Alert.alert('Connection Failed', errorMsg);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    section: {
      marginBottom: 24,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: colors.text,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: 'monospace',
      fontSize: 12,
    },
    button: {
      backgroundColor: colors.tint,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 8,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    secondaryButton: {
      backgroundColor: colors.border,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 8,
    },
    status: {
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
      backgroundColor: colors.background,
    },
    successText: {
      color: '#10B981',
      fontWeight: 'bold',
    },
    errorText: {
      color: '#EF4444',
      fontWeight: 'bold',
    },
    info: {
      fontSize: 12,
      color: colors.gray,
      marginTop: 8,
      lineHeight: 18,
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Current Configuration */}
      <View style={styles.section}>
        <Text style={styles.title}>📋 Firebase Credentials</Text>

        <Text style={styles.label}>Project ID</Text>
        <TextInput
          style={styles.input}
          value={state.projectId}
          onChangeText={(text) => setState((prev) => ({ ...prev, projectId: text }))}
          placeholder="Enter Project ID"
          editable={!state.isLoading}
        />

        <Text style={styles.label}>API Key</Text>
        <TextInput
          style={styles.input}
          value={state.apiKey}
          onChangeText={(text) => setState((prev) => ({ ...prev, apiKey: text }))}
          placeholder="Enter API Key"
          secureTextEntry
          editable={!state.isLoading}
        />

        <Text style={styles.label}>Device ID</Text>
        <TextInput
          style={styles.input}
          value={state.deviceId}
          onChangeText={(text) => setState((prev) => ({ ...prev, deviceId: text }))}
          placeholder="Enter Device ID"
          editable={!state.isLoading}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={saveCredentials}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>💾 Save Credentials</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.info}>
          💡 Credentials are saved locally in device storage. They won't be sent to any server.
        </Text>
      </View>

      {/* Firebase Status */}
      <View style={styles.section}>
        <Text style={styles.title}>✅ Firebase Status</Text>

        <View style={styles.status}>
          <Text style={isFirebaseConfigured() ? styles.successText : styles.errorText}>
            {isFirebaseConfigured()
              ? '✅ Firebase is properly configured'
              : '⚠️ Firebase credentials need update'}
          </Text>
        </View>

        <Text style={styles.info}>
          {isFirebaseConfigured()
            ? 'Your Firebase credentials are valid and ready to use.'
            : 'Please configure your Firebase credentials in the section above.'}
        </Text>
      </View>

      {/* Connection Test */}
      <View style={styles.section}>
        <Text style={styles.title}>🧪 Test Connection</Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={testConnection}
          disabled={state.isTesting}
        >
          {state.isTesting ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.text }]}>🚀 Test Firestore Connection</Text>
          )}
        </TouchableOpacity>

        {state.testResult && (
          <View style={styles.status}>
            <Text
              style={[
                styles.info,
                state.testResult.startsWith('✅') ? styles.successText : styles.errorText,
              ]}
            >
              {state.testResult}
            </Text>
          </View>
        )}

        <Text style={styles.info}>
          This will upload a test location to Firestore and verify the connection works properly.
        </Text>
      </View>

      {/* Configuration Instructions */}
      <View style={styles.section}>
        <Text style={styles.title}>📚 Configuration Steps</Text>

        <Text style={styles.info}>
          1. Go to Firebase Console (console.firebase.google.com){'\n'}
          2. Select project "Trackify-2025"{'\n'}
          3. Copy Project ID from Project Settings{'\n'}
          4. Copy API Key from Project Settings{'\n'}
          5. Enter both values above{'\n'}
          6. Click "Test Firestore Connection" to verify
        </Text>
      </View>

      {/* Advanced Settings */}
      <View style={styles.section}>
        <Text style={styles.title}>⚙️ Advanced</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#F59E0B' }]}
          onPress={() => {
            setState((prev) => ({
              ...prev,
              deviceId: 'device_' + Math.random().toString(36).substr(2, 9),
            }));
          }}
        >
          <Text style={styles.buttonText}>🔄 Generate New Device ID</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6B7280' }]}
          onPress={async () => {
            try {
              await AsyncStorage.multiRemove([
                'firebase_project_id',
                'firebase_api_key',
                'device_id',
              ]);
              await loadCredentials();
              Alert.alert('Success', 'Credentials reset to defaults');
            } catch (error) {
              Alert.alert('Error', String(error));
            }
          }}
        >
          <Text style={styles.buttonText}>🔄 Reset to Default</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
