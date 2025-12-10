# 🚀 Manual Backend Deployment Guide - Using Your Service Account

You have everything needed! Now deploy to Vercel with your Firebase credentials.

---

## ✅ Your Firebase Credentials

```
Project ID: trackify-2025-c29e3
Client Email: firebase-adminsdk-fbsvc@trackify-2025-c29e3.iam.gserviceaccount.com

Private Key: -----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD3afuoxAS1p6nx
JXrET7YnUzWu69Vz8zIkDilSkApNna378drm8LG5FwfAFVZMhAuc38eJGXoL4wJk
4rVnioOB6Zv7mv9uligOmjUOdksa6H5GOWX+2V2c38kEkQFBHyTXGOpLyniMhr3f
nheDFAM/aXXkX0LmstCYkpJ3pPTtHI1sisoKCvPJ5ZaV0q3HDHcD24evZewSy5YH
l+creJrAa2yRuvkU4eYJIhvgNexFYGFxtaYukDhtSRpgCfMwbjkXVsNQr0XE7vyn
ZXSNoMXTrMCe5awkTniPxj1/6PS4zOBpPbILavaKWiBT1Xk+XaviRvM4IIWAaMWQ
kshnzlMtAgMBAAECggEAANNfxhZr2SJekPVRb0JDGQfMHNfqcuz8IpY4yd6A/+pl
d7mkZycXcOpsiWZNmHqwt1vUdv5g46sIM79UXayNL5wnyuJz+TMyguBY5DG1fIVM
5XmshTMdCbRsViKIbjAL5hOn/G3EAk9eS6L/A37bBGMgcllq6MVmZyzMQt4wy96q
iQznFIbNB7PQwgE2N0We6a7nFdYoqWK+NtHcgBjPN3OT60p2HwI3SR6ZZ7j+O4LP
IimYJRqxedAxfAgHSrlac2Bqwh+maaY8aDPTXpVUg5vrZX5s8mWpbNa3ruvlT/DH
2M88tqF4qaRhxZJcM4egeO+8mxFzVCgbAtp+bS5DUQKBgQD/5pkYnavCacFQ5xBT
sszzYpfOrq1vMMgicojim4UeqC9SaiVdpX29ZfguyxqYdSqKsF80TI9wyFPk+hre
xa4MUKFYbqmObI7JpMEsNI4+yCIZQ4o9P3JhQ6sMEoWacbXwsE6fe3wcE55FgChS
w0BHbU+w9LQBbF2BO/+GEb37JQKBgQD3gormDbB2euhM3cBJv6qSVB3NrfDMNkaD
UqBRk6kHUEXN5y+KsoYR1MUsWQOr4Z6KUilR+PrCS3qxnhbr1tzvBOySO7vlUOrZ
ISAuxBzJNhfNgvBHV6bXveZPBlrsS1bKMt1gV6h0hhJ/LCFRpMsh07eUc1kTFpYi
Un1qFxi9aQKBgQDcVESe4CqhsoKi0L/LANjb+ZixeM6VPNAkcK8RRUwhsDdGY2QW
tEWGDETarT8R41ekn+To175tId6x+PGnu1Z2/flddbKBkVCDp1o3YGzU+2X4kKF2
yKkHu8aLF2t3Jc68FGEtiZm7ZtzQBF8zmy8+EI0b1CUkUJRVkD4axi3oDQKBgQDk
cv9VO8lmcic722mCKIB9s1oW37dkJayLxZXn9cyLzZHAbOQ6tnB8wNCFEFwNJ6A3
t4IgARkigJxsmKg7YgRmMTtR9gSFslwxsRuNTsHrDhyGOZchokuC0epjglAlzZv7
4Vrnc8EuXBlye/785of/XvUQ9i5/KdfFMjJD27GgEQKBgDHAtANhZOVmcddn9d46
sWtN+n+vfCsBmWzksPuLzB+O5lMjnIMwMbt+GtVjCQvTW57jwG42ZGZxZQnCgvLp
RD/fkuKGW8QNgTYsM/AbKuAoeFDb/x292JlykkaPbQgHWxGSqnyrOLbYgp4ZirsF
2gyqT4ZAxPoLp+nfKtBNL8Xl
-----END PRIVATE KEY-----
```

