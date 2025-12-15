# Frontend Firebase Integration Guide - Location Tracking

## 📱 Overview

Frontend Trackify menggunakan **Firestore REST API** untuk upload GPS location data langsung dari mobile app ke Firestore database.

### Alur:
```
Expo App (React Native)
    ↓
Location Permission (Android/iOS)
    ↓
Background Location Tracking
    ↓
Firestore REST API (dengan client API key)
    ↓
Firestore Database
```

---

## 🔑 Configuration

### File: [Trackify/config/firebase-config.ts](../Trackify/config/firebase-config.ts)

```typescript
export const firebaseConfig = {
  apiKey: 'AIzaSyA9IfSxjvE79QAXlfkn4Jotp_vQtnYonFA',
  authDomain: 'trackify-2025-c29e3.firebaseapp.com',
  projectId: 'trackify-2025-c29e3',
  storageBucket: 'trackify-2025-c29e3.firebasestorage.app',
  messagingSenderId: '189142789486',
  appId: '1:189142789486:android:e48c82111ed5453eda257f',
};
```

**Key Points:**
- `apiKey` → Client-side API key (aman untuk di-expose)
- `projectId` → Project ID untuk Firestore
- `appId` → Android app ID dari google-services.json

---

## 📡 Firestore Service

### File: [Trackify/services/firestore-service.ts](../Trackify/services/firestore-service.ts)

**Main Functions:**

#### 1. Upload Location
```typescript
uploadLocationToFirestore(
  deviceId: string,      // Unique device identifier
  projectId: string,     // Firebase project ID
  location: LocationHistoryPoint,  // { latitude, longitude, timestamp, accuracy }
  apiKey: string         // Firebase API key
): Promise<boolean>
```

**How it works:**
- Uses REST API: `POST /databases/{database}/documents/devices/{deviceId}/locations`
- Throttled: Only uploads every 90 seconds max
- Returns `true` if uploaded, `false` if throttled

**Example:**
```typescript
const location = {
  latitude: -6.2088,
  longitude: 106.8456,
  timestamp: Date.now(),
  accuracy: 15,
};

const success = await uploadLocationToFirestore(
  'device-001',
  'trackify-2025-c29e3',
  location,
  'AIzaSyA9IfSxjvE79QAXlfkn4Jotp_vQtnYonFA'
);

console.log(success ? 'Uploaded!' : 'Throttled');
```

#### 2. Fetch Device Location
```typescript
fetchDeviceLocation(
  deviceId: string,
  projectId: string,
  apiKey: string
): Promise<FirestoreLocation | null>
```

**Returns:** Latest location dari device atau null jika tidak ada

---

## 🎯 Integration Points

### 1. Background Location Tracking

**File:** [Trackify/services/location-tracking.ts](../Trackify/services/location-tracking.ts)

Integrate Firebase upload dalam background location handler:

```typescript
import { uploadLocationToFirestore } from '@/services/firestore-service';
import { firebaseConfig } from '@/config/firebase-config';

export async function handleLocationUpdate(
  location: LocationHistoryPoint,
  deviceId: string
) {
  // ... existing location processing ...
  
  // Upload ke Firestore
  try {
    const uploaded = await uploadLocationToFirestore(
      deviceId,
      firebaseConfig.projectId,
      location,
      firebaseConfig.apiKey
    );
    
    if (uploaded) {
      console.log('✅ Location synced to Firestore');
      // Optional: Save to local DB atau notify user
    } else {
      console.log('⏳ Upload throttled (< 90 seconds since last)');
    }
  } catch (error) {
    console.error('Firestore upload error:', error);
    // Continue tracking locally, will retry next time
  }
}
```

### 2. Device Registration

**File:** [Trackify/components/device-registration-form.tsx](../Trackify/components/device-registration-form.tsx)

```typescript
import { firebaseConfig } from '@/config/firebase-config';

export function DeviceRegistrationForm() {
  const handleRegister = async (deviceId: string, deviceName: string) => {
    // 1. Register locally
    await registerDevice(deviceId, deviceName);
    
    // 2. Create device document in Firestore
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/devices/${deviceId}/info`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            name: { stringValue: deviceName },
            createdAt: { timestampValue: new Date().toISOString() },
            deviceId: { stringValue: deviceId }
          }
        }),
        params: { key: firebaseConfig.apiKey }
      });
      
      if (response.ok) {
        console.log('✅ Device registered in Firestore');
      }
    } catch (error) {
      console.error('Failed to register device in Firestore:', error);
      // Continue with local registration even if Firestore fails
    }
  };
  
  return (
    // ... form JSX ...
  );
}
```

### 3. Location History Display

**File:** [Trackify/components/location-history-panel.tsx](../Trackify/components/location-history-panel.tsx)

```typescript
import { fetchDeviceLocation } from '@/services/firestore-service';
import { firebaseConfig } from '@/config/firebase-config';

