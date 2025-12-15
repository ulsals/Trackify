# 🔥 INTEGRASI FIREBASE - PENJELASAN LENGKAP

## 📍 APA ITU FIREBASE?

Firebase adalah platform dari Google yang menyediakan **backend-as-a-service**. Artinya, Anda tidak perlu membuat server sendiri karena Google yang menyediakan server untuk menyimpan data, authentication, messaging, dll.

Untuk Trackify, kita menggunakan:
- **Firestore** - Database cloud untuk menyimpan lokasi GPS
- **Cloud Messaging** - Mengirim push notification
- **Authentication** (optional) - Login/signup user

---

## 🎯 STRUKTUR FIREBASE TRACKIFY

```
Firebase Console
└─ Project: Trackify-2025
   ├─ Firestore Database (tempat data disimpan)
   │  └─ Collection: devices/
   │     ├─ Document: device_12345/
   │     │  ├─ Collection: locations/
   │     │  │  ├─ location_1702632000/ { lat, lon, time }
   │     │  │  ├─ location_1702632060/ { lat, lon, time }
   │     │  │  └─ ...
   │     │  └─ Collection: info/ { name, owner, registered }
   │     └─ Document: device_67890/
   │        └─ ...
   ├─ Authentication (login/signup)
   ├─ Cloud Messaging (push notification)
   └─ Storage (file storage)
```

---

## 🔧 APA YANG PERLU DIKONFIGURASI DI FIREBASE?

### 1️⃣ FIRESTORE DATABASE (WAJIB - PALING PENTING)

**Fungsi:** Menyimpan lokasi GPS dari setiap device

**Setup di Firebase Console:**
1. Buka https://console.firebase.google.com
2. Pilih project **Trackify-2025**
3. Menu kiri: **Build** → **Firestore Database**
4. Klik **"Create Database"**
5. Mode: **Test Mode** (untuk development)
6. Region: **asia-southeast1** (Singapore - paling dekat Indonesia)
7. Klik **Create**

**Setelah diaktifkan:**
- Firestore akan membuat database kosong
- Database siap menerima data dari app
- Sudah bisa upload/fetch lokasi

---

### 2️⃣ SECURITY RULES (WAJIB - untuk izin akses)

**Fungsi:** Mengatur siapa yang boleh baca/tulis data

**Setup:**
1. Di Firestore → Tab **Rules**
2. Hapus rule default
3. Paste rule ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{deviceId}/{document=**} {
      allow read, write: if true;  // Open untuk testing
    }
  }
}
```

4. Klik **Publish**

**Penjelasan rule:**
- `match /devices/{deviceId}` = Mengatur akses ke collection devices
- `allow read, write: if true;` = Siapa saja boleh baca/tulis

⚠️ **Catatan:** Rule `if true` membuka akses untuk siapa saja. Untuk production, perlu ganti dengan authentication check.

---

### 3️⃣ AUTHENTICATION (OPTIONAL - untuk production)

**Fungsi:** Membuat sistem login/signup agar setiap user punya account

**Setup (buat nanti saat production):**
1. Firebase Console → **Build** → **Authentication**
2. Klik **"Get Started"**
3. Pilih **Email/Password**
4. Toggle **Enable**
5. Klik **Save**

**Setelah aktif:**
- User bisa login dengan email/password
- Setiap aksi di Firestore bisa dicek siapa pelakunya
- Lebih aman untuk production

**Jika pakai Authentication, ubah rule menjadi:**
```javascript
match /devices/{deviceId}/{document=**} {
  allow read, write: if request.auth != null;  // Harus login
}
```

---

### 4️⃣ CLOUD MESSAGING (SUDAH CONFIGURED)

**Fungsi:** Mengirim push notification ke device

**Status:** ✅ Sudah disetup (ada di google-services.json)

**Bisa digunakan untuk:**
- Alert ketika device masuk/keluar geofence
- Real-time notification lokasi update

---

## 📁 KODE YANG SUDAH SIAP DI PROJECT

### File 1: `config/firebase-config.ts`
Menyimpan credentials Firebase (API Key, Project ID, dll)

```typescript
export const firebaseConfig = {
  apiKey: 'AIzaSyA9IfSxjvE79QAXlfkn4Jotp_vQtnYonFA',
  projectId: 'trackify-2025-c29e3',
  // ... credentials lainnya
};
```

### File 2: `config/firebase-helper.ts`
Helper functions untuk akses credentials:
- `getDefaultProjectId()` - Ambil Project ID
- `isFirebaseConfigured()` - Cek apakah config valid

### File 3: `services/firestore-service.ts`
Fungsi untuk komunikasi ke Firestore:

```typescript
// Upload lokasi
uploadLocationToFirestore(deviceId, projectId, location, apiKey)

// Fetch lokasi terbaru
fetchDeviceLocation(deviceId, projectId, apiKey)

