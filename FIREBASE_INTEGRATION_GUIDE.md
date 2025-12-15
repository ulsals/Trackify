# 🔥 PANDUAN INTEGRASI FIREBASE LENGKAP - TRACKIFY 2025

## Status Saat Ini
✅ Firebase Project sudah dibuat: **Trackify-2025**
✅ google-services.json sudah tersedia
✅ Kode integrasi sudah siap

---

## KONFIGURASI FIREBASE YANG WAJIB DILAKUKAN

### 1. ✅ FIRESTORE DATABASE (WAJIB)

**Tujuan:** Menyimpan lokasi GPS dan data device dalam cloud database

**Langkah Setup:**

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **Trackify-2025**
3. Di menu kiri, pilih **Build** → **Firestore Database**
4. Klik **"Create Database"**
5. Pilih **"Start in Test Mode"** (untuk development)
6. Pilih Region: **asia-southeast1 (Singapore)** - Recommended untuk Indonesia
7. Klik **Create**

**Database Structure yang akan digunakan:**
```
firestore/
└─ devices/
   ├─ {deviceId}/
   │  ├─ info/
   │  │  ├─ deviceName: string
   │  │  ├─ owner: string
   │  │  ├─ registeredAt: timestamp
   │  │  └─ lastUpdate: timestamp
   │  └─ locations/
   │     └─ {documentId}/
   │        ├─ latitude: number
   │        ├─ longitude: number
   │        ├─ timestamp: number
   │        ├─ accuracy: number
   │        └─ speed: number
   └─ {deviceId2}/
      └─ ...
```

---

### 2. 🔐 SECURITY RULES (WAJIB)

**Tujuan:** Mengatur izin siapa saja yang boleh membaca/menulis data

**Langkah Setup:**

1. Di Firestore Database → Pilih tab **Rules**
2. Replace semua kode dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Izin untuk collection devices
    match /devices/{deviceId} {
      allow read, write: if request.auth != null;
    }
    
    // Izin untuk subcollection locations
    match /devices/{deviceId}/locations/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Izin untuk subcollection info
    match /devices/{deviceId}/info/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Klik **Publish** untuk menyimpan rules

**Catatan:** 
- Rule di atas memerlukan user terlogin
- Untuk testing, bisa ganti `if true;` (membuka akses untuk siapa saja)

---

### 3. ✅ AUTHENTICATION (OPTIONAL tapi RECOMMENDED)

**Tujuan:** Membuat user system agar setiap device memiliki owner yang jelas

**Langkah Setup:**

1. Di Firebase Console → **Build** → **Authentication**
2. Klik **"Get Started"**
3. Pilih **"Email/Password"**
4. Toggle **"Enable"** → **Save**
5. (Optional) Aktifkan juga **"Anonymous"** untuk quick testing

**Catatan:** Jika mengaktifkan Anonymous, ubah Security Rules menjadi:
```javascript
match /devices/{deviceId} {
  allow read, write: if request.auth != null;
}
```

---

### 4. ✅ CLOUD MESSAGING (Already Configured)

**Status:** ✅ Sudah dikonfigurasi di google-services.json

**Tujuan:** Push notification ke device ketika ada update lokasi

**Fitur yang akan bisa digunakan:**
- Real-time notifications ke mobile devices
- Alert ketika device masuk/keluar geofence

---

### 5. 📊 STORAGE (OPTIONAL untuk Phase 2)

**Tujuan:** Menyimpan gambar/file tambahan

