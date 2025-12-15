# 🔧 FIX DEPLOYMENT ERROR - 404 & 405

**Problem:** Backend di Vercel return 404 NOT_FOUND dan 405 Not Allowed

**Penyebab:** Environment variables Firebase belum di-set di Vercel Dashboard

---

## ✅ SOLUSI CEPAT

### STEP 1: Buka Vercel Dashboard

1. Browser → https://vercel.com/dashboard
2. Login
3. Cari project: **trackify-backend**

---

### STEP 2: Masuk ke Settings

1. Klik project: **trackify-backend**
2. Top menu: **Settings**
3. Left sidebar: **Environment Variables**

---

### STEP 3: Cek Variables yang Ada

Seharusnya terlihat EXACTLY seperti ini:

```
✓ FIREBASE_PROJECT_ID = trackify-2025-c29e3
✓ FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@trackify-2025-c29e3.iam.gserviceaccount.com
✓ FIREBASE_PRIVATE_KEY = ••••••••••••••••••••• (secret, encrypted)
```

### STEP 4: Kalau Ada yang Missing

Jika salah satu variable **tidak ada**, lakukan ini:

#### Add FIREBASE_PROJECT_ID (jika belum ada)

1. Klik: **Add New**
2. Form:
   ```
   Name:  FIREBASE_PROJECT_ID
   Value: trackify-2025-c29e3
   Environments: ✓ Production ✓ Preview ✓ Development
   ```
3. Klik: **Save** atau **Add**

#### Add FIREBASE_CLIENT_EMAIL (jika belum ada)

1. Klik: **Add New**
2. Form:
   ```
   Name:  FIREBASE_CLIENT_EMAIL
   Value: firebase-adminsdk-fbsvc@trackify-2025-c29e3.iam.gserviceaccount.com
   Environments: ✓ Production ✓ Preview ✓ Development
   ```
3. Klik: **Save**

#### Add FIREBASE_PRIVATE_KEY (jika belum ada) ⚠️

⚠️ **CRITICAL:** Ini adalah key sensitif!

1. Buka https://console.firebase.google.com
2. Pilih project: **Trackify-2025**
3. ⚙️ **Settings** → **Project Settings**
4. Tab: **Service Accounts**
5. Language: **Node.js**
6. Klik: **Generate New Private Key**
7. JSON file download
8. **COPY seluruh value dari field `"private_key"`** (include `-----BEGIN` dan `-----END`)

Contoh:
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD3afuoxAS1p6nx
JXrET7YnUzWu69Vz8zIkDilSkApNna378drm8LG5FwfAFVZMhAuc38eJGXoL4wJk
4rVnioOB6Zv7mv9uligOmjUOdksa6H5GOWX+2V2c38kEkQFBHyTXGOpLyniMhr3f
...MANY LINES...
-----END PRIVATE KEY-----
```

**Back to Vercel:**

9. Klik: **Add New**
10. Form:
    ```
    Name:  FIREBASE_PRIVATE_KEY
    Value: [PASTE EXACT dari step 8 - include BEGIN/END]
    Environments: ✓ Production ✓ Preview ✓ Development
    ```
11. Klik: **Save**

---

### STEP 5: Redeploy Backend

Setelah semua 3 variables tersimpan, **REDEPLOY** backend agar baca variables tersebut.

#### Option A: Via Vercel Dashboard (RECOMMENDED)

1. Di Vercel project page
2. Klik: **Deployments** (top menu)
3. Cari deployment paling atas (paling baru)
4. Klik **⋯** (kebab menu) di deployment tersebut
5. Klik: **Redeploy**
6. Akan ada dialog "Redeploy to production?"
7. Klik: **Redeploy**
8. Tunggu hingga selesai (2-3 menit)

**Status seharusnya berubah dari:**
- `Building` → `Ready`
- `https://trackify-backend-seven.vercel.app` (siap diakses)

#### Option B: Via Terminal

```powershell
cd ../trackify-backend
vercel --prod --force
```

Tunggu hingga output:
```
✓ Production: https://trackify-backend-seven.vercel.app
```

---

### STEP 6: Verify Environment Variables Sudah Active

1. Di Vercel dashboard
2. Klik: **Deployments**
3. Klik deployment yang sudah di-redeploy
4. Klik: **Runtime Logs** (atau cari logs)
5. Seharusnya terlihat di logs:
   ```
   Environment: FIREBASE_PROJECT_ID loaded ✓
   Environment: FIREBASE_CLIENT_EMAIL loaded ✓
   Environment: FIREBASE_PRIVATE_KEY loaded ✓
   ```

---

### STEP 7: Test Backend Again

Kembali ke Postman dan test:

**Method:** POST  
**URL:** `https://trackify-backend-seven.vercel.app/api/share/create`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "deviceName": "Test Device"
}
```

**Klik: Send**

**Expected Response:** ✅ 200 OK
```json
{
  "success": true,
  "code": "TRACK-ABCDEF",
  "deviceSecret": "secret_xxxxx...",
  "expiresAt": 1702632060000,
  "message": "Share this code with others..."
}
```

---

## 🔍 TROUBLESHOOTING

### ❌ Masih 404?

**Diagnostik:**
1. Cek deployment status di Vercel dashboard - apakah `Ready`?
2. Cek URL - pastikan benar `https://trackify-backend-seven.vercel.app`
3. Cek logs - ada error?

**Solusi:**
- Clear browser cache: Ctrl+Shift+Delete
- Tunggu 30 detik setelah redeploy
- Try curl dari Terminal:
  ```powershell
  curl -X POST "https://trackify-backend-seven.vercel.app/api/share/create" `
    -H "Content-Type: application/json" `
    -d '{"deviceName":"Test"}'
  ```

### ❌ Masih 405?

**Penyebab:** Method POST tidak allowed - mungkin vercel.json tidak di-detect

**Solusi:**
```powershell
cd ../trackify-backend
npm run build
vercel --prod --force
```

### ❌ "Missing Firebase credentials" Error

**Penyebab:** Environment variables tidak tersimpan dengan benar

**Solusi:**
1. Kembali ke Vercel dashboard
2. Cek environment variables - ada typo?
3. Perhatikan **NAME** harus EXACT:
   - ✅ `FIREBASE_PROJECT_ID`
   - ✅ `FIREBASE_CLIENT_EMAIL`
   - ✅ `FIREBASE_PRIVATE_KEY`
   - ❌ `firebase_project_id` (case-sensitive!)

---

## ✅ CHECKLIST FINAL

- [ ] Vercel dashboard sudah dibuka
- [ ] Project `trackify-backend` sudah dipilih
- [ ] Settings → Environment Variables sudah dibuka
- [ ] Semua 3 variables sudah di-add:
  - [ ] `FIREBASE_PROJECT_ID` = `trackify-2025-c29e3`
  - [ ] `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@...`
  - [ ] `FIREBASE_PRIVATE_KEY` = [complete key with BEGIN/END]
- [ ] Backend sudah di-redeploy
- [ ] Deployment status: **Ready** (bukan Building)
- [ ] Test via Postman: ✅ 200 OK dengan kode

---

**Status:** ⏳ In Progress - Waiting for Redeploy Complete