---

## 🚀 Step 1: Deploy Backend to Vercel

### Open Terminal/CMD

Go to this folder:
```
D:\User\Documents\2025\SEM5\BERGERAK\UAS\trackify-backend
```

### Run These Commands (Copy-Paste)

```bash
npm install
```

Wait for it to finish (2-3 minutes).

Then:
```bash
npm install -g vercel
```

Then:
```bash
vercel login
```

This will open browser to login. Login with GitHub or email.

Then:
```bash
vercel --prod
```

**Wait for output like:**
```
✓ Production: https://trackify_grd.vercel.app
```

---

## 🔐 Step 2: Add Environment Variables in Vercel

### Go to Vercel Dashboard

Open browser: https://vercel.com/dashboard

### Select Project

Click on project: **trackify_grd**

### Go to Settings

Click: **Settings** (top menu)

### Environment Variables

Click: **Environment Variables** (left sidebar)

### Add Variable 1: FIREBASE_PROJECT_ID

1. Click "Add New"
2. **Name:** `FIREBASE_PROJECT_ID`
3. **Value:** `trackify-2025-c29e3`
4. Click "Save"

### Add Variable 2: FIREBASE_CLIENT_EMAIL

1. Click "Add New"
2. **Name:** `FIREBASE_CLIENT_EMAIL`
3. **Value:** `firebase-adminsdk-fbsvc@trackify-2025-c29e3.iam.gserviceaccount.com`
4. Click "Save"

### Add Variable 3: FIREBASE_PRIVATE_KEY

⚠️ **IMPORTANT:** This is a multi-line key. Copy EXACTLY as is with all line breaks.

1. Click "Add New"
2. **Name:** `FIREBASE_PRIVATE_KEY`
3. **Value:** (Paste the entire key from the service account JSON)

