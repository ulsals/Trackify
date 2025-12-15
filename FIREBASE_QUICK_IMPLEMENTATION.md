# 🚀 FIREBASE INTEGRATION - QUICK START IMPLEMENTATION

## File yang Sudah Siap ✅

1. **config/firebase-config.ts** - Konfigurasi Firebase
2. **config/firebase-helper.ts** - Helper functions
3. **services/firestore-service.ts** - Firestore operations
4. **services/firebase-auth-service.ts** - Authentication (NEW)
5. **hooks/use-firestore-sync.ts** - Custom hook untuk sync (NEW)
6. **components/firebase-setup-component.tsx** - UI setup (NEW)

---

## LANGKAH 1: Setup Firestore di Firebase Console

### Buka Firebase Console
1. Kunjungi https://console.firebase.google.com/
2. Pilih project **Trackify-2025**

### Buat Firestore Database
```
Build → Firestore Database → Create Database
- Mode: Test Mode (untuk development)
- Region: asia-southeast1 (Singapore)
→ Klik Create
```

### Set Security Rules
Pergi ke tab **Rules** dan paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{deviceId}/{document=**} {
      allow read, write: if true;  // Open for testing
    }
  }
}
```

Klik **Publish**.

**Catatan:** Untuk production, ganti `if true` dengan authentication check.

---

## LANGKAH 2: Setup Authentication (Optional)

Kalau mau authentication:

```
Build → Authentication → Get Started
- Pilih Email/Password
- Enable
- (Optional) Juga enable Anonymous untuk testing
```

---

## LANGKAH 3: Test Koneksi

Gunakan curl atau Postman:

```bash
curl -X PATCH \
  "https://firestore.googleapis.com/v1/projects/trackify-2025-c29e3/databases/(default)/documents/devices/test_device/locations/test_loc1?key=AIzaSyA9IfSxjvE79QAXlfkn4Jotp_vQtnYonFA" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "latitude": {"doubleValue": -6.2088},
      "longitude": {"doubleValue": 106.8456},
      "timestamp": {"integerValue": "1702632000000"},
      "accuracy": {"doubleValue": 10}
    }
  }'
```

Kalau berhasil, response: `200 OK`

---

## LANGKAH 4: Implementasi di App

### 4.1 Upload Lokasi (Most Important)

Di file yang menangani location tracking:

```typescript
import { useFirestoreSync } from '@/hooks/use-firestore-sync';
import { useLocationAndNotification } from '@/hooks/use-location-and-notification';

export function LocationTrackingScreen() {
  const { location } = useLocationAndNotification();
  const { uploadLocation, isUploading } = useFirestoreSync();

  // Upload ke Firestore setiap kali lokasi berubah
  useEffect(() => {
    if (location) {
      uploadLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
        accuracy: location.coords.accuracy,
      });
    }
  }, [location]);

  return (
    <View>
      <Text>Uploading: {isUploading ? 'Yes' : 'No'}</Text>
      <Text>Location: {location?.coords.latitude}, {location?.coords.longitude}</Text>
    </View>
  );
}
```

### 4.2 Fetch Lokasi Device

```typescript
import { fetchDeviceLocation } from '@/services/firestore-service';
import { getDefaultProjectId, getDefaultApiKey } from '@/config/firebase-helper';

async function getDeviceLocation(deviceId: string) {
  const location = await fetchDeviceLocation(
    deviceId,
    getDefaultProjectId(),
    getDefaultApiKey()
  );
  
  if (location) {
    console.log(`Device di: ${location.latitude}, ${location.longitude}`);
    return location;
  }
}
```

### 4.3 Real-time Listening

```typescript
import { startListeningToDeviceLocation } from '@/services/firestore-service';

function MapComponent() {
  useEffect(() => {
    const unsubscribe = startListeningToDeviceLocation(
      'tracked_device_id',
      getDefaultProjectId(),
      getDefaultApiKey(),
      (location) => {
        // Update map pin saat lokasi berubah
        setDeviceLocation(location);
      },
      5000 // Check setiap 5 detik
    );

    return unsubscribe;
  }, []);

  return <Map markers={[deviceLocation]} />;
}
```

### 4.4 Firebase Setup UI

Tambah ke settings screen:

```typescript
import { FirebaseSetupComponent } from '@/components/firebase-setup-component';

