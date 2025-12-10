# Backend Changes for 5-Minute Code Expiration

The frontend mock has been updated to use 5-minute code expiration. The Vercel backend must be updated similarly to enforce this.

## Changes Required in trackify-backend/services/share-service.ts

### 1. Add Expiration Constant (Line ~30)

```typescript
// Code expiration - 5 minutes
const CODE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes = 300,000 ms
```

### 2. Update createTrackingCode() Function (Line ~35-40)

**Find:**
```typescript
const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
```

**Replace with:**
```typescript
const expiresAt = Date.now() + CODE_EXPIRATION_MS; // 5 minutes
```

### 3. Update joinWithCode() Function Validation (Line ~50-55)

**Find:**
```typescript
if (Date.now() > session.expiresAt) {
  return res.status(410).json({ success: false, error: 'Code has expired' });
}
```

**Ensure this validation remains** (it already checks expiration dynamically).

## Changes Required in trackify-backend/services/device-service.ts

### 1. Update isCodeExpired() Function (Line ~30-35)

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

### 2. Update All Calls to isCodeExpired()

**Find all calls like:**
```typescript
if (isCodeExpired(session.createdAt, 24)) {
```

**Replace with:**
```typescript
if (isCodeExpired(session.createdAt)) {
```

## Changes Required in Firestore

### Option 1: Set TTL Policy (Recommended)

In Firebase Console → Firestore:
1. Go to collection `tracking_sessions`
2. Set TTL policy on field `expiresAt`
3. This will automatically delete expired documents after 5 minutes

### Option 2: Add Scheduled Cleanup Function

Create a new endpoint in Vercel that runs periodically:

```typescript
// api/cleanup/expired-codes.ts
export default async function handler(req, res) {
  // Verify request is from Vercel cron (check authorization header)
  const db = admin.firestore();
  
  const cutoffTime = Date.now() - (5 * 60 * 1000);
  const expired = await db.collection('tracking_sessions')
    .where('expiresAt', '<', Date.now())
    .get();
  
  const batch = db.batch();
  expired.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  res.status(200).json({ deleted: expired.docs.length });
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cleanup/expired-codes",
    "schedule": "*/1 * * * *"
  }]
}
```

## Testing

1. **Frontend**: Create a tracking code → Wait 5+ minutes → Try to join with the same code
   - Expected: "Code has expired" error
   
2. **Backend**: Make POST request to `/api/share/join` with expired code
   - Expected: 410 status with "Code has expired" message

3. **Verify Consistency**: Both frontend mock and backend should reject after exactly 5 minutes

## Verification Checklist

- [ ] Updated `CODE_EXPIRATION_MS` in `share-service.ts`
- [ ] Updated `createTrackingCode()` expiration calculation
- [ ] Updated `device-service.ts` `isCodeExpired()` function
- [ ] Removed hardcoded `24` hour parameter from all `isCodeExpired()` calls
- [ ] Set up Firestore TTL or cleanup endpoint
- [ ] Tested code expiration after 5 minutes locally
- [ ] Tested code expiration on deployed backend
- [ ] Verified error message: "Code has expired"
