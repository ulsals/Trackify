# Backend Implementation: 5-Minute Code Expiration

This guide provides step-by-step instructions to update your Vercel backend for 5-minute tracking code expiration.

## 📋 Overview

The frontend (Trackify app) has been updated to use 5-minute code expiration. The backend must also enforce this 5-minute TTL to ensure security and consistency.

**What needs to change:**
- Code expiration constant: 24 hours → 5 minutes
- Firestore document cleanup (automatic deletion or manual cleanup)
- Backend validation logic remains the same (just different TTL)

---

## 🔧 Step 1: Update `share-service.ts`

### File Location
```
trackify-backend/src/services/share-service.ts
```

### Change 1: Add Expiration Constant (Top of file, ~line 5)

**Find this section:**
```typescript
import { db, admin } from '../config/firebase';

// ... other imports
```

**Add after imports:**
```typescript
// Code expiration - 5 minutes
const CODE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes = 300,000 ms
```

### Change 2: Update `createTrackingCode()` Function

**Find:**
```typescript
const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
```

**Replace with:**
```typescript
const expiresAt = Date.now() + CODE_EXPIRATION_MS; // 5 minutes
```

**Search for all occurrences** - there may be multiple places using `24 * 60 * 60 * 1000`.

### Change 3: Verify Validation Logic

The validation in `joinWithCode()` should already check expiration:

```typescript
if (Date.now() > session.expiresAt) {
  return res.status(410).json({ success: false, error: 'Code has expired' });
}
```

✅ **No change needed** - this logic works with any expiration time.

---

## 🔧 Step 2: Update `device-service.ts`

### File Location
```
trackify-backend/src/services/device-service.ts
```

### Change 1: Update `isCodeExpired()` Function

**Find:**
```typescript
export function isCodeExpired(createdAt: number, hoursThreshold: number = 24): boolean {
  const ageInHours = (Date.now() - createdAt) / (1000 * 60 * 60);
  return ageInHours > hoursThreshold;
}
```

**Replace with:**
```typescript
export function isCodeExpired(createdAt: number): boolean {
  const CODE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
  return Date.now() > createdAt + CODE_EXPIRATION_MS;
}
```

### Change 2: Update All Calls to `isCodeExpired()`

**Search for all calls** like:
```typescript
if (isCodeExpired(session.createdAt, 24)) {
```

**Replace with:**
```typescript
if (isCodeExpired(session.createdAt)) {
```

**Common locations:**
- Location update validation endpoint
- Device tracking endpoint
- Session active check function

---

## 🔧 Step 3: Configure Firestore Cleanup

### Option A: Firestore TTL Policy (RECOMMENDED - Easier)

This automatically deletes expired documents.

**Steps:**
1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your Trackify project
3. Go to **Cloud Firestore** → Collections
4. Find collection: `tracking_sessions`
5. Click **⋮ (three dots)** → **TTL**
6. Select field: **`expiresAt`**
7. Enable TTL - documents will auto-delete when `expiresAt` timestamp passes

**Pros:** Automatic, no code needed
**Cons:** 24-hour delay before deletion (Firestore standard)

---

### Option B: Scheduled Cleanup Function (More Control)

Create a cron-triggered cleanup endpoint that runs every minute.

**Step 1: Create new file**

```
trackify-backend/src/api/cron/cleanup-expired-codes.ts
```

**Step 2: Add cleanup function**

```typescript
import { Response } from 'express';
import { db, admin } from '../../config/firebase';

export default async function handler(req: any, res: Response) {
  // Verify request is from Vercel cron
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.CRON_SECRET;
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = Date.now();
    
    // Find all expired codes
    const expiredSnapshot = await db.collection('tracking_sessions')
      .where('expiresAt', '<', now)
      .get();
    
    console.log(`Found ${expiredSnapshot.docs.length} expired codes to delete`);
    
    // Delete in batches
    const batch = db.batch();
    let count = 0;
    
    expiredSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      count++;
      
      // Firestore has 500 doc limit per batch
      if (count === 500) {
        batch.commit();
        count = 0;
      }
    });
    
    // Commit remaining
    if (count > 0) {
      await batch.commit();
    }
    
    res.status(200).json({ 
      success: true, 
      deletedCount: expiredSnapshot.docs.length 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
}
```

