# 🎯 TRACKIFY - Simple Firebase Direct Implementation

**Konsep:** Setiap device punya kode unik tetap. Device lain input kode untuk track lokasi real-time dari Firebase.

---

## 📊 Arsitektur

```
Firestore:
devices/
├─ local-device/              (Device 1 - My Device)
│  ├─ info/
│  │  ├─ deviceName: "My Phone"
│  │  └─ createdAt: 1702632000000
│  └─ location/               (Current location)
│     ├─ latitude: -6.2088
│     ├─ longitude: 106.8456
│     ├─ timestamp: 1702632000000
│     └─ accuracy: 10
│
└─ device_abc123/             (Device 2 - Remote Device)
   └─ location/
      ├─ latitude: ...
      └─ ...
```

---

## ✅ Setup Checklist

- [x] ✅ firestore-service.ts - Updated untuk device codes
- [x] ✅ use-firestore-sync.ts - Updated untuk device codes
- [x] ✅ device-code-manager.tsx - Komponen UI baru (Show/Input code)
- [ ] ⏳ Update Firestore Rules (set public access)
- [ ] ⏳ Integrate device-code-manager ke index.tsx
- [ ] ⏳ Update location tracking untuk upload via device code
- [ ] ⏳ Test full flow

---

## 🔧 Implementation Steps

### STEP 1: Update Firestore Security Rules

1. Firebase Console → Firestore → Rules tab
2. Replace dengan rules ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Klik **Publish**

---

### STEP 2: Update Location Tracking Hook

Buka [hooks/use-location-and-notification.ts](hooks/use-location-and-notification.ts)

Cari bagian "start tracking" dan tambahkan upload ke Firebase:

```typescript
import { useFirestoreSync } from './use-firestore-sync';

// Di dalam hook...
const { uploadLocation } = useFirestoreSync();

// Setiap lokasi berubah, upload ke Firebase:
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

---

### STEP 3: Add Device Code Manager Component

Sudah dibuat di: `components/device-code-manager.tsx`

Features:
- ✅ Show my device code
- ✅ Input code untuk track device lain
- ✅ Real-time location updates
- ✅ Status tracking

---

### STEP 4: Integrate ke Main Screen

Edit `app/(tabs)/index.tsx`, tambahkan komponen:

```tsx
import { DeviceCodeManager } from '@/components/device-code-manager';

export default function HomeScreen() {
  // ... existing code ...

  return (
    <ScrollView>
      {/* Existing components */}
      
      {/* Add this */}
      <DeviceCodeManager />
      
      {/* Rest of components */}
    </ScrollView>
  );
}
```

---

### STEP 5: Test Full Flow

**Device 1 (Tracker):**
1. Buka app
2. Lihat "My Device Code" (misal: `device_abc123`)
3. App otomatis upload lokasi ke Firebase setiap 5 detik

**Device 2 (Tracking):**
1. Buka app
2. Klik "Track Another Device"
3. Input code: `device_abc123`
4. Klik "Start Tracking"
5. Lihat lokasi Device 1 real-time

---

## 🔄 Data Flow

```
Device 1:
  Location Update
  ↓
  useFirestoreSync() → uploadLocationByCode()
  ↓
  Firestore /devices/{deviceCode}/location
  ↓
  ✅ Updated in real-time

Device 2:
  Input Device Code
  ↓
  useDeviceLocation() → startTracking()
  ↓
  Poll Firestore /devices/{inputCode}/location every 3 seconds
  ↓
  ✅ See location in real-time
```

---

## 📁 Modified Files

| File | Changes |
|------|---------|
| `services/firestore-service.ts` | Device code-based operations |
| `hooks/use-firestore-sync.ts` | Device code management |
| `components/device-code-manager.tsx` | NEW - UI component |

---

## 🎯 How It Works (Simple)

1. **Every device gets a unique code** (auto-generated or custom)
2. **Device uploads location** to `/devices/{myCode}/location`
3. **Other devices input the code** and listen to `/devices/{code}/location`
4. **Real-time polling** every 3 seconds for location updates

---

## 🔒 Security Notes

- Rules set to `if true` for testing/development
- For production: Change to require authentication
- Device codes are unguessable (random strings)

---

## ✅ Success Criteria

When everything is working:
- ✅ Device 1 shows its code
- ✅ Device 1 uploads location every 5 seconds
- ✅ Device 2 can input code
- ✅ Device 2 sees location updates real-time (3 sec polling)
- ✅ No errors in console
- ✅ Firebase console shows devices collection with data

---

**Status:** Ready for testing  
**Last Updated:** 15 Dec 2025
