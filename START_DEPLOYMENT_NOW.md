# ⚡ READY TO DEPLOY - Final Instructions

## ✅ Everything Prepared!

Deployment script sudah siap. Sekarang tinggal jalankan!

---

## 🚀 RUN NOW - 3 Langkah Sederhana

### LANGKAH 1️⃣: Jalankan Script (10 menit)

**File:** `D:\User\Documents\2025\SEM5\BERGERAK\UAS\trackify-backend\deploy.bat`

**Cara:**
- Buka File Explorer
- Pergi ke folder: `trackify-backend`
- Double-click file: **`deploy.bat`**
- Command Prompt akan terbuka otomatis

**Apa yang terjadi:**
1. Install dependencies (~2 min) → Press key to continue
2. Install Vercel CLI (~1 min) → Press key to continue
3. Login Vercel (browser opens) → Login, then press key
4. Deploy to Vercel (~5 min) → Watch progress

**Tunggu sampai selesai!** Akan muncul:
```
✓ Production: https://trackify-orcin.vercel.app
```

### LANGKAH 2️⃣: Add Environment Variables (5 menit)

**Go to:** https://vercel.com/dashboard

**Steps:**
1. Click project: `trackify-orcin`
2. Settings → Environment Variables
3. Add 3 variables:

```
1. Name: FIREBASE_PROJECT_ID
   Value: trackify-2025-c29e3

2. Name: FIREBASE_CLIENT_EMAIL
   Value: firebase-adminsdk-fbsvc@trackify-2025-c29e3.iam.gserviceaccount.com

3. Name: FIREBASE_PRIVATE_KEY
   Value: [Your 32-line private key from service account JSON]
```

**Vercel akan auto-redeploy.**

### LANGKAH 3️⃣: Test (5 menit)

**Terminal command:**
```cmd
curl -X POST https://trackify-orcin.vercel.app/api/share/create ^
  -H "Content-Type: application/json" ^
  -d "{\"deviceName\":\"Test\"}"
```

**Should return:** `{"success":true,"code":"TRACK-..."}`

**Then in app:**
```cmd
cd D:\User\Documents\2025\SEM5\BERGERAK\UAS\Trackify
npx expo start
```

Click "Share My Location" → Should show **REAL code** (not mock)

---

## ✅ What You Have Ready

- ✅ Batch script: `deploy.bat` (ready to run)
- ✅ Firebase credentials (all 3 values provided)
- ✅ Backend code (tested and ready)
- ✅ Documentation (full guides available)

---

## 📋 Checklist While Deploying

- [ ] Run deploy.bat
- [ ] npm install completes
- [ ] vercel login works (browser opens)
- [ ] vercel --prod deployment shows success
- [ ] Note the Vercel URL
- [ ] Add 3 env vars in Vercel dashboard
- [ ] Vercel redeploys (auto)
- [ ] curl test returns tracking code
- [ ] App shows REAL code (not mock)

---

## ⏱️ Total Time: 20 minutes

- deploy.bat: 10 min
- Environment variables: 5 min
- Testing: 5 min

**Setelah ini:** ✅ Backend fully deployed & working!

---

## 🎯 Start Now!

1. **Open File Explorer**
2. **Navigate to:** `D:\User\Documents\2025\SEM5\BERGERAK\UAS\trackify-backend\`
3. **Double-click:** `deploy.bat`
4. **Follow prompts**

**That's it!** Just run the script and follow the steps! 🚀

---

## 📖 If You Need Help

- **Full detailed guide:** `BATCH_SCRIPT_DEPLOYMENT.md`
- **Vercel manual guide:** `VERCEL_DEPLOYMENT_WITH_CREDENTIALS.md`
- **Quick reference:** `DEPLOYMENT_FINAL_CHECKLIST.md`

---

## 💪 You Got This!

Everything is prepared. Script handles all the complex parts. Just:
1. Run deploy.bat
2. Click through prompts
3. Add 3 env vars
4. Done!

**GO!** 🚀