export function LocationHistoryPanel({ deviceId }: { deviceId: string }) {
  const [location, setLocation] = useState<FirestoreLocation | null>(null);
  
  const refreshLocation = async () => {
    try {
      const latest = await fetchDeviceLocation(
        deviceId,
        firebaseConfig.projectId,
        firebaseConfig.apiKey
      );
      
      setLocation(latest);
    } catch (error) {
      console.error('Failed to fetch location:', error);
    }
  };
  
  return (
    <View>
      {location && (
        <Text>
          Last seen: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      )}
      <Button title="Refresh" onPress={refreshLocation} />
    </View>
  );
}
```

---

## 📊 Data Structure

### Device Document

```firestore
devices/{deviceId}/info
├── name: string (device name)
├── createdAt: timestamp
├── lastSeen: timestamp
├── userId: string (optional)
└── isActive: boolean
```

### Location History

```firestore
devices/{deviceId}/locations/{timestamp}
├── latitude: number
├── longitude: number
├── timestamp: number (milliseconds since epoch)
├── accuracy: number (meters)
└── speed: number (m/s, optional)
```

**Example in Firestore:**
```
devices/
  device-001/
    info/
      name: "Phone John"
      createdAt: 2025-12-15T10:00:00Z
    locations/
      location_1734259200000/
        latitude: -6.2088
        longitude: 106.8456
        timestamp: 1734259200000
        accuracy: 15
      location_1734259290000/
        latitude: -6.2089
        longitude: 106.8457
        timestamp: 1734259290000
        accuracy: 12
```

---

## 🔐 Security & Permissions

### Android Permissions

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<!-- Background location -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- For background tasks -->
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

### Request Permissions at Runtime

```typescript
import * as Location from 'expo-location';

export async function requestLocationPermissions() {
  const { status: foreground } = 
    await Location.requestForegroundPermissionsAsync();
  
  if (foreground !== 'granted') {
    console.warn('Foreground location permission denied');
    return false;
  }
  
  const { status: background } = 
    await Location.requestBackgroundPermissionsAsync();
  
  if (background !== 'granted') {
    console.warn('Background location permission denied');
    return false;
  }
  
  return true;
}
```

### Firestore Security Rules

**Rules untuk client API:**

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Devices - require authentication
    match /devices/{deviceId} {
      allow create, read, update: if 
        request.auth != null &&
        request.auth.uid == resource.data.userId;
      
      // Public locations - allow read from anyone with API key
      match /locations/{document=**} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // Geofences
    match /geofences/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note:** Untuk development/testing, Anda bisa use test mode (allow all). Untuk production, update rules dengan proper authentication.

---

## 🐛 Debugging

### Enable Detailed Logging

```typescript
// In firebase-service.ts
const DEBUG = true;

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[Firestore] ${message}`, data || '');
  }
}

export async function uploadLocationToFirestore(...) {
  debugLog('Uploading location', { deviceId, location });
  
  try {
    const response = await fetch(url, { ... });
    debugLog('Upload response', { status: response.status });
    // ...
  } catch (error) {
    debugLog('Upload error', error);
  }
}
```

### Check Network Activity

```typescript
// Monitor requests
fetch(url, options)
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response data:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Firestore Console

1. Buka Firestore Console
2. Tab **Data** → View collections
3. Tab **Logs** → View recent activity
4. Filter by deviceId atau timestamp

---

## ⚡ Performance Tips

### 1. Throttle Uploads
- Current: 90 seconds minimum between uploads
- Adjust if needed: Change `UPLOAD_INTERVAL_MS` in firestore-service.ts

```typescript
const UPLOAD_INTERVAL_MS = 90000; // 1.5 minutes
```

### 2. Batch Operations
```typescript
// Instead of multiple uploads
const batch = db.batch();

locations.forEach(location => {
  batch.set(docRef, location);
});

await batch.commit();
```

### 3. Cache Locally
- Store location locally first
- Sync ke Firestore when connectivity available

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function cacheLocation(location: LocationHistoryPoint) {
  const cached = await AsyncStorage.getItem('cached_locations');
  const list = cached ? JSON.parse(cached) : [];
  list.push(location);
  await AsyncStorage.setItem('cached_locations', JSON.stringify(list));
}
```

---

## 🔗 Related Files

- [Trackify/config/firebase-config.ts](../Trackify/config/firebase-config.ts)
- [Trackify/services/firestore-service.ts](../Trackify/services/firestore-service.ts)
- [Trackify/services/location-tracking.ts](../Trackify/services/location-tracking.ts)
- [FIREBASE_INTEGRATION_GUIDE.md](../FIREBASE_INTEGRATION_GUIDE.md)

---

**Last Updated:** December 15, 2025
