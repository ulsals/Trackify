# Service Account Key Extraction - Step by Step

## ✅ Anda Sudah Punya

Project ID: **`trackify-2025-c29e3`** ✓

Dari file: `google-services.json`

## 🔑 Sekarang Butuh: Service Account Key (JSON)

Ini adalah file berbeda dari `google-services.json`. File ini untuk backend authentication ke Firestore.

---

## 📋 Langkah Mendapatkan Service Account Key

### Step 1: Buka Firebase Console
Pergi ke: https://console.firebase.google.com

### Step 2: Pilih Project
Di halaman utama, pilih project: **"trackify-2025"** atau yang match dengan ID `trackify-2025-c29e3`

### Step 3: Buka Project Settings
1. Klik **⚙️ Settings icon** (gear icon) di atas
2. Pilih **"Project Settings"**

### Step 4: Tab Service Accounts
1. Di menu atas, tab "Service Accounts"
2. Di bawah ada button **"Generate New Private Key"**

### Step 5: Download JSON File
1. Klik tombol **"Generate New Private Key"**
2. File `.json` akan download otomatis
3. Nama file: `trackify-2025-xxxxx.json` (dengan ID random di akhir)

### Step 6: Buka File dengan Text Editor
1. Buka file JSON dengan Notepad atau VS Code
2. File berisi:
```json
{
  "type": "service_account",
  "project_id": "trackify-2025-c29e3",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@trackify-2025-c29e3.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## 🔐 3 Fields Penting untuk Backend

Dari file JSON di atas, copy 3 fields ini:

### 1. FIREBASE_PROJECT_ID
```
Dari JSON: "project_id": "..."
Contoh: trackify-2025-c29e3
```

### 2. FIREBASE_CLIENT_EMAIL
```
Dari JSON: "client_email": "..."
Contoh: firebase-adminsdk-xxxxx@trackify-2025-c29e3.iam.gserviceaccount.com
```

### 3. FIREBASE_PRIVATE_KEY
```
Dari JSON: "private_key": "..."
Contoh: -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n
```

**⚠️ PENTING:** Copy SELURUH private key termasuk:
- `-----BEGIN PRIVATE KEY-----`
- Semua baris di tengah
- `-----END PRIVATE KEY-----`
- Karakteri `\n` yang sudah ada

---

## 🚀 Setelah Dapat Service Account Key

Buat 3 environment variables di Vercel:

### Di Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select project: `trackify-orcin`
3. Settings → **Environment Variables**
4. Add 3 variables:

```
Name: FIREBASE_PROJECT_ID
Value: trackify-2025-c29e3

Name: FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-xxxxx@trackify-2025-c29e3.iam.gserviceaccount.com

Name: FIREBASE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----\nMIIEvQIBADA...\n-----END PRIVATE KEY-----\n
```

5. Save each variable
6. Click "Deploy" to redeploy with new variables

---

## ✅ Verification

After adding environment variables, test:

```bash
curl https://trackify-orcin.vercel.app/api/share/create \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"deviceName":"Test Device"}'
```

**Should return:** Real tracking code (not error)

---

## 🆘 If You Can't Find Service Accounts Tab

Alternative path:

1. https://console.firebase.google.com
2. Left sidebar: Click your project
3. Scroll down to bottom
4. Click **⚙️ Project Settings**
5. Top menu: **"Service Accounts"** tab
6. Language dropdown: Select **"Node.js"**
7. Click **"Generate New Private Key"**

---

## 🔒 Security Reminder

**NEVER:**
- Commit this JSON file to GitHub
- Share it on public platforms
- Post it in chat/email

**DO:**
- Keep it secret
- Use only for backend environment variables
- If leaked, regenerate a new one

---

## Next Steps

1. Download service account JSON from Firebase
2. Copy the 3 fields (project_id, client_email, private_key)
3. Add them as environment variables in Vercel
4. Test with curl command above
5. Trackify app will work with real backend!

Tell me when you've completed this. I'll verify and help with any issues! 🚀