// Fetch history lokasi
fetchDeviceLocationHistory(deviceId, projectId, apiKey)

// Real-time listening
startListeningToDeviceLocation(deviceId, projectId, apiKey, callback)
```

### File 4: `services/firebase-auth-service.ts` (BARU)
Fungsi untuk authentication:

```typescript
// Sign up dengan email
signUpWithEmail(email, password)

// Sign in dengan email
signInWithEmail(email, password)

// Sign in anonymous
signInAnonymously()

// Refresh token
refreshToken(refreshToken)
```

### File 5: `hooks/use-firestore-sync.ts` (BARU)
Custom React hook untuk sync lokasi:

```typescript
const { uploadLocation, startSync, stopSync } = useFirestoreSync();

// Upload lokasi
await uploadLocation(location);

// Mulai sync real-time
startSync(deviceId, onUpdate);
```

### File 6: `services/device-tracking-service.ts` (BARU)
Service untuk manage tracked devices:

```typescript
// Save tracked device
saveTrackedDevice(device)

// Get tracked devices
getTrackedDevices()

// Fetch lokasi device
getTrackedDeviceLocation(deviceId)

// Upload lokasi
uploadMyLocation(deviceId, location)

// Fetch multiple devices
fetchAllTrackedDevicesLocations()

// Add device by code
addTrackedDeviceByCode(code)

// Calculate distance
calculateDistance(lat1, lon1, lat2, lon2)

// Check geofence
isWithinGeofence(lat, lon, centerLat, centerLon, radius)
```

### File 7: `components/firebase-setup-component.tsx` (BARU)
UI component untuk setup Firebase credentials

```typescript
<FirebaseSetupComponent />
```

---

## 🚀 CARA MENGGUNAKAN DI APP

### Contoh 1: Upload Lokasi Saat User Tracking Lokasi

**File:** `hooks/use-location-and-notification.ts`

```typescript
import { useFirestoreSync } from '@/hooks/use-firestore-sync';

export function useLocationAndNotification() {
  const { location } = useLocationUpdates(); // hook existing
  const { uploadLocation } = useFirestoreSync(); // NEW

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

  return { location };
}
```

**Hasilnya:**
- Setiap update lokasi, otomatis ter-upload ke Firestore
- Data tersimpan di cloud dan bisa diakses dari device lain

---

### Contoh 2: Tampilkan Lokasi Device di Map

**File:** `components/map-card.tsx`

```typescript
import { fetchDeviceLocation } from '@/services/firestore-service';
import { getDefaultProjectId, getDefaultApiKey } from '@/config/firebase-helper';

export function MapCard({ trackedDeviceId }) {
  const [deviceLocation, setDeviceLocation] = useState(null);

  useEffect(() => {
    async function syncLocation() {
      const location = await fetchDeviceLocation(
        trackedDeviceId,
        getDefaultProjectId(),
        getDefaultApiKey()
      );
      
      if (location) {
        setDeviceLocation(location);
      }
    }

    // Fetch setiap 5 detik
    const interval = setInterval(syncLocation, 5000);
    syncLocation(); // Fetch immediately

    return () => clearInterval(interval);
  }, [trackedDeviceId]);

  return (
    <MapView>
      {deviceLocation && (
        <Marker
          coordinate={{
            latitude: deviceLocation.latitude,
            longitude: deviceLocation.longitude,
          }}
          title="Tracked Device"
        />
      )}
    </MapView>
  );
}
```

**Hasilnya:**
- Map menampilkan marker lokasi device terbaru
- Update otomatis setiap 5 detik

---

### Contoh 3: Manage Tracked Devices

**File:** `screens/tracked-devices-screen.tsx`

```typescript
import {
  getTrackedDevices,
  addTrackedDeviceByCode,
  removeTrackedDevice,
  fetchAllTrackedDevicesLocations,
} from '@/services/device-tracking-service';

export function TrackedDevicesScreen() {
  const [devices, setDevices] = useState([]);

  // Load devices saat screen mount
  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    const allDevices = await getTrackedDevices();
    // Fetch lokasi terbaru untuk semua device
    const updated = await fetchAllTrackedDevicesLocations();
    setDevices(Array.from(updated.values()));
  }

  async function handleAddDevice(code) {
    const result = await addTrackedDeviceByCode(code);
    if (result.success) {
      await loadDevices();
    }
  }

  return (
    <View>
      <FlatList
        data={devices}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Text>Lat: {item.lastLocation?.latitude}</Text>
            <Text>Lon: {item.lastLocation?.longitude}</Text>
            <Button
              title="Remove"
              onPress={() => removeTrackedDevice(item.deviceId)}
            />
          </View>
        )}
      />
      <Button
        title="Add Device"
        onPress={() => handleAddDevice('device_code')}
      />
    </View>
  );
}
```

---

### Contoh 4: Setup Firebase UI (di Settings)

```typescript
import { FirebaseSetupComponent } from '@/components/firebase-setup-component';