```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD3afuoxAS1p6nx
JXrET7YnUzWu69Vz8zIkDilSkApNna378drm8LG5FwfAFVZMhAuc38eJGXoL4wJk
4rVnioOB6Zv7mv9uligOmjUOdksa6H5GOWX+2V2c38kEkQFBHyTXGOpLyniMhr3f
nheDFAM/aXXkX0LmstCYkpJ3pPTtHI1sisoKCvPJ5ZaV0q3HDHcD24evZewSy5YH
l+creJrAa2yRuvkU4eYJIhvgNexFYGFxtaYukDhtSRpgCfMwbjkXVsNQr0XE7vyn
ZXSNoMXTrMCe5awkTniPxj1/6PS4zOBpPbILavaKWiBT1Xk+XaviRvM4IIWAaMWQ
kshnzlMtAgMBAAECggEAANNfxhZr2SJekPVRb0JDGQfMHNfqcuz8IpY4yd6A/+pl
d7mkZycXcOpsiWZNmHqwt1vUdv5g46sIM79UXayNL5wnyuJz+TMyguBY5DG1fIVM
5XmshTMdCbRsViKIbjAL5hOn/G3EAk9eS6L/A37bBGMgcllq6MVmZyzMQt4wy96q
iQznFIbNB7PQwgE2N0We6a7nFdYoqWK+NtHcgBjPN3OT60p2HwI3SR6ZZ7j+O4LP
IimYJRqxedAxfAgHSrlac2Bqwh+maaY8aDPTXpVUg5vrZX5s8mWpbNa3ruvlT/DH
2M88tqF4qaRhxZJcM4egeO+8mxFzVCgbAtp+bS5DUQKBgQD/5pkYnavCacFQ5xBT
sszzYpfOrq1vMMgicojim4UeqC9SaiVdpX29ZfguyxqYdSqKsF80TI9wyFPk+hre
xa4MUKFYbqmObI7JpMEsNI4+yCIZQ4o9P3JhQ6sMEoWacbXwsE6fe3wcE55FgChS
w0BHbU+w9LQBbF2BO/+GEb37JQKBgQD3gormDbB2euhM3cBJv6qSVB3NrfDMNkaD
UqBRk6kHUEXN5y+KsoYR1MUsWQOr4Z6KUilR+PrCS3qxnhbr1tzvBOySO7vlUOrZ
ISAuxBzJNhfNgvBHV6bXveZPBlrsS1bKMt1gV6h0hhJ/LCFRpMsh07eUc1kTFpYi
Un1qFxi9aQKBgQDcVESe4CqhsoKi0L/LANjb+ZixeM6VPNAkcK8RRUwhsDdGY2QW
tEWGDETarT8R41ekn+To175tId6x+PGnu1Z2/flddbKBkVCDp1o3YGzU+2X4kKF2
yKkHu8aLF2t3Jc68FGEtiZm7ZtzQBF8zmy8+EI0b1CUkUJRVkD4axi3oDQKBgQDk
cv9VO8lmcic722mCKIB9s1oW37dkJayLxZXn9cyLzZHAbOQ6tnB8wNCFEFwNJ6A3
t4IgARkigJxsmKg7YgRmMTtR9gSFslwxsRuNTsHrDhyGOZchokuC0epjglAlzZv7
4Vrnc8EuXBlye/785of/XvUQ9i5/KdfFMjJD27GgEQKBgDHAtANhZOVmcddn9d46
sWtN+n+vfCsBmWzksPuLzB+O5lMjnIMwMbt+GtVjCQvTW57jwG42ZGZxZQnCgvLp
RD/fkuKGW8QNgTYsM/AbKuAoeFDb/x292JlykkaPbQgHWxGSqnyrOLbYgp4ZirsF
2gyqT4ZAxPoLp+nfKtBNL8Xl
-----END PRIVATE KEY-----
```

4. Click "Save"

### After Adding All 3 Variables

You should see all 3 in the list. Vercel will **automatically redeploy** with new environment variables.

Wait for deployment to complete (green checkmark).

---

## 🧪 Step 3: Test Backend is Working

Open terminal and run this command:

```bash
curl -X POST https://trackify_grd.vercel.app/api/share/create ^
  -H "Content-Type: application/json" ^
  -d "{\"deviceName\":\"Test Device\"}"
```

### Expected Success Response:
```json
{
  "success": true,
  "code": "TRACK-XXXXXX",
  "deviceSecret": "...",
  "expiresAt": 1702756500000,
  "message": "Share this code..."
}
```

### If You Get Error:
- **500 error** → Environment variables not set correctly
- **404 Not Found** → Deployment failed
- **Connection refused** → Vercel URL is wrong

---

## ✅ Step 4: Test in Trackify App

Open terminal and run:

```bash
cd ../Trackify
npx expo start
```

Then in the app:

1. Click "Share My Location"
2. Should show **REAL tracking code** (not mock)
3. Code format: `TRACK-XXXXXX` (6 random characters)
4. Check console: Should NOT say "using mock"

**If successful:**
✅ Real backend is working!
✅ Real location tracking enabled!
✅ No more "Network request failed"!

---

## 📋 Summary

| Step | Command | Time |
|------|---------|------|
| 1 | `npm install` | 2 min |
| 2 | `npm install -g vercel` | 1 min |
| 3 | `vercel login` | 1 min |
| 4 | `vercel --prod` | 2 min |
| 5 | Add 3 env vars in Vercel | 5 min |
| 6 | Test with curl | 1 min |
| 7 | Test in app | 2 min |

**Total: ~15 minutes**

---

## 🎉 After Successful Deployment

You now have:
✅ Real tracking codes (not mock)
✅ Real location storage in Firebase
✅ Multi-user tracking functional
✅ Backend fully deployed and working

**Congratulations! Your Trackify app is now FULLY FUNCTIONAL!** 🚀
