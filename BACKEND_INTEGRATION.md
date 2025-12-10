# 🎯 Trackify App Backend Integration

App adalah sudah ter-update untuk menggunakan backend API yang secure.

## ✨ Yang Berubah

### UI Changes
- ❌ Removed: Firebase configuration screen (manual API key input)
- ✅ Added: "Share My Location" button → Generate tracking code
- ✅ Added: "Track Someone" button → Enter code to track location
- ✅ Simplified: Map now shows tracked devices via backend

### Architecture Changes
- ❌ Removed: Direct Firestore access from app
- ✅ Added: Backend API service (calls Vercel backend)
- ✅ Added: Location auto-upload to backend (when sharing)
- ✅ Enhanced: Security (app doesn't have Firebase credentials)

### New Components
1. **`components/share-location-button.tsx`**
   - UI for generating tracking codes
   - Shows unique code (TRACK-ABC123)
   - Stores device secret locally

2. **`components/join-with-code.tsx`**
   - UI for entering tracking code
   - Validates code with backend
   - Starts tracking immediately

3. **`services/backend-api-service.ts`**
   - All API calls to backend
   - `createTrackingCode()` - generate code
   - `joinWithCode()` - validate code
   - `updateLocation()` - upload location
   - `getLocationByCode()` - fetch location

### Updated Services
1. **`services/location-tracking.ts`**
   - Changed from Firestore upload to backend upload
   - `setBackendConfig()` instead of `setFirestoreConfig()`
   - Auto-upload location every 5 seconds (if sharing)

2. **`app/(tabs)/index.tsx`**
   - Removed: Firebase settings panel
   - Added: Share location button
   - Added: Join with code button
   - Simplified: Only 2 action buttons for users

---

## 🚀 How to Setup

### Step 1: Deploy Backend to Vercel

See `../trackify-backend/BACKEND_SETUP.md` for detailed instructions.

Quick steps:
1. Get Firebase service account key
2. Deploy backend folder to Vercel: `vercel --prod`
3. Add environment variables to Vercel
4. Get your Vercel domain URL

### Step 2: Update Backend URL in App

File: `services/backend-api-service.ts`

```typescript
// Line 7: Change this
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000'  // Local dev
  : 'https://trackify-backend.vercel.app';  // ← Update to your domain

// To:
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://your-vercel-domain.vercel.app';
```

Get your domain from Vercel dashboard.

### Step 3: Update Firestore Security Rules

See `../trackify-backend/FIRESTORE_RULES.txt`

Rules lock down Firestore to **only backend access** (block clients):

```javascript
match /tracking_sessions/{code} {
  allow read, write: if false;  // Block client access
}
```

Apply in Firebase Console → Firestore → Rules tab.

### Step 4: Rebuild App

```bash
npx expo run:android
```

---

## 💡 How It Works

### Sharing Location

```
1. User taps "Share My Location"
   ↓
2. App calls: POST /api/share/create
   → Backend generates code: "TRACK-ABC123"
   → Backend generates secret: "xxxxx"
   → Backend saves to Firestore
   ↓
3. App shows code to user
   ↓
4. User shares code via WhatsApp/SMS
   ↓
5. App stores secret locally:
   - AsyncStorage: tracking_code = "TRACK-ABC123"
   - AsyncStorage: device_secret = "xxxxx"
   ↓
6. App starts auto-uploading location every 5 seconds:
   POST /api/location/update
   {
     code: "TRACK-ABC123",
     deviceSecret: "xxxxx",
     latitude: -6.2,
     longitude: 106.8,
     accuracy: 10
   }
   → Backend verifies secret
   → Backend saves to Firestore
```

### Tracking Someone

```
1. User taps "Track Someone"
2. User enters code: "TRACK-ABC123"
   ↓
3. App calls: POST /api/share/join
   → Backend finds session by code
   → Backend returns: device name, timestamps
   → Backend validates code not expired/revoked
   ↓
4. App adds to tracked devices list
   ↓
5. User taps "Refresh Locations"
   App calls: GET /api/location?code=TRACK-ABC123
   ↓
6. App shows location on map (orange marker)
   ↓
7. Location updates every 5 seconds (if other device is sharing)
```

---

## 🔐 Security Model

| Layer | Before | Now |
|-------|--------|-----|
| **API Keys** | In app (exposed) | In backend (hidden) |
| **Firestore Access** | Direct from app | Only backend (service account) |
| **Auth** | None | Device secret token |
| **Tracking** | Manual registration | Code-based sharing |

---

## 📲 User Flow

### Device A (Sharer)
```
1. Tap "Share My Location"
2. Enter name: "John's Phone"
3. See code: "TRACK-ABC123"
4. Copy or screenshot code
5. Send via WhatsApp: "Track me with: TRACK-ABC123"
6. Location auto-uploads to server
```

### Device B (Tracker)
```
1. Receive code: "TRACK-ABC123"
2. Tap "Track Someone"
3. Paste/enter: "TRACK-ABC123"
4. See: "Now tracking John's Phone"
5. Tap "Refresh" to see location on map
```

---

## 🐛 Troubleshooting

### "Failed to create tracking code"

**Check:**
1. Backend is deployed to Vercel (check status: green ✅)
2. Backend URL in `backend-api-service.ts` is correct
3. Firebase credentials in Vercel are correct
4. Network connection (WiFi/cellular)

**Debug:**
```bash
# Test backend directly
curl https://your-domain.vercel.app/api/share/create -X POST
```

### "Invalid code" or "Code not found"

**Check:**
1. Code format is exactly: `TRACK-ABC123` (uppercase)
2. Code hasn't expired (24 hours)
3. Code hasn't been revoked
4. Other device is still sharing

### Location won't update

**Check:**
1. Location permission granted (check app settings)
2. Location is enabled (GPS on)
3. Network is connected
4. Device secret is correct (automatically stored)

---

## 🎯 Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Setup Firebase service account
3. ✅ Add environment variables to Vercel
4. ✅ Update Firestore security rules
5. ✅ Update backend URL in app
6. ✅ Rebuild Android app
7. ✅ Test "Share My Location" on Device A
8. ✅ Test "Track Someone" on Device B with code from A
9. ✅ Verify location updates on map

---

## 📚 File Structure

```
Trackify (app)/
├── components/
│   ├── share-location-button.tsx       [NEW]
│   ├── join-with-code.tsx              [NEW]
│   └── ...
├── services/
│   ├── backend-api-service.ts          [NEW]
│   ├── location-tracking.ts            [UPDATED]
│   └── ...
├── app/(tabs)/
│   └── index.tsx                       [UPDATED]
└── ...

trackify-backend/
├── api/
│   ├── share/
│   │   ├── create.ts                   [NEW]
│   │   └── join.ts                     [NEW]
│   └── location/
│       ├── update.ts                   [NEW]
│       └── [code].ts                   [NEW]
├── services/
│   ├── device-service.ts               [NEW]
│   ├── firestore-service.ts            [NEW]
│   └── firebase-admin.ts               [NEW]
├── package.json                         [NEW]
├── vercel.json                          [NEW]
├── BACKEND_SETUP.md                     [NEW]
├── FIRESTORE_RULES.txt                  [NEW]
└── ...
```

---

**Last Updated:** December 10, 2025