**Step 3: Register cron in `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-codes",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

**Step 4: Add environment variable**

In Vercel project settings:
- Name: `CRON_SECRET`
- Value: Generate a random string (e.g., `your-secret-token-here`)

**Pros:** Runs frequently (every minute), more control
**Cons:** Requires additional code and environment variable

---

## 📝 Testing Checklist

After implementing changes:

### 1. Local Testing
```bash
# Test with mock backend first
cd trackify && npm run start

# Create code → Wait 5+ minutes → Try to join
# Expected error: "Code has expired"
```

### 2. Backend Testing

Test the Vercel backend API:

```bash
# Create a tracking code
curl -X POST https://your-backend.vercel.app/api/share/create \
  -H "Content-Type: application/json" \
  -d '{"deviceName": "Test Device"}'

# Response:
# {
#   "success": true,
#   "code": "TRACK-ABC123",
#   "expiresAt": 1702756500000,
#   ...
# }

# Wait 5 minutes (300000ms), then try to join
curl -X POST https://your-backend.vercel.app/api/share/join \
  -H "Content-Type: application/json" \
  -d '{"code": "TRACK-ABC123"}'

# Expected after 5 min:
# {
#   "success": false,
#   "error": "Code has expired"
# }
```

### 3. End-to-End Testing

1. Build Trackify app: `npx expo run:android`
2. Use "Share My Location" button
3. Note the expiration time from response
4. Wait exactly 5 minutes
5. Try to use code in "Track Someone" 
6. Verify error: "Code has expired"

---

## 🚀 Deployment Steps

### 1. Update Code Files

Apply all changes from Steps 1-2 above to your trackify-backend repository.

### 2. Choose Cleanup Strategy

- **TTL Policy** (easier): Configure in Firebase Console
- **Cron Function** (recommended): Add code + update vercel.json

### 3. Deploy to Vercel

```bash
cd trackify-backend
vercel --prod
```

### 4. Verify Environment Variables

If using cron cleanup:
- Add `CRON_SECRET` to Vercel project settings
- Verify with: `curl https://your-backend.vercel.app/api/cron/cleanup-expired-codes`

### 5. Monitor Logs

In Vercel dashboard:
- Check function logs for successful deployment
- Monitor cron execution (if using Option B)
- Look for "Code has expired" errors (indicates working validation)

---

## 🔍 Verification

After deployment, verify the changes:

### Check Backend Returns Correct Expiration

```typescript
const response = await fetch('https://your-backend.vercel.app/api/share/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ deviceName: 'Test' })
});

const data = await response.json();
const expiresInMs = data.expiresAt - Date.now();
const expiresInMinutes = expiresInMs / (60 * 1000);

console.log(`Code expires in ${expiresInMinutes} minutes`); 
// Should print: "Code expires in ~5 minutes"
```

### Check Expiration Validation Works

Wait 5 minutes, then:

```typescript
const response = await fetch('https://your-backend.vercel.app/api/share/join', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'TRACK-ABC123' })
});

const data = await response.json();
console.log(data); 
// Should show: { "success": false, "error": "Code has expired" }
```

---

## ⚠️ Important Notes

1. **Time Sync**: Ensure backend server time is synchronized (check NTP)
2. **Firestore TTL**: Has ~24-hour delay, not instant
3. **Cron Cleanup**: Runs every minute, expired codes deleted within 1 minute
4. **Test Thoroughly**: Before deploying to production, test locally with mock backend first
5. **Monitor**: Check Vercel logs after deployment to catch any errors

---

## 📞 Troubleshooting

### Codes not expiring after 5 minutes?
- Check `CODE_EXPIRATION_MS` value is 300,000
- Verify server time is correct (NTP sync)
- Check logs for validation logic errors

### "isCodeExpired not found"?
- Ensure function signature changed (removed `hoursThreshold` parameter)
- Check all callers updated to new signature

### Cron not running?
- Check `vercel.json` syntax is valid
- Verify `CRON_SECRET` environment variable exists
- Check Vercel cron logs in project settings

### Too many documents in Firestore?
- Enable TTL policy as backup (auto-cleanup in 24h)
- Run manual cleanup: Delete all docs with `expiresAt < now()`
- Check query for performance issues

---

## Summary

| Component | Change | File |
|-----------|--------|------|
| Expiration constant | 24h → 5min | `share-service.ts` |
| Code creation | Use new constant | `share-service.ts` |
| Device service | Remove hours parameter | `device-service.ts` |
| Cleanup | Setup TTL or cron | Firebase Console or `cron/cleanup-*.ts` |
| Testing | Verify 5-min expiration | Manual or curl |

After completing all steps, both frontend and backend will enforce 5-minute code expiration consistently! 🎉
