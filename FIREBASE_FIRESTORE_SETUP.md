# 🔥 Firebase Firestore Setup - Trackify GPS Tracking

## ✅ What's Implemented

Aplikasi Anda sudah siap untuk tracking real-time GPS dengan Firebase Firestore:

### Device A (Sharer) - Upload Lokasi
1. Tap "Share My Location" button
2. Enter device name (e.g., "John's iPhone")
3. Get tracking code: `TRACK-ABC123`
4. Share code dengan Device B
5. **Automatic**: Lokasi Device A ter-upload ke Firestore setiap 5 detik

### Device B (Tracker) - Track Device A
1. Tap "Track Someone" button (di `JoinWithCode` component)
2. Enter code: `TRACK-ABC123`
3. Lihat lokasi Device A on map
4. **Real-time**: Map auto-refresh setiap 3 detik

---

## 🔧 Firebase Configuration

### File: `config/firebase-config.ts`

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

**Status**: ✅ Already configured with real credentials

---

## 📊 Firestore Database Structure

```
Firestore Root
└── devices/
    ├── TRACK-ABC123/          (Device A)
    │   └── location
    │       ├── latitude: -6.2103
    │       ├── longitude: 106.7815
    │       ├── timestamp: 1702699200000
    │       └── accuracy: 5.0
    │
    └── TRACK-XYZ789/          (Device B)
        └── location
            ├── latitude: -6.2200
            ├── longitude: 106.7900
            ├── timestamp: 1702699203000
            └── accuracy: 8.0
```

---

## 🔐 Firestore Security Rules

Untuk production, update rules di Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write device locations
    // This is for development/demo only
    match /devices/{deviceCode}/location {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Note**: Rules di atas adalah untuk development/testing. Untuk production, gunakan authentication.

---

## 🚀 Implementation Details

### 1. Location Upload (Device A)

**File**: `services/location-tracking.ts`

Ketika tracking diaktifkan dan tracking code di-set:
- Foreground tracking: Polling setiap 5 detik
- Background tracking: Polling setiap 10 detik
- Upload to Firestore: Langsung ke `/devices/{trackingCode}/location`

```typescript
// Firestore path
/devices/{trackingCode}/location

// Data uploaded
{
  latitude: number,
  longitude: number,
  timestamp: number,
  accuracy: number
}
```

### 2. Location Fetch & Display (Device B)

**File**: `services/firestore-service.ts`

```typescript
// Fetch from Firestore
fetchLocationByCode(deviceCode, projectId, apiKey)

// Poll every 3 seconds (in index.tsx)
useEffect(() => {
  const interval = setInterval(() => {
    handleRefreshTrackedDevices();
  }, 3000);
}, [trackedDevices.length]);
```

### 3. Map Display

**File**: `components/map-card.tsx`

- Uses Leaflet library (webview-based)
- Shows tracked devices as colored markers
- Auto-zoom to fit all devices

---

## 🧪 Testing Checklist

### Setup (One-time)
- [ ] Create 2 Android emulators atau 2 devices
- [ ] Install app on both
- [ ] Enable location permission on both
- [ ] Both devices connected to internet

### Test Flow

**Device A (Sharer)**
```
1. Open app
2. Tap "Share My Location"
3. Enter name: "Device A"
4. Copy code: TRACK-ABC123
5. Tap "Start Background Tracking" (recommended)
   → Location akan ter-upload otomatis
```

**Device B (Tracker)**
```
1. Open app
2. Tap "Track Someone"
3. Enter code: TRACK-ABC123
4. Verify:
   ✓ Code accepted
   ✓ Device A appears in "Tracked Devices" list
   ✓ Latitude/Longitude visible
   ✓ Location appears on map as marker
5. Move Device A
   → Location updates automatically every 3 seconds
```

---

## 🐛 Troubleshooting

### Issue 1: "Code not found or expired"
- **Cause**: Code belum di-generate atau sudah expired (5 menit)
- **Fix**: Device A harus generate code dulu, share ke Device B, Device B input dalam 5 menit

### Issue 2: "Location not updated on map"
- **Cause**: Firestore API key tidak valid, atau location belum ter-upload
- **Debug**:
  1. Check Firebase Console → Firestore → `devices/{code}/location` - ada data?
  2. Check console logs: `✅ Location synced to Firestore`
  3. Verifikasi internet connection kedua device
  4. Check GPS enabled pada Device A

### Issue 3: "Firestore API error: 401"
- **Cause**: API key salah atau tidak memiliki akses Firestore
- **Fix**:
  1. Firebase Console → Project Settings → Copy correct API Key
  2. Update `config/firebase-config.ts`
  3. Ensure Firestore Database sudah created di Firebase Console
  4. Check Firestore Security Rules allow anonymous access

### Issue 4: "Map tidak tampil atau kosong"
- **Cause**: Leaflet library tidak load, atau tidak ada data tracked devices
- **Debug**:
  1. Verifikasi internet connection
  2. Check console logs untuk error di WebView
  3. Ensure map component menerima `trackedDevices` dengan data

---

## 📱 Flow Diagram

```
Device A (Sharer)
├─ Tap "Share My Location"
├─ Generate code (via backend/mock): TRACK-ABC123
├─ Set tracking config: { deviceCode: "TRACK-ABC123" }
├─ Start tracking (foreground/background)
└─ Auto-upload location to Firestore
   └─ /devices/TRACK-ABC123/location
      ├─ latitude, longitude
      ├─ timestamp
      └─ accuracy

Device B (Tracker)
├─ Tap "Track Someone"
├─ Enter code: TRACK-ABC123
├─ Query backend for device info
├─ Add to tracked devices list
├─ Start real-time polling (every 3 sec)
│  └─ Fetch /devices/TRACK-ABC123/location
│     └─ Display on map
└─ Update UI automatically
```

---

## ✨ Key Files

| File | Purpose |
|------|---------|
| `config/firebase-config.ts` | Firebase credentials |
| `services/firestore-service.ts` | Firestore API (upload/fetch) |
| `services/location-tracking.ts` | Background location tracking |
| `app/(tabs)/index.tsx` | Main screen with real-time polling |
| `components/share-location-button.tsx` | Generate tracking code |
| `components/join-with-code.tsx` | Join tracking session |
| `components/map-card.tsx` | Display tracked devices on map |

---

## 🎯 Next Steps

### Immediate (Required)
1. ✅ npm install (sudah selesai)
2. ✅ Firebase integration (sudah di-code)
3. **TODO**: npx expo run:android (build & test)
4. **TODO**: Test on 2 physical devices

### Optimization (Optional)
- Add battery optimization (configurable polling interval)
- Add geofencing alerts
- Add bluetooth tracking for nearby devices
- Implement authentication for security
- Add location history export

---

## 📞 Quick Reference

### Commands

```bash
# Start development
npm start
# or
expo start

# Run on Android
npx expo run:android

# Check logs
npx expo logs

# Rebuild if needed
npm run reset-project
```

### Environment Variables

Currently using `.firebaseConfig` (hardcoded). For production:
1. Move to `.env.local`
2. Load from Firebase Console dynamically
3. Add proper authentication

---

Generated: 2025-12-15
Status: ✅ Ready to test