export function SettingsScreen() {
  return (
    <ScrollView>
      <Text>Firebase Configuration</Text>
      <FirebaseSetupComponent />
      {/* komponen lainnya */}
    </ScrollView>
  );
}
```

**Fitur:**
- Input Project ID dan API Key
- Test koneksi ke Firestore
- Save credentials ke local storage

---

## 🧪 TESTING KONEKSI

### Test dengan Curl

```bash
# Upload test location
curl -X PATCH \
  "https://firestore.googleapis.com/v1/projects/trackify-2025-c29e3/databases/(default)/documents/devices/test_device/locations/test_1?key=AIzaSyA9IfSxjvE79QAXlfkn4Jotp_vQtnYonFA" \
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

**Jika berhasil:** Response `200 OK`

**Jika error:**
- `Permission denied` → Security Rules belum di-publish
- `Project not found` → Project ID salah
- `Invalid API key` → API Key salah

---

## 🔐 KEAMANAN

### Saat Development (SEKARANG)
- ✅ Rule `if true` boleh (testing)
- ✅ API Key bisa di-hardcode (development)
- ❌ Jangan test dengan data real

### Saat Production (NANTI)
- ❌ Rule `if true` tidak boleh
- ❌ API Key harus pakai environment variables
- ✅ Harus pakai Authentication
- ✅ Restrict Firestore rules per user
- ✅ Implement Cloud Functions untuk validation

---

## 📊 QUOTA & COST

**Free Tier Firestore:**
- 50,000 read/hari
- 20,000 write/hari
- 20,000 delete/hari
- 1GB storage

**Untuk 1 device tracking (1 update per 2 menit):**
- ~720 write per device per hari
- Bisa support ~27 devices secara bersamaan

**Cost:** Gratis sampai limit, bayar setelah exceed

---

## 📋 STEP-BY-STEP SETUP

### Langkah 1: Aktifkan Firestore (5 menit)
```
1. Buka console.firebase.google.com
2. Pilih Trackify-2025
3. Build → Firestore Database → Create
4. Test Mode → asia-southeast1 → Create
5. Tunggu dibuat
```

### Langkah 2: Set Security Rules (2 menit)
```
1. Firestore → Rules tab
2. Copy rule dari dokumentasi
3. Klik Publish
```

### Langkah 3: Test Koneksi (2 menit)
```
1. Gunakan curl command
2. Check di Firestore console
3. Data muncul? ✅ Berhasil
```

### Langkah 4: Integrate ke App (30 menit)
```
1. Tambah uploadLocation ke location hook
2. Tambah fetchDeviceLocation ke map component
3. Test di app
4. Cek data di Firestore console
```

### Langkah 5: Build APK & Test (1 jam)
```
1. Build APK
2. Install di physical device
3. Test upload lokasi
4. Test fetch lokasi dari device lain
5. Monitor Firestore di console
```

---

## ✅ CHECKLIST SETUP

Sebelum mulai coding:

- [ ] Firestore Database aktif
- [ ] Security Rules published
- [ ] Test upload/fetch dengan curl berhasil
- [ ] Lihat data di Firestore console

Saat coding:

- [ ] uploadLocation ditambah ke location tracking
- [ ] fetchDeviceLocation ditambah ke map
- [ ] FirebaseSetupComponent ditambah ke settings
- [ ] Test upload dari app
- [ ] Test fetch dari app

Sebelum production:

- [ ] Security rules updated (tidak `if true`)
- [ ] Authentication setup
- [ ] Monitoring setup
- [ ] Error handling lengkap
- [ ] Test di real device

---

## 🆘 TROUBLESHOOTING

**Error: Permission denied**
- Cek security rules sudah di-publish
- Cek rules syntax benar

**Error: Project not found**
- Pastikan Project ID = `trackify-2025-c29e3`

**Error: Invalid API key**
- Copy API Key dari Firebase Console Project Settings
- Paste ke firebase-config.ts

**Lokasi tidak ter-upload**
- Check internet connection
- Monitor console log
- Cek Project ID dan API Key

**Quota exceeded**
- Kurangi frequency upload
- Upgrade ke paid plan

---

## 🎓 RINGKASAN

1. **Firebase adalah:** Cloud backend dari Google
2. **Yang kita pakai:** Firestore (database), Cloud Messaging
3. **Yang perlu setup:** Firestore Database + Security Rules
4. **Kode sudah siap:** Upload, fetch, realtime listening, authentication
5. **Cara pakai:** Import function, call saat location update
6. **Testing:** Curl, atau langsung dari app
7. **Keamanan:** Test mode boleh, production perlu auth

---

**Dokumentasi dibuat:** 15 Des 2025
**Status:** Ready untuk implementation
**Next:** Aktifkan Firestore di Firebase Console
