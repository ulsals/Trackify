# 🎬 STEP-BY-STEP FIREBASE SETUP GUIDE

## LANGKAH DEMI LANGKAH (EZ MODE 🎮)

Ikuti langkah-langkah ini dengan urutan yang persis seperti tertera.

---

## LANGKAH 1: SETUP FIRESTORE (5 MENIT) ⏱️

### 1.1 Buka Firebase Console
```
URL: https://console.firebase.google.com
→ Login dengan akun Google
→ Pilih project "Trackify-2025"
```

### 1.2 Navigasi ke Firestore
```
Di menu kiri:
1. Klik "Build" (ada icon ⚙️)
2. Pilih "Firestore Database"
3. Klik tombol biru "Create Database"
```

### 1.3 Setup Database
**Dialog "Create Database" akan muncul:**

```
Pertanyaan 1: Secure rules for Cloud Firestore
Pilih: Start in test mode

Pertanyaan 2: Location
Dropdown pilih: asia-southeast1 (Singapore)

Lalu: Klik "Create"
```

Tunggu ~1 menit sampai database selesai dibuat.

**Result:** 🎉 Firestore Database aktif!

---

## LANGKAH 2: SET SECURITY RULES (2 MENIT) ⏱️

### 2.1 Buka Rules Tab
```
Di Firestore Database page:
Pilih tab "Rules" (di sebelah tab "Data")
```

### 2.2 Copy-Paste Rules

**HAPUS SEMUA TEXT** yang ada.

**Lalu PASTE rule ini:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{deviceId}/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 2.3 Publish Rules
```
Klik tombol biru "Publish" di atas
Tunggu notifikasi "Rules published successfully"
```

**Result:** 🎉 Security Rules aktif!

---

## LANGKAH 3: TEST KONEKSI (OPTIONAL TAPI PENTING) ⏱️

Buka Terminal/CMD dan copy-paste command ini:

```bash
curl -X PATCH \
  "https://firestore.googleapis.com/v1/projects/trackify-2025-c29e3/databases/(default)/documents/devices/test_device/locations/test_loc1?key=AIzaSyA9IfSxjvE79QAXlfkn4Jotp_vQtnYonFA" \
  -H "Content-Type: application/json" \
  -d "{\"fields\": {\"latitude\": {\"doubleValue\": -6.2088}, \"longitude\": {\"doubleValue\": 106.8456}, \"timestamp\": {\"integerValue\": \"1702632000000\"}}}"
```

**Jika berhasil:**
- Response: `200 OK` atau JSON data
- Buka Firestore console → devices → test_device → locations
- Lihat data baru? ✅ Koneksi berhasil!

---

## LANGKAH 4: INTEGRATE UPLOAD LOKASI (10 MENIT) ⏱️

### 4.1 Buka File
```
File: hooks/use-location-and-notification.ts
```

### 4.2 Find & Replace

**CARI section yang ada `useLocationUpdates()`**

Misalnya kurang lebih seperti ini:
```typescript
export function useLocationAndNotification() {
  const { location } = useLocationUpdates();
  // ... code lainnya
}
```

### 4.3 ADD IMPORT (di paling atas file)

```typescript
import { useFirestoreSync } from '@/hooks/use-firestore-sync';
```

### 4.4 ADD HOOK CALL (di dalam function)

```typescript
export function useLocationAndNotification() {
  const { location } = useLocationUpdates();
  const { uploadLocation } = useFirestoreSync(); // ← ADD THIS
  
  // ... rest of code
}
```

### 4.5 ADD EFFECT (cari useEffect yang existing)

Di dalam component, tambahkan:

```typescript
useEffect(() => {
  if (location) {
    uploadLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: Date.now(),
      accuracy: location.coords.accuracy,
    });
  }
}, [location, uploadLocation]);
```

**Result:** ✅ Upload lokasi sudah terintegrasi!

---

## LANGKAH 5: INTEGRATE FETCH LOKASI (10 MENIT) ⏱️

### 5.1 Buka File
```
File: components/map-card.tsx
```

### 5.2 Add Import (di paling atas)

```typescript
import { fetchDeviceLocation } from '@/services/firestore-service';
import { getDefaultProjectId, getDefaultApiKey } from '@/config/firebase-helper';
```

### 5.3 Find Existing State

Cari `useState` untuk map markers atau location.

Contoh:
```typescript
const [markers, setMarkers] = useState([]);
```

### 5.4 Add New State (jika belum ada)

```typescript
const [deviceLocation, setDeviceLocation] = useState(null);
```

### 5.5 Add Effect untuk Fetch

