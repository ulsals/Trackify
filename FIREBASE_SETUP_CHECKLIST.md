# 📋 FIREBASE SETUP CHECKLIST - TRACKIFY 2025

## ✅ YANG SUDAH SELESAI

### Firebase Project
- [x] Firebase project "Trackify-2025" dibuat
- [x] Project ID: `trackify-2025-c29e3`
- [x] Region: Global (Cloud Messaging)
- [x] google-services.json tersedia

### Credentials
- [x] API Key: `AIzaSyA9IfSxjvE79QAXlfkn4Jotp_vQtnYonFA`
- [x] Auth Domain: `trackify-2025-c29e3.firebaseapp.com`
- [x] Storage Bucket: `trackify-2025-c29e3.firebasestorage.app`
- [x] Messaging Sender ID: `189142789486`

### Code & Configuration
- [x] firebase-config.ts - Credentials config
- [x] firebase-helper.ts - Helper functions
- [x] firestore-service.ts - Database operations
- [x] firebase-auth-service.ts - Authentication (NEW)
- [x] use-firestore-sync.ts - Custom hook (NEW)
- [x] firebase-setup-component.tsx - UI setup (NEW)

---

## 🔴 YANG HARUS DILAKUKAN (CRITICAL)

### Di Firebase Console

- [ ] **1. Aktifkan Firestore Database**
  ```
  https://console.firebase.google.com
  → Pilih Trackify-2025
  → Build → Firestore Database
  → Click Create Database
  → Test Mode
  → Region: asia-southeast1
  → Create
  ```

- [ ] **2. Set Security Rules**
  ```
  Firestore → Rules tab
  Paste rule yang ada di FIREBASE_INTEGRATION_GUIDE.md
  Click Publish
  ```

- [ ] **3. Test Koneksi**
  ```
  Gunakan curl atau Postman
  Test upload/fetch lokasi
  Cek di Firestore console apakah data muncul
  ```

### Di Project

- [ ] **4. Install Firebase packages (jika ada yang missing)**
  ```
  npm install firebase
  ```

- [ ] **5. Update android/app/build.gradle dengan Firebase dependencies**
  ```
  implementation 'com.google.firebase:firebase-firestore:24.9.0'
  implementation 'com.google.firebase:firebase-messaging:23.2.1'
  ```

- [ ] **6. Integrate uploadLocation ke Location Tracking Hook**
  ```typescript
  // Di hooks/use-location-and-notification.ts
  import { useFirestoreSync } from '@/hooks/use-firestore-sync';
  
  const { uploadLocation } = useFirestoreSync();
  
  useEffect(() => {
    if (location) {
      uploadLocation({...});
    }
  }, [location]);
  ```

- [ ] **7. Test upload dari app**
  ```
  Run app
  Buat lokasi update
  Cek di Firestore console apakah data ter-upload
  ```

---

## 📱 INTEGRATION POINTS

### Location Tracking Hook
File: `hooks/use-location-and-notification.ts`

```typescript
// Add this to existing hook
import { useFirestoreSync } from '@/hooks/use-firestore-sync';

export function useLocationAndNotification() {
  // ... existing code ...
  
  const { uploadLocation } = useFirestoreSync();

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
  
  // ... return ...
}
```

### Map Display Component
File: `components/map-card.tsx`

```typescript
// Add to existing component
import { fetchDeviceLocation } from '@/services/firestore-service';
import { getDefaultProjectId, getDefaultApiKey } from '@/config/firebase-helper';

useEffect(() => {
  async function syncTrackedDevices() {
    for (const deviceId of trackedDeviceIds) {
      const location = await fetchDeviceLocation(
        deviceId,
        getDefaultProjectId(),
        getDefaultApiKey()
      );
      
      if (location) {
        // Update marker di map
        updateMarker(deviceId, {
          latitude: location.latitude,
          longitude: location.longitude
        });
      }
    }
  }
  
  const interval = setInterval(syncTrackedDevices, 5000);
  return () => clearInterval(interval);
}, []);
```

### Settings/Firebase Setup Screen
File: `app/(tabs)/settings.tsx` atau screen baru

