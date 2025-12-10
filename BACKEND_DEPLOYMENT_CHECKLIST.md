# Backend Deployment Checklist

## 🔍 Quick Diagnosis

Current error: **"Network request failed"**
- ❌ Backend NOT deployed to Vercel
- ❌ OR environment variables missing
- ❌ App using mock data instead of real backend

## ✅ 8-Step Implementation Plan

### Step 1: Verify Backend Code
```bash
cd ../trackify-backend
dir
```
Expected: `package.json`, `src/api/`, `src/services/`, etc.

**Status:** ☐ Done

---

### Step 2: Install Dependencies
```bash
npm install
```

**Status:** ☐ Done

---

### Step 3: Get Firebase Service Account Key
1. https://console.firebase.google.com
2. Select project → ⚙️ Settings → Service Accounts
3. Click "Generate New Private Key"
4. Save the JSON file

**File Name:** `trackify-2025-c29e3-xxxxx.json` (example)

**Status:** ☐ Done

---

### Step 4: Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Vercel URL:** `https://trackify-orcin.vercel.app`

**Status:** ☐ Done

---

### Step 5: Add Environment Variables in Vercel
Dashboard → Settings → Environment Variables

Add 3 variables (copy from Step 3 JSON file):

| Name | Value from JSON |
|------|-----------------|
| `FIREBASE_PROJECT_ID` | `project_id` field |
| `FIREBASE_CLIENT_EMAIL` | `client_email` field |
| `FIREBASE_PRIVATE_KEY` | `private_key` field |

**Status:** ☐ Done

---

### Step 6: Test Backend with curl
```bash
curl https://trackify-orcin.vercel.app/api/share/create \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"deviceName\":\"Test\"}"
```

Expected: JSON with `code` field (e.g., `TRACK-ABC123`)

**Status:** ☐ Done

---

### Step 7: Update Firebase Security Rules
Console → Cloud Firestore → Rules

Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Status:** ☐ Done

---

### Step 8: Test Trackify App
```bash
cd ../Trackify
npx expo start
```

Click "Share My Location" → Should get REAL tracking code (not mock)

**Status:** ☐ Done

---

## 📋 What Gets Fixed

✅ Backend deployed and working
✅ App gets real tracking codes
✅ Location data stored in real Firebase
✅ No more "Network request failed" error
✅ Multi-user tracking functional

---

## 🚀 Time Estimate: ~50 minutes

- Steps 1-3: 20 min (preparation)
- Step 4: 5 min (deploy)
- Step 5: 10 min (environment variables)
- Step 6: 5 min (test)
- Step 7: 5 min (security rules)
- Step 8: 5 min (app test)

---

## 📞 Need Help?

See: `BACKEND_DEPLOYMENT_GUIDE.md` for detailed instructions on each step.