```typescript
useEffect(() => {
  async function syncLocation() {
    const location = await fetchDeviceLocation(
      'tracked_device_id', // ← Ganti dengan device ID yang di-track
      getDefaultProjectId(),
      getDefaultApiKey()
    );
    
    if (location) {
      setDeviceLocation(location);
    }
  }

  // Fetch immediately
  syncLocation();
  
  // Then fetch setiap 5 detik
  const interval = setInterval(syncLocation, 5000);

  return () => clearInterval(interval);
}, []);
```

### 5.6 Add Marker ke Map

Di map rendering code, tambahkan:

```typescript
{deviceLocation && (
  <Marker
    coordinate={{
      latitude: deviceLocation.latitude,
      longitude: deviceLocation.longitude,
    }}
    title="Tracked Device"
  />
)}
```

**Result:** ✅ Fetch lokasi sudah terintegrasi!

---

## LANGKAH 6: TEST DI APP (10 MENIT) ⏱️

### 6.1 Run App
```
Terminal:
npm start
// or
expo start
```

### 6.2 Open App
```
Tekan 'a' untuk Android
atau 'i' untuk iOS
```

### 6.3 Test Upload
```
1. Trigger location update (move device atau fake location)
2. Buka Firestore Console
3. Lihat di devices/{deviceId}/locations
4. Ada data baru? ✅ UPLOAD BERHASIL
```

### 6.4 Test Fetch
```
1. Buka map screen
2. Cek apakah marker muncul
3. Marker ada? ✅ FETCH BERHASIL
4. Move location dari device lain
5. Marker bergerak? ✅ REAL-TIME SYNC BERHASIL
```

---

## LANGKAH 7: ADD SETTINGS UI (5 MENIT) (OPTIONAL)

### 7.1 Buka Settings Screen
```
File: app/(tabs)/index.tsx
atau file settings lainnya
```

### 7.2 Add Import
```typescript
import { FirebaseSetupComponent } from '@/components/firebase-setup-component';
```

### 7.3 Add Component
```typescript
<Text>Firebase Settings</Text>
<FirebaseSetupComponent />
```

**Result:** ✅ Settings UI untuk Firebase configuration

---

## LANGKAH 8: BUILD APK (30 MENIT) (OPTIONAL)

### 8.1 Run Build
```
Terminal:
npm run android
// or
eas build --platform android
```

### 8.2 Install APK
```
Copy APK ke device
Install dengan: adb install path/to/app.apk
```

### 8.3 Test di Device
```
1. Buka app
2. Test upload lokasi
3. Test fetch lokasi dari device lain
4. Monitor di Firestore console
5. Semua working? ✅ DEPLOY BERHASIL
```

---

## ✅ VERIFICATION CHECKLIST

### Firebase Console
- [ ] Firestore Database created
- [ ] Region: asia-southeast1
- [ ] Security Rules published
- [ ] Test data visible di console

### Code
- [ ] uploadLocation ditambah di tracking hook
- [ ] fetchDeviceLocation ditambah di map
- [ ] FirebaseSetupComponent ditambah (optional)
- [ ] No syntax errors di console

### Testing
- [ ] Upload lokasi berhasil
- [ ] Fetch lokasi berhasil
- [ ] Marker muncul di map
- [ ] Real-time sync working
- [ ] Multiple devices sync working

---

## 🎯 SUMMARY

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Setup Firestore | 5m | ⏳ Do this |
| 2 | Set Rules | 2m | ⏳ Do this |
| 3 | Test Curl | 2m | ⏳ Optional |
| 4 | Integrate Upload | 10m | ⏳ Do this |
| 5 | Integrate Fetch | 10m | ⏳ Do this |
| 6 | Test in App | 10m | ⏳ Do this |
| 7 | Add UI | 5m | ⏳ Optional |
| 8 | Build APK | 30m | ⏳ Do later |
| **TOTAL** | | **~1.5h** | ⏳ |

---

## 🆘 QUICK TROUBLESHOOTING

### "Permission denied" error
```
Solusi:
1. Go to Firestore Rules tab
2. Check rules syntax
3. Click Publish (jangan lupa!)
4. Wait ~30 seconds
5. Try again
```

### No data in Firestore after upload
```
Solusi:
1. Check internet connection
2. Check Project ID di firebase-config.ts
3. Check API Key di firebase-config.ts
4. Open browser console untuk error message
5. Test dengan curl first
```

### Marker tidak muncul di map
```
Solusi:
1. Check Firestore has data
2. Check device ID benar
3. Add console.log(location) untuk debug
4. Wait 5 seconds untuk fetch
5. Check location not null
```

---

## 🎬 START NOW!

**Next action:** Buka Firebase Console → Step 1

Good luck! 🚀

---

**Created:** 15 Dec 2025
**Version:** 1.0 - EZ Mode
**Difficulty:** Easy 🟢
