# 🔥 Trackify Firebase Quick Reference

## 📋 Your Firebase Project Info

```
Project Name:    Trackify-2025
Project ID:      trackify-2025-c29e3
Project Number:  189142789486
Region:          asia-southeast1 (recommended)
```

## 🔑 Get API Key (Choose One Method)

### Method 1: Firebase Console (Easiest)
1. Go to: https://console.firebase.google.com
2. Select: **Trackify-2025**
3. Click: ⚙️ Settings → **Project settings**
4. Scroll to: **"Your apps"** section
5. If no Web app exists:
   - Click **</>** Web icon
   - Name: `Trackify Web`
   - Click **Register app**
6. Copy: **`apiKey`** and **`appId`** values

### Method 2: Google Cloud Console
1. Go to: https://console.cloud.google.com
2. Select: **Trackify-2025**
3. Menu → **APIs & Services** → **Credentials**
4. Find: **API Keys** section
5. Copy: Browser/Web key

## ✅ Setup Checklist

- [x] Firebase Project created
- [x] Project ID: trackify-2025-c29e3
- [x] Cloud Messaging API enabled
- [x] google-services.json added
- [x] build.gradle.kts configured
- [ ] **Get API Key** ← DO THIS NOW
- [ ] **Enable Firestore Database**
- [ ] **Set Security Rules**
- [ ] **Update config/firebase-config.ts**

## 🔥 Enable Firestore (5 minutes)

1. Firebase Console → **Build** → **Firestore Database**
2. Click **"Create database"**
3. Select: **"Test mode"**
4. Region: **asia-southeast1**
5. Click **"Enable"**
6. Go to **"Rules"** tab
7. Paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{deviceId}/locations/{locationId} {
      allow read, write: if true;
    }
  }
}
```

8. Click **"Publish"**

## 📝 Update Code

Edit: `config/firebase-config.ts`

```typescript
export const firebaseConfig = {
  apiKey: 'AIzaSy___YOUR_KEY_HERE___',  // ← PASTE YOUR KEY
  authDomain: 'trackify-2025-c29e3.firebaseapp.com',
  projectId: 'trackify-2025-c29e3',  // ✅ Already set
  storageBucket: 'trackify-2025-c29e3.firebasestorage.app',
  messagingSenderId: '189142789486',  // ✅ Already set
  appId: '1:189142789486:web:___YOUR_APP_ID___',  // ← PASTE YOUR APP ID
};
```

## 🚀 Test in App

1. Rebuild: `npx expo run:android`
2. Open app → **Firebase Firestore** section
3. Click **"Setup"**
4. Enter:
   - Device ID: `tracker_phone_1`
   - Project ID: `trackify-2025-c29e3` (pre-filled)
   - API Key: (paste from Firebase Console)
5. Click **"Save Configuration"**
6. Start tracking
7. Wait 90 seconds
8. Check Firebase Console → Firestore → `devices` collection

## 🐛 Common Errors

| Error | Solution |
|-------|----------|
| "API Key not valid" | Check for typos, ensure key is enabled |
| "Permission denied" | Set Firestore rules, wait 1-2 minutes |
| "Network error" | Check internet, firewall settings |
| Location not uploading | Verify permissions granted, check logcat |

## 📞 Debug Commands

```bash
# Check Firebase errors
adb logcat | grep -i firebase

# Check location tracking
adb logcat | grep -i location

# Check Firestore operations
adb logcat | grep -i firestore
```

## 💡 Quick Tips

✅ Use unique Device IDs (e.g., `tracker_mobil_andi`, `phone_office`)  
✅ Project ID is case-sensitive  
✅ API Key starts with `AIzaSy`  
✅ Firestore writes: 90-second interval saves quota  
✅ Free tier: 20k writes/day = ~13 devices uploading  
✅ Manual refresh for tracked devices (saves reads)  

## 🎯 Next Steps After Setup

1. ✅ Configure this device in app
2. 📱 Configure second device (same Project ID & API Key)
3. ➕ Add first device to "Tracked Devices" on second device
4. 🔄 Tap "Refresh Locations" to see first device on map
5. 🗺️ Orange marker = tracked device from Firestore

---

**Need help?** See `GET_API_KEY.md` or `FIRESTORE_SETUP.md` for detailed instructions.