**Setup (untuk nanti):**
1. Firebase Console → **Build** → **Storage**
2. Klik **"Get Started"**
3. Pilih region: **asia-southeast1**
4. Ubah rules ke:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /devices/{deviceId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## KODE YANG SUDAH SIAP

### 1. **firebase-config.ts** ✅
📁 `config/firebase-config.ts`

Menyimpan credentials Firebase:
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

### 2. **firebase-helper.ts** ✅
📁 `config/firebase-helper.ts`

Fungsi helper untuk validasi dan mendapatkan config:
- `getDefaultProjectId()` - Ambil Project ID
- `getDefaultApiKey()` - Ambil API Key
- `isFirebaseConfigured()` - Cek apakah Firebase valid
- `validateFirebaseCredentials()` - Validasi credentials

### 3. **firestore-service.ts** ✅
📁 `services/firestore-service.ts`

Fungsi untuk berkomunikasi dengan Firestore:

**Upload Lokasi:**
```typescript
uploadLocationToFirestore(
  deviceId: string,
  projectId: string,
  location: LocationHistoryPoint,
  apiKey: string
): Promise<boolean>
```

**Fetch Lokasi Terkini:**
```typescript
fetchDeviceLocation(
  deviceId: string,
  projectId: string,
  apiKey: string
): Promise<FirestoreLocation | null>
```

**Fetch History Lokasi:**
```typescript
fetchDeviceLocationHistory(
  deviceId: string,
  projectId: string,
  apiKey: string,
  limit: number = 100
): Promise<FirestoreLocation[]>
```

**Real-time Listening:**
```typescript
startListeningToDeviceLocation(
  deviceId: string,
  projectId: string,
  apiKey: string,
  onUpdate: (location: FirestoreLocation) => void,
  pollIntervalMs: number = 10000
)
```

---

## CARA MENGGUNAKAN DI COMPONENT

### Contoh: Upload Lokasi

```typescript
import { uploadLocationToFirestore } from '@/services/firestore-service';
import { getDefaultProjectId, getDefaultApiKey } from '@/config/firebase-helper';

// Di dalam useEffect atau saat location update
const projectId = getDefaultProjectId();
const apiKey = getDefaultApiKey();

const success = await uploadLocationToFirestore(
  'device_001',
  projectId,
  {
    latitude: -6.2088,
    longitude: 106.8456,
    timestamp: Date.now(),
    accuracy: 10
  },
  apiKey
);

console.log('Upload berhasil:', success);
```

### Contoh: Fetch Lokasi Device

```typescript
import { fetchDeviceLocation } from '@/services/firestore-service';

const location = await fetchDeviceLocation(
  'device_001',
  getDefaultProjectId(),
  getDefaultApiKey()
);

if (location) {
  console.log(`Lokasi device: ${location.latitude}, ${location.longitude}`);
}
```

### Contoh: Listen Real-time

```typescript
import { startListeningToDeviceLocation } from '@/services/firestore-service';

const unsubscribe = startListeningToDeviceLocation(
  'device_001',
  getDefaultProjectId(),
  getDefaultApiKey(),
  (location) => {
    console.log('Lokasi update:', location);
    // Update state atau UI
  },
  5000 // Poll setiap 5 detik
);

// Untuk stop listening:
// unsubscribe();
```

---

## CHECKLIST SETUP FIREBASE

- [ ] 1. Buat Firestore Database di asia-southeast1
- [ ] 2. Set Firestore Security Rules
- [ ] 3. (Optional) Setup Authentication
- [ ] 4. Test upload/fetch dengan API REST
- [ ] 5. Integrate ke app dengan `firestore-service.ts`
- [ ] 6. Monitor di Firebase Console

---

## TESTING LOKASI DI FIREBASE

Setelah setup, test dengan curl command:

```bash
# Upload lokasi test
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

---

## TROUBLESHOOTING

### Error: "Permission denied" saat upload
**Solusi:** 
1. Cek Security Rules sudah di-publish
2. Pastikan user authenticated (jika rules memerlukan auth)
3. Cek Project ID dan API Key sudah benar

### Error: "Project not found"
**Solusi:** Pastikan `projectId` = `trackify-2025-c29e3` di config

### Lokasi tidak ter-upload
**Solusi:**
1. Cek internet connection
2. Cek API Key valid
3. Monitor console log untuk error message

### Upload terlalu sering (quota exceeded)
**Solusi:** `firestore-service.ts` sudah auto-throttle ke 90 detik, no action needed

---

## NEXT STEPS

1. ✅ Setup Firestore Database
2. ✅ Setup Security Rules
3. ✅ Test kode integrasi
4. 📍 Integrate ke location-tracking hook
5. 📍 Integrate ke map display
6. 📍 Setup real-time device sync

---

## INFORMASI PROJECT FIREBASE

```
Project Name: Trackify-2025
Project ID: trackify-2025-c29e3
Project Number: 189142789486
Region: asia-southeast1 (Singapore)

API Key: AIzaSyA9IfSxjvE79QAXlfkn4Jotp_vQtnYonFA
Auth Domain: trackify-2025-c29e3.firebaseapp.com
Storage Bucket: trackify-2025-c29e3.firebasestorage.app
Messaging Sender ID: 189142789486
App ID: 1:189142789486:android:e48c82111ed5453eda257f
```

---

**Created:** 15 Dec 2025 | **Version:** 1.0
