# Firebase API Key Setup - Trackify 2025

## ✅ Yang Sudah Dikonfigurasi

- ✅ Project Name: **Trackify-2025**
- ✅ Project ID: **trackify-2025-c29e3**
- ✅ Project Number: **189142789486**
- ✅ Cloud Messaging API: **Enabled**
- ✅ google-services.json: **Added**
- ✅ build.gradle.kts: **Configured**

---

## 🔑 Cara Mendapatkan API Key

### Metode 1: Firebase Console (Web)

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project **"Trackify-2025"**
3. Klik icon **⚙️ (Settings)** di sidebar kiri → **Project settings**
4. Scroll ke bawah ke section **"Your apps"**
5. Jika belum ada Web App:
   - Klik icon **</>** (Web platform)
   - Beri nama: `Trackify Web`
   - **JANGAN** centang "Firebase Hosting"
   - Klik **"Register app"**
6. Akan muncul konfigurasi seperti ini:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",  // ← Copy ini!
  authDomain: "trackify-2025-c29e3.firebaseapp.com",
  projectId: "trackify-2025-c29e3",
  storageBucket: "trackify-2025-c29e3.firebasestorage.app",
  messagingSenderId: "189142789486",
  appId: "1:189142789486:web:xxxxx"  // ← Copy ini juga!
};
```

7. **Copy nilai `apiKey` dan `appId`**

### Metode 2: Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Pilih project **"Trackify-2025"**
3. Sidebar → **APIs & Services** → **Credentials**
4. Lihat di bagian **"API Keys"**
5. Klik nama API key (biasanya "Browser key" atau "Web key")
6. Copy API key yang ditampilkan

---

## 📝 Update Config File

Setelah dapat API Key, buka file:
```
config/firebase-config.ts
```

Update baris ini:
```typescript
apiKey: 'YOUR_API_KEY_HERE',  // ← Ganti dengan API Key Anda
```

Menjadi:
```typescript
apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX',  // API Key dari Firebase
```

Dan update appId:
```typescript
appId: '1:189142789486:web:YOUR_APP_ID',  // ← Ganti dengan App ID Anda
```

---

## 🔥 Enable Firestore Database

1. Di Firebase Console → **Build** → **Firestore Database**
2. Klik **"Create database"**
3. Pilih **"Start in test mode"** (untuk development)
4. Pilih region: **asia-southeast1** (Singapore - terdekat untuk Indonesia)
5. Klik **"Enable"**

### Set Security Rules

Setelah Firestore dibuat, klik tab **"Rules"** dan paste ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to device locations for testing
    match /devices/{deviceId}/locations/{locationId} {
      allow read, write: if true;
    }
  }
}
```

Klik **"Publish"**

⚠️ **PENTING:** Rules ini terbuka untuk testing. Untuk production, gunakan Firebase Authentication!

---

## ✅ Verifikasi Setup

1. Rebuild Android app:
```bash
npx expo run:android
```

2. Di app, buka **"Firebase Firestore"** section
3. Klik **"Setup"**
4. Isi:
   - **Device ID:** `tracker_test_001` (atau nama unik lainnya)
   - **Firebase Project ID:** `trackify-2025-c29e3`
   - **Firebase API Key:** (API Key yang sudah didapat)
5. Klik **"Save Configuration"**

6. Start location tracking
7. Tunggu 90 detik
8. Cek di Firebase Console → Firestore → Documents
9. Seharusnya ada collection baru: `devices` → `tracker_test_001` → `locations`

---

## 🐛 Troubleshooting

### Error: "API Key not valid"
- Pastikan API Key sudah di-enable untuk Cloud Firestore
- Cek restrictions di Google Cloud Console → Credentials
- Pastikan tidak ada typo saat copy-paste

### Error: "Permission denied"
- Cek Firestore Security Rules sudah di-publish
- Pastikan rules allow read/write
- Tunggu 1-2 menit setelah publish rules

### Firestore Database tidak muncul di console
- Refresh browser
- Pastikan Firestore sudah di-enable (bukan Realtime Database)
- Cek billing account (meski free tier)

---

## 📞 Need Help?

Jika masih ada error, share screenshot error message atau logcat output:
```bash
adb logcat | grep -i firebase
```

---

**Last Updated:** December 10, 2025
