# 🚀 Backend Deployment - Step-by-Step Implementation

Status: **CRITICAL** - Backend needs to be deployed to Vercel for app to work properly.

## 🎯 Current Situation

- ✅ Backend code is complete at `../trackify-backend/`
- ✅ Firebase project `trackify-2025-c29e3` exists
- ❌ Backend is NOT deployed to Vercel (causing "Network request failed" error)
- ❌ Environment variables NOT set in Vercel

## 📋 What You Need

### 1. Firebase Service Account Key (CRITICAL)
This is a JSON file from Firebase that allows the backend to access Firestore.

**How to get it:**
1. Open [Firebase Console](https://console.firebase.google.com)
2. Select project: **"Trackify-2025"** (or your Firebase project)
3. Click **⚙️ Settings** (gear icon) → **Project Settings**
4. Tab: **"Service Accounts"**
5. Click **"Generate New Private Key"**
6. A JSON file downloads (keep it SECRET!)

The file looks like:
```json
{
  "type": "service_account",
  "project_id": "trackify-2025-c29e3",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@trackify-2025-c29e3.iam.gserviceaccount.com",
  ...
}
```

### 2. Vercel Account
- Free account at [vercel.com](https://vercel.com)
- Or connect GitHub for auto-deploy

---

## 🔧 Implementation Steps

### STEP 1: Verify Backend Code (5 min)

Navigate to backend folder and check it's ready:

```bash
cd ../trackify-backend
dir
```

You should see:
```
package.json
vercel.json (or index.js)
src/
  api/
    share/
      create.ts (or .js)
      join.ts
    location/
      update.ts
      [code].ts (or route.ts)
  config/
    firebase.ts
  services/
    ...
```

If files are missing, backend code wasn't cloned properly.

---

### STEP 2: Install Dependencies (5 min)

```bash
cd ../trackify-backend
npm install
```

Wait for it to complete.

---

### STEP 3: Get Firebase Service Account (10 min)

**Most Important Step!**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Make sure you're on the correct Firebase project
3. Click ⚙️ **Settings** → **Project Settings**
4. Tab: **"Service Accounts"**
5. Language: **Node.js** (should be default)
6. Click **"Generate New Private Key"**
7. A `.json` file downloads

**Keep this file! You'll need the contents for Vercel environment variables.**

---

### STEP 4: Deploy to Vercel (10 min)

#### Option A: Using Vercel CLI (Easiest)

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Ensure you're in backend folder
cd ../trackify-backend

# Login to Vercel
vercel login
# Opens browser → Login with GitHub or email

# Deploy to production
vercel --prod
# Press Enter for project name suggestions
# Say "Yes" to link to existing project if prompted
```

After deployment, you'll get:
```
✓ Production: https://trackify-orcin.vercel.app
```

#### Option B: Using GitHub (Recommended - Auto-deploys)

1. Push `trackify-backend` folder to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your GitHub repo
5. Settings:
   - Framework: **Other**
   - Root Directory: `trackify-backend`
   - Click **Deploy**

---

### STEP 5: Add Environment Variables to Vercel (10 min)

After deployment, backend needs Firebase credentials.

**In Vercel Dashboard:**

1. Go to your project: https://vercel.com/dashboard
2. Click your project name (e.g., `trackify-orcin`)
3. Go to **Settings** → **Environment Variables**
4. Add 3 variables (copy from the JSON file you downloaded in STEP 3):

#### Variable 1: FIREBASE_PROJECT_ID
- **Name:** `FIREBASE_PROJECT_ID`
- **Value:** `trackify-2025-c29e3` (or your actual project ID)

#### Variable 2: FIREBASE_CLIENT_EMAIL
- **Name:** `FIREBASE_CLIENT_EMAIL`
- **Value:** (from JSON) `firebase-adminsdk-xxxxx@trackify-2025-c29e3.iam.gserviceaccount.com`

#### Variable 3: FIREBASE_PRIVATE_KEY ⚠️ IMPORTANT
- **Name:** `FIREBASE_PRIVATE_KEY`
- **Value:** (from JSON) Copy the entire `private_key` field INCLUDING the quotes and `\n` characters
  - Should look like: `-----BEGIN PRIVATE KEY-----\nMIIE....\n-----END PRIVATE KEY-----\n`

**Save each variable and deploy again** (Vercel will automatically redeploy with new variables).

---

### STEP 6: Test Backend is Working (5 min)

Open terminal and run:

```bash
curl https://trackify-orcin.vercel.app/api/share/create \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"deviceName\":\"Test Device\"}"
```

**Success Response:** You should get a JSON with a tracking code:
```json
{
  "success": true,
  "code": "TRACK-ABC123",
  "deviceSecret": "...",
  "expiresAt": 1702756500000,
  "message": "..."
}
```

**Error Response:** If you get:
- `500 error` → Environment variables not set correctly
- `404 Not Found` → Vercel deployment failed
- `Connection refused` → Vercel URL is wrong

---

### STEP 7: Update Firebase Security Rules (5 min)

Lock down Firestore to ONLY allow backend access:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. **Build** → **Cloud Firestore** → **Rules** tab
3. Replace everything with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Block all client access - only service account (backend) can access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click **Publish**

---

### STEP 8: Test from Trackify App (5 min)

Go back to your Trackify app:

```bash
cd ../Trackify
npx expo start
```

**Test:**
1. Click "Share My Location"
2. Should generate a code (not mock) ✅
3. Open Vercel logs to see the request
4. Code should be in Firebase Firestore

---

## ✅ Verification Checklist

After all steps:

- [ ] Backend folder exists at `../trackify-backend/`
- [ ] `npm install` completed successfully
- [ ] Firebase service account JSON downloaded
- [ ] Vercel account created
- [ ] Backend deployed to Vercel (`vercel --prod`)
- [ ] 3 environment variables added to Vercel
- [ ] Vercel deployment logs show no errors
- [ ] `curl` test returns tracking code (not 500 error)
- [ ] Firebase security rules updated to block client access
- [ ] Trackify app shows real tracking codes (not mock)

---

## 🐛 Troubleshooting

### Error: "500 Internal Server Error"
**Cause:** Environment variables not set or invalid
**Fix:**
1. Check Vercel → Settings → Environment Variables
2. Verify `FIREBASE_PRIVATE_KEY` includes full multi-line key
3. Redeploy: `vercel --prod`

### Error: "404 Not Found"
**Cause:** Backend not deployed to Vercel
**Fix:**
1. Run: `vercel --prod` from backend folder
2. Check Vercel dashboard shows "Ready"

### Error: "Network request failed" in app
**Cause:** Backend URL is wrong or not deployed
**Fix:**
1. Check `VERCEL_BACKEND_URL` in `services/backend-api-service.ts`
2. Verify URL matches Vercel project domain
3. Test with `curl` command above

### Firebase Rules Blocking Access
**Cause:** Security rules are too strict
**Fix:**
- Make sure backend is using service account (it is)
- Verify rules allow write to `tracking_sessions` collection
- Check Firestore logs for blocked requests

---

## 📊 Timeline

- **Steps 1-3:** ~20 minutes (get ready)
- **Step 4:** ~5 minutes (deploy)
- **Step 5:** ~10 minutes (add environment variables)
- **Step 6:** ~5 minutes (test)
- **Step 7:** ~5 minutes (update rules)
- **Step 8:** ~5 minutes (test app)

**Total: ~50 minutes**

---

## 🎯 Next Steps

After completing all steps above:

1. ✅ Backend deployed and working
2. ✅ Trackify app gets real tracking codes
3. ✅ No more "mock" data
4. ✅ Real-time location tracking functional

Then you can:
- Test multi-user tracking
- Deploy app to Play Store
- Add more features (geofencing, notifications)

---

Done? Tell me when Step 3 (Firebase service account) is ready, and I'll help you set everything else up!
