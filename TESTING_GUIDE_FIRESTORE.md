# 🚀 TESTING GUIDE - Firestore Real-time GPS Tracking

## 📋 Pre-Test Checklist

```
[ ] npm install sudah berhasil (tanpa error)
[ ] Firebase config valid: config/firebase-config.ts
[ ] Internet connection tersedia
[ ] Location permission akan diminta saat startup
```

---

## 🧪 Test Scenario: Device A → Device B Tracking

### Setup: Siapkan 2 Device/Emulator

**Device A** (Tracker/Sharer)
```
- Nama: "Device A" atau "HP John"
- Role: Share location
- Location: Ruang A (lat/lon1)
```

**Device B** (Tracker/Receiver)
```
- Nama: "Device B" atau "HP Budi"
- Role: Track Device A
- Location: Ruang B atau nearby
```

---

## ⚡ Step-by-Step Testing

### STEP 1: Start App on Device A (Sharer)

```
1. Run: npx expo run:android
2. App opens
3. Grant location permission
4. Tap "Share My Location" button
   └─ Enter device name: "Device A"
   └─ Tap "Generate Code"
5. Copy/note code: TRACK-ABC123
```

**Expected Result**
```
✅ Code displayed: TRACK-ABC123
✅ Notification: "Share this code with others"
✅ Location permission: Granted
✅ Console: "✅ Location synced to Firestore"
```

**Verification in Firebase Console**
```
1. Go to Firebase Console
2. Project: trackify-2025-c29e3
3. Firestore Database
4. Collection: devices
5. Document: TRACK-ABC123
6. location field
   └─ Check: latitude, longitude, timestamp, accuracy
```

---

### STEP 2: Start Background Tracking (Device A)

Device A harus aktif upload lokasi ke Firestore.

```
On Device A:
1. Tap "Background tracking" → "Start"
   ✓ Shows: "Running in background when permission is granted"
2. Keep app open for 10 seconds
   └─ Each 5 seconds: location updates
3. Check console:
   └─ Log message: "✅ Location synced to Firestore"
```

**Expected Result**
```
✅ Background tracking active
✅ Console logs location uploads every 5 seconds
✅ Firestore `/devices/TRACK-ABC123/location` updates
```

---

### STEP 3: Start App on Device B (Tracker)

```
1. On different device/emulator
2. Run same app: npx expo run:android
3. Grant location permission
4. DON'T tap "Share My Location"
5. Scroll down to "Track Someone" section
6. Tap "Enter Code" button
```

---

### STEP 4: Join Tracking Session (Device B)

```
On Device B:
1. Modal appears: "Track Someone's Location"
2. Paste/enter code: TRACK-ABC123
3. Tap "Start Tracking"
4. Check results:
   ✓ Device A appears in list?
   ✓ Location visible?
   ✓ Coordinates display?
```

**Expected Result**
```
✅ Code accepted
✅ Device listed: "Device A" with code TRACK-ABC123
✅ Location shows: Latitude, Longitude, Timestamp
✅ Status shows time: "2 minutes ago" or "just now"
```

---

### STEP 5: Verify Real-time Sync (Device B)

```
On Device B:
1. Watch "Tracked Devices" list
2. Move Device A (physical movement or change location manually)
3. Location should update every 3 seconds
4. Check map:
   ✓ Marker for Device A appears?
   ✓ Position updates?
   ✓ Path/trail visible?
```

**Expected Result**
```
✅ Location refreshes every 3 seconds
✅ Coordinates change as Device A moves
✅ Timestamp updates: "just now"
✅ Map shows marker with latest position
```

---

## 🔍 Detailed Test Cases

### Test Case 1: Basic Code Sharing

**Step**
```
Device A: Share location → Generate code: TRACK-ABC123
Device B: Track someone → Enter TRACK-ABC123
```

**Pass Criteria**
```
✅ Code generated successfully
✅ Device B can find Device A
✅ Location visible on Device B
```

**Fail Scenarios**
```
❌ Code not found
   → Check: Code entered exactly (uppercase)
   → Check: Not expired (< 5 minutes)
   
❌ Wrong location
   → Check: Device A location actually updated
   → Check: Firebase location document exists
   
❌ Permission error
   → Check: Location permission granted on both devices
```

---

### Test Case 2: Multiple Tracked Devices

**Step**
```
Device A: Generate code → TRACK-AAA111
Device B: Track Device A
Device C: Generate code → TRACK-CCC333
Device B: Track Device C (now tracks 2 devices)
```