```typescript
import { FirebaseSetupComponent } from '@/components/firebase-setup-component';

export default function SettingsScreen() {
  return (
    <View>
      <Text>Firebase Configuration</Text>
      <FirebaseSetupComponent />
    </View>
  );
}
```

---

## 🧪 TESTING CHECKLIST

### Unit Testing
- [ ] Test firebase-helper functions
- [ ] Test firestore-service dengan mock data
- [ ] Test firebase-auth-service login/signup

### Integration Testing
- [ ] Upload lokasi berhasil ke Firestore
- [ ] Fetch lokasi dari Firestore berhasil
- [ ] Real-time listening update location correctly
- [ ] Offline mode + cache handling

### E2E Testing
- [ ] Register device baru
- [ ] Upload lokasi dari app
- [ ] View lokasi di map
- [ ] Multiple devices sync
- [ ] Test dengan network disconnect/reconnect

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All Firestore rules published
- [ ] API Keys tidak hardcoded (use config files)
- [ ] No console.log dengan sensitive data
- [ ] Error handling untuk network failures
- [ ] Offline persistence implemented

### APK Build
- [ ] google-services.json included
- [ ] Firebase dependencies included
- [ ] android/app/build.gradle updated
- [ ] Build without errors
- [ ] Signed APK created

### Post-Deployment
- [ ] Test APK di physical device
- [ ] Test location upload
- [ ] Monitor Firestore quota usage
- [ ] Check Firebase logs untuk errors

---

## 📊 FIRESTORE QUOTA MONITORING

Cek di: `Firebase Console → Firestore → Usage`

**Current Plan:** Free Tier

**Daily Limits:**
- Read: 50,000
- Write: 20,000
- Delete: 20,000
- Storage: 1GB

**Untuk Trackify:**
- 1 device: ~720 writes/day (1 update setiap 2 menit)
- 10 devices: ~7,200 writes/day
- Max devices: ~27 devices (safely under 20k limit)

---

## 🔒 SECURITY NOTES

### Current Setup
- ⚠️ Rules set to `if true` = OPEN ACCESS
- ⚠️ API Key visible di client
- ⚠️ Not suitable for production

### Production Setup (Later)
- [ ] Implement Firebase Authentication
- [ ] Use ID tokens instead of API keys
- [ ] Implement proper Security Rules
- [ ] Use Cloud Functions for validation
- [ ] Enable Cloud Audit Logs

### For Now (Development)
- Use Test Mode rules
- Restrict Firestore to internal network only
- Never push to public app stores
- Change rules sebelum production

---

## 📞 QUICK SUPPORT

### Firestore Error Codes
- `PERMISSION_DENIED` → Security rules issue
- `NOT_FOUND` → Wrong project ID or database
- `INVALID_ARGUMENT` → Wrong field types
- `UNAUTHENTICATED` → Need authentication

### Common Solutions
1. Check Firebase Console untuk error logs
2. Verify Project ID dan API Key
3. Test dengan curl terlebih dahulu
4. Check network connectivity
5. Clear cache dan rebuild app

---

## 📝 PROGRESS TRACKING

### Phase 1: Setup (IN PROGRESS)
- [x] Firebase project created
- [x] Code prepared
- [ ] Firestore database enabled
- [ ] Security rules set
- [ ] Connection test passed

### Phase 2: Integration
- [ ] Location upload integrated
- [ ] Location fetch integrated
- [ ] Real-time sync working
- [ ] App tested on device

### Phase 3: Production
- [ ] Security rules updated
- [ ] Authentication implemented
- [ ] Monitoring setup
- [ ] Deploy to app store

---

## 📚 REFERENCE LINKS

- Firebase Console: https://console.firebase.google.com/
- Firestore Documentation: https://firebase.google.com/docs/firestore
- REST API: https://firebase.google.com/docs/firestore/use-rest-api
- Security Rules: https://firebase.google.com/docs/rules

---

## 💬 SUMMARY

**Status:** Ready for Firestore setup
**Next Action:** Activate Firestore database in Firebase Console
**Time Estimate:** 10 minutes for console setup + 1 hour for integration
**Help:** Check FIREBASE_INTEGRATION_GUIDE.md untuk detail lengkap

---

**Last Updated:** 15 Dec 2025
**Version:** 1.0
