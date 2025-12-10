# Firestore GPS Tracking Setup Guide

## Gambaran Sistem

Aplikasi Trackify sekarang mendukung **multi-device GPS tracking** menggunakan Firebase Firestore. Device dapat mengirim lokasi GPS ke cloud dan device lain dapat melacak lokasi tersebut secara real-time.

### Cara Kerja:
1. **Device Pengirim** → Upload lokasi ke Firestore setiap 90 detik
2. **Firestore** → Menyimpan lokasi dengan timestamp
3. **Device Penerima** → Fetch dan tampilkan lokasi di peta

---

## Setup Firebase Project

### 1. Buat Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik **"Add Project"** atau gunakan project yang sudah ada
3. Ikuti wizard setup (Analytics optional)

### 2. Enable Firestore Database

1. Di Firebase Console, pilih project Anda
2. Klik **"Build"** → **"Firestore Database"**
3. Klik **"Create database"**
4. Pilih mode:
   - **Test mode** (untuk development) - data terbuka 30 hari
   - **Production mode** (untuk production) - perlu custom rules

### 3. Set Firestore Security Rules

Di tab **"Rules"**, gunakan rules berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to device locations
    match /devices/{deviceId}/locations/{locationId} {
      allow read, write: if true;  // Open for testing
      // For production, add proper authentication:
      // allow read, write: if request.auth != null;
    }
  }
}
```

**PENTING:** Rules di atas terbuka untuk testing. Untuk production, implementasikan Firebase Authentication!

### 4. Dapatkan Firebase Credentials

1. Di Firebase Console → **"Project Settings"** (⚙️ icon)
2. Scroll ke bagian **"Your apps"**
3. Jika belum ada, klik **"Add app"** → pilih **Web** (🌐)
4. Catat nilai berikut:
   - **Project ID** (contoh: `trackify-demo`)
   - **API Key** (contoh: `AIzaSyD...`)

---

## Setup di Aplikasi

### Step 1: Configure Firebase

1. Buka app Trackify
2. Scroll ke bagian **"Firebase Firestore"**
3. Klik **"Setup"**
4. Masukkan:
   - **Device ID**: Nama unik untuk device ini (contoh: `mobil_01`, `kantor_hp`, `tracker_andi`)
   - **Firebase Project ID**: Dari Firebase Console
   - **Firebase API Key**: Dari Firebase Console
5. Klik **"Save Configuration"**

✅ Jika berhasil, akan muncul status **"✓ Configured"**

### Step 2: Mulai Tracking (Device Pengirim)

Setelah Firebase configured:

1. **Foreground tracking** otomatis mengirim lokasi ke Firestore setiap 90 detik
2. Atau aktifkan **Background tracking** untuk terus mengirim saat app di background
3. Cek di Firebase Console → Firestore → `devices` → `{deviceId}` → `locations`
4. Akan ada dokumen baru setiap 90 detik dengan koordinat GPS

### Step 3: Track Device Lain (Device Penerima)

Di device lain yang ingin melacak:

1. Configure Firebase dengan **Project ID & API Key yang sama**
2. Bisa pakai **Device ID berbeda** (misal device ini `kantor_hp`, yang dilacak `mobil_01`)
3. Scroll ke **"Tracked Devices"**
4. Klik **"+ Add"**
5. Masukkan:
   - **Firestore Device ID**: ID device yang ingin dilacak (misal `mobil_01`)
   - **Display Name**: Nama tampilan (misal "Mobil Andi")
6. Klik **"Add Tracked Device"**
7. Klik **"⟳ Refresh Locations"** untuk fetch lokasi terbaru
8. Lokasi akan muncul di peta dengan **marker orange**

---

## Struktur Data Firestore

```
firestore/
└── devices/
    ├── mobil_01/                     # Device ID
    │   └── locations/                # Collection lokasi
    │       ├── location_1702123456789/
    │       │   ├── latitude: -6.2088
    │       │   ├── longitude: 106.8456
    │       │   ├── timestamp: 1702123456789
    │       │   └── accuracy: 10.5
    │       └── location_1702123546789/
    │           └── ...
    └── kantor_hp/
        └── locations/
            └── ...
