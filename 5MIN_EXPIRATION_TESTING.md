# 5-Minute Code Expiration - Testing Guide

## 🧪 Quick Test (Frontend Only)

Test with mock backend to verify 5-minute expiration works.

### Prerequisites
```bash
cd d:\User\Documents\2025\SEM5\BERGERAK\UAS\Trackify

# Ensure mock backend is enabled
# In services/backend-api-service.ts, verify:
const USE_MOCK_BACKEND = false;  # Uses backend, falls back to mock
```

### Test Steps

**Step 1: Start the app**
```bash
npx expo start
# Or: npm start
```

**Step 2: Test "Share My Location" (Create Code)**
1. Open Trackify app
2. Click "Share My Location" button
3. Copy the code shown (e.g., `TRACK-ABC123`)
4. Note the creation time (check console logs)

**Step 3: Test Code Validation Immediately (Should Work)**
1. Click "Track Someone" button
2. Paste the code
3. Click "Join"
4. ✅ Expected: Tracking starts successfully

**Step 4: Wait 5+ Minutes**
1. Wait at least 5 minutes (300 seconds)
2. Note the exact time when 5 minutes is up

**Step 5: Test Code Validation After Expiration (Should Fail)**
1. Click "Track Someone" button again
2. Paste the same code
3. Click "Join"
4. ❌ Expected Error: "Code has expired"

---

## 🔍 Console Logging Test

Monitor what happens in the console.

### Steps

1. Open your terminal where `expo start` is running
2. Check for these log messages:

**Creating Code (Immediate)**
```
✅ Location stored in mock (demo mode)
```

**Validating Code - Before 5 Minutes**
```
📍 No location in mock storage for code: TRACK-ABC123
  or
📍 Location loaded from mock (demo mode)
```

**Validating Code - After 5 Minutes**
```
Code has expired
```

---

## ⏱️ Accurate Timing Test

Test with exact timestamps to verify 5-minute window.

### Test Case

**Setup:**
```typescript
// In services/backend-api-service.ts, add debug logging:
console.log('⏱️ Created at:', new Date().toISOString());
console.log('⏱️ Expires at:', new Date(expiresAt).toISOString());
console.log('⏱️ TTL:', (expiresAt - Date.now()) / 1000, 'seconds');
```

**Expected Output:**
```
⏱️ Created at: 2025-12-10T10:00:00Z
⏱️ Expires at: 2025-12-10T10:05:00Z
⏱️ TTL: 300 seconds
```

**Validation Test:**
```typescript
// Add to joinWithCode before rejection:
const remainingMs = (device.createdAt + CODE_EXPIRATION_MS) - Date.now();
console.log('⏱️ Code expires in:', remainingMs / 1000, 'seconds');
if (remainingMs < 0) {
  console.log('❌ Code expired:', Math.abs(remainingMs) / 1000, 'seconds ago');
}
```

---

## 🔄 Repeat Test

Run the test multiple times to ensure consistency.

### Test Matrix

| Test # | Code | Wait | Result | Status |
|--------|------|------|--------|--------|
| 1 | ABC123 | 0 sec | ✅ Works | Pass |
| 1 | ABC123 | 5 min | ❌ Expired | Pass |
| 2 | DEF456 | 0 sec | ✅ Works | Pass |
| 2 | DEF456 | 5 min | ❌ Expired | Pass |
| 3 | GHI789 | 0 sec | ✅ Works | Pass |
| 3 | GHI789 | 5 min | ❌ Expired | Pass |

**Expected:** All should pass ✅

---

## 🌐 Backend Testing (After Backend Deployment)

Once backend is updated with 5-minute expiration:

### API Test Using curl

**Create a code:**
```bash
curl -X POST https://trackify-orcin.vercel.app/api/share/create \
  -H "Content-Type: application/json" \
  -d '{"deviceName": "Test Device"}'
```

**Response (immediately):**
```json
{
  "success": true,
  "code": "TRACK-ABC123",
  "deviceSecret": "...",
  "expiresAt": 1702756500000,
  "message": "..."
}
```

**Calculate expiration:**
```javascript
const expiresAt = 1702756500000;
const expiresInMs = expiresAt - Date.now();
const expiresInMinutes = expiresInMs / (60 * 1000);
console.log(`Expires in ${expiresInMinutes.toFixed(1)} minutes`);
// Should output: "Expires in ~5.0 minutes"
```

**Try to join immediately:**
```bash
curl -X POST https://trackify-orcin.vercel.app/api/share/join \
  -H "Content-Type: application/json" \
  -d '{"code": "TRACK-ABC123"}'
```