**Pass Criteria**
```
✅ Device B shows 2 tracked devices
✅ Both locations visible
✅ Both on map with different colors
✅ Real-time updates for both
```

---

### Test Case 3: Continuous Tracking

**Step**
```
1. Setup: Device A sharing, Device B tracking
2. Move Device A significantly (> 50 meters)
3. Wait 5 seconds
4. Check Device B map
5. Repeat movement test 5 times
```

**Pass Criteria**
```
✅ Every movement reflected on map within 5 seconds
✅ Path trail shows movement history
✅ No lag or stale data
✅ Coordinates accuracy within 10 meters
```

---

### Test Case 4: Background Persistence

**Step**
```
1. Device A: Start background tracking
2. Device B: Join tracking
3. Minimize app on Device B (app goes background)
4. Wait 30 seconds
5. Open Device B app again
6. Check location
```

**Pass Criteria**
```
✅ Location updated while app was in background
✅ No crashes on resume
✅ Last known location displayed
✅ Real-time sync resumes
```

---

## 📊 Performance Metrics to Track

| Metric | Target | Check |
|--------|--------|-------|
| Code generation | < 1 sec | Time from tap to code display |
| Location upload | Every 5 sec | Check Firebase timestamps |
| Location fetch | < 1 sec | App -> Firebase -> Display |
| Map render | < 500ms | Marker appears on map |
| Update frequency | Every 3 sec | Coordinates refresh rate |
| Accuracy | < 20 meters | GPS accuracy value |

---

## 🐛 Common Issues & Fixes

### Issue 1: "Firebase API Error"
```
Error: 401 Unauthorized

Fix:
1. Check Firebase API Key in config/firebase-config.ts
2. Verify Firestore Database exists
3. Check Security Rules allow read/write
4. Restart app
```

### Issue 2: "Code Expired"
```
Error: Code not found or expired

Fix:
1. Code valid for 5 minutes only
2. Device A must generate new code
3. Ensure no clock skew between devices
```

### Issue 3: "Location Not Updating"
```
Issue: Coordinates frozen, timestamp old

Fix:
1. Check GPS is enabled on Device A
2. Ensure app has location permission
3. Device A must be outdoors (for better GPS)
4. Check network connection
5. Restart location tracking
```

### Issue 4: "Map Shows No Markers"
```
Issue: Map blank or empty

Fix:
1. Zoom out (map may be zoomed wrong location)
2. Check Firestore has location data
3. Ensure Device B has tracked devices added
4. Check browser console for WebView errors
5. Restart app
```

---

## 🔧 Debug Logging

Enable detailed logs:

**In location-tracking.ts:**
```typescript
console.log('✅ Location synced to Firestore:', point.deviceId);
console.log('📍 Location stored:', { latitude, longitude });
```

**In index.tsx:**
```typescript
console.log('🔄 Refreshing tracked devices:', trackedDevices);
console.log('📍 Fetched location:', location);
```

**Check logs:**
```bash
npx expo logs
# or
adb logcat | grep "Trackify"
```

---

## 📝 Test Report Template

```markdown
## Test Report - [Date]

### Environment
- Device A: [Android/iOS] [Version]
- Device B: [Android/iOS] [Version]
- App Version: 1.0.0
- Firebase Project: trackify-2025-c29e3

### Test Results

#### Test 1: Basic Code Sharing
- [ ] Pass
- [ ] Fail
- Notes: _________________

#### Test 2: Real-time Sync
- [ ] Pass
- [ ] Fail
- Notes: _________________

#### Test 3: Multiple Devices
- [ ] Pass
- [ ] Fail
- Notes: _________________

### Issues Found
1. _________________
2. _________________

### Performance
- Code generation: ___ ms
- Location update: ___ sec
- Map render: ___ ms

### Conclusion
[PASS / FAIL]
```

---

## ✅ Success Criteria

App is **READY FOR PRODUCTION** when:

```
✅ Device A generates tracking code in < 1 second
✅ Device B joins with code in < 1 second
✅ Location uploads every 5 seconds (foreground)
✅ Location updates visible on Device B every 3 seconds
✅ Map displays tracked devices with current position
✅ Works with multiple devices simultaneously
✅ No crashes or hangs
✅ Handles network errors gracefully
✅ Location accuracy within 20 meters
✅ Battery impact < 10% per hour (background tracking)
```

---

**Ready to test? Run:**
```bash
npx expo run:android
```

Good luck! 🚀