```

---

## Penjelasan Marker di Peta

| Warna | Arti |
|-------|------|
| 🔵 **Biru** | Lokasi Anda (device ini) |
| 🟢 **Hijau** | Device lokal online |
| ⚪ **Abu-abu** | Device lokal offline |
| 🟠 **Orange** | Device dari Firestore (tracked) |
| 🔵 **Garis Biru** | History path (riwayat perjalanan) |
| 🔴 **Merah** | Last known location |

---

## Perhitungan Biaya Firestore (Free Tier)

### Free Tier Limits (per hari):
- ✅ 50,000 reads
- ✅ 20,000 writes
- ✅ 20,000 deletes
- ✅ 1 GB storage

### Estimasi Penggunaan:

**1 Device upload setiap 90 detik:**
- 1 hari = 24 jam × 60 menit / 1.5 menit = **960 writes/hari**
- **10 devices** = 9,600 writes/hari ✅ (masih di bawah 20k limit)

**1 Device tracking 5 devices, refresh setiap 10 detik:**
- Per refresh = 5 reads
- 1 hari = 24 × 3600 / 10 = 8,640 refreshes
- Total = 8,640 × 5 = **43,200 reads/hari** ❌ (lewat limit 50k)

**Rekomendasi:**
- Manual refresh saja (tidak auto-polling)
- Atau polling lebih lambat (30-60 detik)
- Atau upgrade ke Blaze plan (pay-as-you-go)

---

## Troubleshooting

### ❌ Location tidak upload ke Firestore

**Solusi:**
1. Cek Firebase configured dengan benar (Device ID, Project ID, API Key)
2. Pastikan Firestore Database sudah dibuat di Firebase Console
3. Cek Security Rules allow write
4. Cek internet connection
5. Lihat error di logcat: `adb logcat | grep Firestore`

### ❌ Tracked device tidak muncul di peta

**Solusi:**
1. Pastikan device yang dilacak sudah upload lokasi (cek di Firestore Console)
2. Klik "Refresh Locations" untuk fetch data terbaru
3. Cek Firestore Device ID sama persis dengan yang diinput
4. Pastikan device punya location data (timestamp > 0)

### ❌ "Permission denied" error

**Solusi:**
1. Cek Firestore Security Rules
2. Pastikan rules allow read/write: `allow read, write: if true;`
3. Atau implement Firebase Authentication untuk production

### ❌ Lokasi tidak update real-time

**Info:**
- System menggunakan **manual polling**, bukan real-time listener (untuk hemat Firestore reads)
- Klik "Refresh Locations" untuk update manual
- Device pengirim upload setiap **90 detik**, jadi ada delay maksimal 90 detik

---

## Tips & Best Practices

### ✅ Hemat Battery
- Gunakan **Battery Saver mode** di app
- Hanya aktifkan background tracking saat perlu
- Interval 90 detik sudah optimal untuk tracking

### ✅ Hemat Firestore Quota
- Refresh manual daripada auto-polling
- Hapus old location documents secara berkala
- Monitor usage di Firebase Console → Usage tab

### ✅ Privacy & Security
- Gunakan Device ID yang tidak mengandung info personal
- Implement Firebase Authentication untuk production
- Set proper Firestore Security Rules
- Jangan share API Key di public repository

### ✅ Production Deployment
1. Enable Firebase Authentication
2. Update Firestore rules untuk require auth
3. Implement device registration/pairing system
4. Add location data encryption
5. Monitor Firestore usage dan set budget alerts

---

## API Reference

### Firestore Service Functions

```typescript
// Upload location (auto-throttled 90 seconds)
uploadLocationToFirestore(deviceId, projectId, location, apiKey)

// Fetch latest location of a device
fetchDeviceLocation(deviceId, projectId, apiKey)

// Fetch location history
fetchDeviceLocationHistory(deviceId, projectId, apiKey, limit)

// Real-time polling (manual implementation)
startListeningToDeviceLocation(deviceId, projectId, apiKey, onUpdate, interval)
```

### Location Data Structure

```typescript
interface LocationHistoryPoint {
  deviceId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}
```

---

## Support & Resources

- 📚 [Firebase Documentation](https://firebase.google.com/docs)
- 📚 [Firestore Documentation](https://firebase.google.com/docs/firestore)
- 📚 [Expo Location Docs](https://docs.expo.dev/versions/latest/sdk/location/)
- 💬 Firebase Community Forums
- 🐛 GitHub Issues (untuk bug report)

---

## Changelog

### v1.0.0 - Initial Firestore Integration
- ✅ Firebase configuration UI
- ✅ Auto-upload location setiap 90 detik
- ✅ Track multiple devices
- ✅ Display tracked devices on map
- ✅ Manual refresh locations
- ✅ Orange markers for Firestore devices

---

**Last Updated:** December 10, 2025