**Response (immediately):**
```json
{
  "success": true,
  "code": "TRACK-ABC123",
  "deviceName": "Test Device",
  "createdAt": 1702756200000,
  "expiresAt": 1702756500000
}
```

**Wait 5 minutes, then try again:**
```bash
# Wait 300+ seconds...
curl -X POST https://trackify-orcin.vercel.app/api/share/join \
  -H "Content-Type: application/json" \
  -d '{"code": "TRACK-ABC123"}'
```

**Response (after expiration):**
```json
{
  "success": false,
  "error": "Code has expired"
}
```

✅ **Test passes if you get 410 status with "Code has expired"**

---

## 📝 Test Checklist

### Frontend Expiration
- [ ] Create code works immediately
- [ ] Can join with code immediately
- [ ] Code rejected after 5+ minutes
- [ ] Error message shows "Code has expired"
- [ ] Can create and use new code (repeated)

### Backend Expiration (After Deployment)
- [ ] Backend returns ~5 minute TTL in `expiresAt`
- [ ] Can join code immediately via API
- [ ] Code rejected after 5+ minutes via API
- [ ] HTTP 410 status returned with error
- [ ] Error message: "Code has expired"

### Firestore Cleanup
- [ ] TTL policy configured OR cron setup working
- [ ] Old codes cleaned up (check after 5-24 hours)
- [ ] Database size stable (not growing indefinitely)

### End-to-End
- [ ] Frontend app uses live backend (not mock)
- [ ] Create code in app → Code expires after 5 min
- [ ] Other user tries code after 5 min → "Code has expired"
- [ ] Can create new code immediately after

---

## 🐛 Debugging

### Code Not Expiring After 5 Minutes?

**Check 1: Verify CODE_EXPIRATION_MS**
```typescript
// services/backend-api-service.ts, line 23
const CODE_EXPIRATION_MS = 5 * 60 * 1000; // Should be 300000
console.log('CODE_EXPIRATION_MS:', CODE_EXPIRATION_MS);
```

**Check 2: Verify Expiration Check**
```typescript
// services/backend-api-service.ts, line 169-171
if (Date.now() > device.createdAt + CODE_EXPIRATION_MS) {
  reject(new Error('Code has expired'));
}
```

**Check 3: Verify Time Sync**
```javascript
// Check if device time is correct
console.log('Current time:', new Date().toISOString());
// Should match actual time
```

**Check 4: Verify Mock Backend is Used**
```typescript
// Check which backend is being used
const USE_MOCK_BACKEND = false; // Should be false for live backend
const API_BASE_URL = __DEV__ ? LOCAL_BACKEND_URL : VERCEL_BACKEND_URL;
console.log('Using backend:', API_BASE_URL);
```

### Backend Returning 24-Hour Expiration?

The backend is still using old constant. Check backend file:
```typescript
// trackify-backend/src/services/share-service.ts
// Should have:
const CODE_EXPIRATION_MS = 5 * 60 * 1000;
// NOT:
const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
```

### Errors in Console?

**Error: "Code not found or expired"**
- Code hasn't been created yet
- Or code was deleted from mock storage (app restart)
- Solution: Create new code again

**Error: "Invalid code or secret"**
- Device secret mismatch
- Code created with different app instance
- Solution: Use code from same device that created it

**Error: "Code has expired"**
- ✅ Working correctly! Code expired after 5 minutes

---

## ✅ Success Criteria

Test is **PASSED** when:

1. ✅ Code can be used immediately after creation
2. ✅ Code is rejected with "Code has expired" after 5+ minutes
3. ✅ Multiple codes can be created in sequence
4. ✅ Each code gets independent 5-minute window
5. ✅ No time-zone or date issues (uses millisecond timestamps)

---

## 📋 Test Report Template

```
Date: 2025-12-10
Tester: [Your Name]

Frontend Mock Test:
- Created code: TRACK-ABC123
- Creation time: 2025-12-10 10:00:00
- Joined immediately: ✅ SUCCESS
- Waited 5 minutes
- Tried to join: ❌ FAILED (as expected)
- Error message: "Code has expired" ✅

Backend API Test:
- Created code: TRACK-DEF456
- Expiration time: 2025-12-10 10:05:00
- Joined immediately: ✅ SUCCESS
- Waited 5 minutes
- HTTP Status: 410 ✅
- Error message: "Code has expired" ✅

Overall Result: ✅ ALL TESTS PASSED
```

---

Ready to test! Run through the Quick Test above and share results. 🚀