export function SettingsScreen() {
  return (
    <View>
      <Text>Firebase Configuration</Text>
      <FirebaseSetupComponent />
    </View>
  );
}
```

---

## LANGKAH 5: Android Setup (for APK)

Edit `android/app/build.gradle`:

```gradle
dependencies {
    // Firebase
    implementation 'com.google.firebase:firebase-core:32.2.0'
    implementation 'com.google.firebase:firebase-firestore:24.9.0'
    implementation 'com.google.firebase:firebase-messaging:23.2.1'
}
```

Edit `android/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

---

## STRUKTUR DATA DI FIRESTORE

Setelah implement, data akan tersimpan seperti ini:

```
firestore/
└─ devices/
   └─ device_12345/
      ├─ info/
      │  ├─ deviceName: "My Phone"
      │  ├─ owner: "john@example.com"
      │  └─ registeredAt: 1702632000000
      └─ locations/
         ├─ location_1702632000000/
         │  ├─ latitude: -6.2088
         │  ├─ longitude: 106.8456
         │  ├─ timestamp: 1702632000000
         │  └─ accuracy: 10
         ├─ location_1702632060000/
         │  └─ ...
         └─ ...
```

---

## QUOTA & LIMITS

**Free Tier Firebase:**
- 50,000 read/write per hari
- 20,000 delete per hari
- Storage 1GB

**Untuk tracking device dengan 1 location per 2 menit:**
- 720 write per device per hari
- Bisa support ~69 devices

---

## TROUBLESHOOTING

### ❌ "Permission denied" error

**Penyebab:** Security rules belum di-publish
**Solusi:**
1. Cek di Firestore → Rules
2. Pastikan rules sudah benar
3. Klik Publish

### ❌ "Project not found" error

**Penyebab:** Project ID salah
**Solusi:**
1. Pastikan Project ID = `trackify-2025-c29e3`
2. Atau cek di Firebase Console → Project Settings

### ❌ "Invalid API key" error

**Penyebab:** API key salah atau expired
**Solusi:**
1. Buka Firebase Console → Project Settings
2. Copy API key yang benar
3. Paste di config file

### ❌ Lokasi tidak ter-upload

**Debug:**
```typescript
console.log('Project ID:', getDefaultProjectId());
console.log('API Key:', getDefaultApiKey());
console.log('Device ID:', deviceId);

const result = await uploadLocationToFirestore(...);
console.log('Upload result:', result);
```

---

## NEXT STEPS

1. ✅ Setup Firestore Database
2. ✅ Setup Security Rules
3. ✅ Test koneksi
4. ➡️ **Integrate upload ke location tracking hook**
5. ➡️ **Integrate fetch ke map display**
6. ➡️ **Setup real-time device sync**
7. ➡️ **Test di APK release**

---

## TIPS & TRICKS

### Optimize Upload Frequency

Di `firestore-service.ts`, ubah `UPLOAD_INTERVAL_MS`:

```typescript
const UPLOAD_INTERVAL_MS = 30000; // Upload setiap 30 detik
// Semakin kecil = lebih real-time tapi lebih banyak quota dipakai
```

### Batch Upload untuk Offline Mode

```typescript
const offlineLocations = await AsyncStorage.getItem('pending_locations');
if (offlineLocations) {
  const locations = JSON.parse(offlineLocations);
  for (const loc of locations) {
    await uploadLocationToFirestore(...);
  }
}
```

### Monitor Firestore di Console

1. Buka Firebase Console
2. Firestore Database → collections/devices/...
3. Lihat realtime data yang ter-upload

---

## CHECKLIST LENGKAP

- [ ] Firestore Database created di asia-southeast1
- [ ] Security Rules di-set dan di-publish
- [ ] API Key sudah benar di firebase-config.ts
- [ ] Test upload via curl berhasil
- [ ] Component firebase-setup-component.tsx ditambah ke settings
- [ ] uploadLocation dipanggil di location tracking hook
- [ ] Test upload dari app
- [ ] fetchDeviceLocation ditambah di map screen
- [ ] Test fetch lokasi dari app
- [ ] Android build gradle sudah update
- [ ] APK release sudah test

---

**Updated:** 15 Dec 2025
