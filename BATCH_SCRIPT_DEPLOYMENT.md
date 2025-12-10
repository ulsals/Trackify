# 🚀 Deployment Using Batch Script

PowerShell execution policy is blocking npm. Use this batch script instead (easier!).

---

## ✅ Step 1: Run Deployment Batch Script

**Location:** `D:\User\Documents\2025\SEM5\BERGERAK\UAS\trackify-backend\deploy.bat`

### How to Run:

**Option A: Double-click the file**
- Open File Explorer
- Navigate to: `D:\User\Documents\2025\SEM5\BERGERAK\UAS\trackify-backend\`
- Find: `deploy.bat`
- Double-click it
- Command Prompt window will open automatically

**Option B: From Command Prompt**
```cmd
D:
cd D:\User\Documents\2025\SEM5\BERGERAK\UAS\trackify-backend
deploy.bat
```

### What the Script Does:

1. ✓ `npm install` - Installs backend dependencies
2. ✓ `npm install -g vercel` - Installs Vercel CLI
3. ✓ `vercel login` - Opens browser to login to Vercel
4. ✓ `vercel --prod` - Deploys to production

**Each step will pause and wait for you to confirm before proceeding.**

---

## 📋 During Deployment

### Step 1: npm install
- Takes ~2-3 minutes
- Wait for completion
- Press any key to continue

### Step 2: npm install -g vercel
- Installs Vercel CLI
- Takes ~1 minute
- Press any key to continue

### Step 3: vercel login
- **A browser window will open**
- Login with:
  - GitHub account, OR
  - Email (sign up if needed)
- After login, return to command prompt
- Press any key to continue

### Step 4: vercel --prod
- Deploys your backend to Vercel
- Takes ~3-5 minutes
- Watch for output like:
  ```
  ✓ Production: https://trackify-orcin.vercel.app
  ```

**IMPORTANT:** Note the URL! You'll need it.

---

## ✅ After Deployment Completes

### What You Should See:

```
✓ Production: https://trackify-orcin.vercel.app [Ready]
```

Or similar with your project URL.

### Next Steps:

1. Go to: https://vercel.com/dashboard
2. Click project: `trackify-orcin`
3. Go to: Settings → Environment Variables
4. Add 3 variables (see next section)

---

## 🔐 Step 2: Add Environment Variables in Vercel Dashboard

**After deployment script finishes:**

1. Open browser: https://vercel.com/dashboard
2. Click on project: **trackify-orcin**
3. Top menu: Click **"Settings"**
4. Left sidebar: Click **"Environment Variables"**

### Add Variable 1: FIREBASE_PROJECT_ID

```
Name: FIREBASE_PROJECT_ID
Value: trackify-2025-c29e3
```

Click "Add"

### Add Variable 2: FIREBASE_CLIENT_EMAIL

```
Name: FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-fbsvc@trackify-2025-c29e3.iam.gserviceaccount.com
```

Click "Add"

### Add Variable 3: FIREBASE_PRIVATE_KEY

⚠️ **IMPORTANT:** This is a multi-line key. Paste EXACTLY as is.

```
Name: FIREBASE_PRIVATE_KEY
Value: [Paste entire private key from your service account JSON]
```

The key should start with: `-----BEGIN PRIVATE KEY-----`
And end with: `-----END PRIVATE KEY-----`

Click "Add"

### After Adding All 3:

Vercel will **automatically redeploy** with the new environment variables.

Wait for deployment to complete (green checkmark).

---

## 🧪 Step 3: Test Backend

Open Command Prompt and run:

```cmd
curl -X POST https://trackify-orcin.vercel.app/api/share/create ^
  -H "Content-Type: application/json" ^
  -d "{\"deviceName\":\"Test Device\"}"
```

### Expected Response:

```json
{
  "success": true,
  "code": "TRACK-XXXXXX",
  "deviceSecret": "...",
  "expiresAt": 1702756500000,
  "message": "..."
}
```

### If You Get Error:

- **500 error** → Environment variables not set correctly (check Vercel)
- **404 Not Found** → Deployment failed (check Vercel logs)
- **Connection timeout** → Check Vercel URL is correct

---

## ✅ Step 4: Test in Trackify App

```cmd
cd D:\User\Documents\2025\SEM5\BERGERAK\UAS\Trackify
npx expo start
```

Then in the app:

1. Click "Share My Location"
2. Check if it shows **REAL tracking code** (format: `TRACK-XXXXXX`)
3. Check console - should NOT show "using mock"

**If successful:**
- ✅ Backend is working!
- ✅ Real tracking enabled!
- ✅ Deployment complete!

---

## 📋 Checklist

- [ ] Run `deploy.bat` script
- [ ] Script shows "Production: https://trackify-orcin.vercel.app"
- [ ] Add 3 environment variables in Vercel
- [ ] curl test returns real tracking code
- [ ] App shows real code (not mock)

---

## 🎯 Timeline

- deploy.bat: 8-10 minutes
- Add env vars: 5 minutes
- Test: 5 minutes

**Total: ~20 minutes** → Fully deployed! ✅

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Script won't run | Use Command Prompt, not PowerShell |
| npm command not found | Check Node.js is installed: `node --version` |
| vercel login fails | Check internet connection |
| Deployment shows error | Check backend code (it's usually environment variables) |
| curl test fails | Verify Vercel URL, wait for deployment to complete |

---

Ready? Run `deploy.bat` now! 🚀
