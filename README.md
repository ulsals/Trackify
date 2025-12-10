# Welcome Trackify 👋

Pernahkah Anda merasakan kepanikan saat tidak menemukan kunci mobil, dompet, atau koper di saat genting? Trackify hadir untuk mengakhiri kecemasan tersebut.

Trackify adalah aplikasi keamanan terpadu yang dirancang khusus untuk menjadi "mata kedua" bagi barang-barang berharga Anda. Aplikasi ini dirancang untuk memantau dan melacak barang berharga Anda. Tidak hanya menjembatani kesenjangan antara barang fisik dan keamanan digital, memberikan ketenangan pikiran (peace of mind) bagi penggunanya.

## 🚀 Fitur Utama

### 🗺️ Real-Time Location Tracking
- Live GPS tracking dengan OpenStreetMap
- Foreground dan background location tracking
- Interval 90 detik untuk optimasi battery
- History perjalanan dengan kalkulasi jarak

### 🔥 Firebase Firestore Multi-Device Sync
- **Track unlimited devices via cloud**
- Auto-upload lokasi setiap 90 detik
- Real-time location sharing antar devices
- Gratis dengan Firestore free tier (20k writes/day)

### 📍 Device Management
- Register multiple GPS devices
- Track status device (online/offline)
- Tampilkan lokasi di peta
- Kalkulasi jarak dari lokasi Anda
- Add/remove tracked devices dari Firestore

### 🚧 Geofence Zones
- Buat circular geofence zones
- Set tipe zone (safe, warning, caution, critical)
- Visual zone representation di peta
- Enable/disable zones

### 🔋 Battery Optimization
- Adaptive tracking intervals sesuai battery level
- Battery saver mode
- Background tracking controls

---

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/ulsals/Trackify.git
cd Trackify

# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo run:android
```

---

## 🔥 Firebase Setup (Multi-Device Tracking)

### Quick Start

1. **Create Firebase Project**
   - Buka [Firebase Console](https://console.firebase.google.com)
   - Create new project atau gunakan existing project

2. **Enable Firestore Database**
   - Build → Firestore Database → Create database
   - Pilih "Test mode" untuk development

3. **Get Credentials**
   - Project Settings (⚙️) → Project ID & API Key
   - Catat nilai ini untuk config di app

4. **Configure in App**
   - Open Trackify app
   - Scroll ke "Firebase Firestore" section
   - Klik "Setup"
   - Masukkan Device ID, Project ID, API Key
   - Klik "Save Configuration"

5. **Start Tracking**
   - **Device 1** (Sender): Configure Firebase → Start tracking → Lokasi auto-upload setiap 90 detik
   - **Device 2** (Receiver): Configure Firebase → Add tracked device → Enter Device 1's ID → Tap "Refresh Locations"

📚 **Detailed Guide:** See [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md) untuk instruksi lengkap

---

## 🗺️ Map Legend

| Warna | Arti |
|-------|------|
| 🔵 **Biru** | Lokasi Anda (device ini) |
| 🟢 **Hijau** | Device lokal online |
| ⚪ **Abu-abu** | Device lokal offline |
| 🟠 **Orange** | Tracked device (Firestore) |
| 🔵 **Garis** | History path |
| 🔴 **Merah** | Last known location |

---

## 🛠️ Tech Stack

- **Framework:** React Native (Expo)
- **Navigation:** Expo Router
- **Maps:** OpenStreetMap via Leaflet
- **Location:** expo-location + expo-task-manager
- **Cloud Sync:** Firebase Firestore (REST API)
- **Storage:** AsyncStorage
- **Notifications:** expo-notifications

---

## 📊 Firestore Usage (Free Tier)

### Limits per hari:
- ✅ 50,000 reads
- ✅ 20,000 writes
- ✅ 1 GB storage

### Estimasi:
- **10 devices** upload setiap 90 detik = ~9,600 writes/hari ✅
- **1 device** track 5 devices, manual refresh = ~100 reads/hari ✅

---

## 🐛 Troubleshooting

### Location tidak muncul
1. Check location permissions granted
2. Enable GPS di device
3. Untuk emulator: Send mock location via Extended Controls
4. Check logcat: `adb logcat | grep location`

### Firestore sync tidak work
1. Verify Firebase configured correctly
2. Check internet connection
3. Confirm Firestore database created
4. Review security rules (must allow read/write)

### Background tracking stops
1. Disable battery optimization untuk app
2. Grant "Allow all the time" permission
3. Keep app in recent apps

---

## 📝 License

MIT License - see LICENSE file for details.

---

## 👥 Team

Developed by Ulsals Team

---

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/ulsals/Trackify/issues)
- 📚 Docs: [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md)

---

**Version:** 1.0.0 | **Last Updated:** December 10, 2025

 

