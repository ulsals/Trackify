# Firebase Integration Testing Guide

## Quick Start Testing

### Prerequisites
- Two Android devices/emulators OR one device + one emulator
- Trackify app installed on both
- Location permissions granted
- Internet connection

---

## Test Case 1: Device Code Generation ✅

### Goal
Verify device code is automatically generated on first launch

### Steps
1. **Fresh Install (Clear Data):**
   - Uninstall app from device
   - Reinstall from Android Studio

2. **Launch App:**
   - Open Trackify app
   - Grant location permissions

3. **Verify Device Code Generated:**
   - Open browser DevTools or console log viewer
   - Look for: `✅ Generated new device code: TRACK-XXXXXXX`
   - Note the code (e.g., `TRACK-A7F9K2L`)

4. **Verify Persistence:**
   - Close and reopen app
   - Should see same code (not regenerated)
   - Console should NOT show generation message again

### Expected Results
```
✅ Generated new device code: TRACK-A7F9K2L  (first run)
[App closed and reopened]
✅ Tracking config set: TRACK-A7F9K2L  (reused same code)
```

---

## Test Case 2: Auto-Upload to Firestore ✅

### Goal
Verify GPS location uploads automatically to Firestore

### Prerequisites
- Device code generated (from Test Case 1)
- Device has GPS fix
- Internet connection active

### Steps
1. **Enable Foreground Tracking:**
   - Open Trackify app
   - Verify location permission granted
   - Check "Start" in Background tracking section (if available)

2. **Wait for Location Update:**
   - Stand still for 30 seconds (let GPS stabilize)
   - Watch console for upload logs

3. **Check Firestore Console:**
   - Go to https://console.firebase.google.com
   - Select project: `trackify-2025-c29e3`
   - Go to Firestore Database
   - Navigate to: `devices` → `{your-device-code}` → `location`
   - Should see:
     ```
     latitude: 6.2088 (example)
     longitude: 106.8456 (example)
     timestamp: 1702670400000
     accuracy: 5.2
     ```

4. **Watch for Real-time Updates:**
   - Walk around slowly
   - Firestore data should update every 5 seconds
   - Console should show: `✅ Location uploaded to Firestore: TRACK-XXXXXXX`

### Expected Console Logs
```
✅ Generated new device code: TRACK-ABC123
✅ Tracking config set: TRACK-ABC123
🕐 Foreground tracking started
✅ Location uploaded to Firestore: TRACK-ABC123
✅ Location uploaded to Firestore: TRACK-ABC123
✅ Location uploaded to Firestore: TRACK-ABC123
```

### Expected Firestore Data
```json
{
  "latitude": {
    "doubleValue": -6.2088
  },
  "longitude": {
    "doubleValue": 106.8456
  },
  "timestamp": {
    "integerValue": "1702670400000"
  },
  "accuracy": {
    "doubleValue": 5.2
  }
}
```

---

## Test Case 3: Fetch Location from Firestore ✅

### Goal
Verify ability to fetch tracked device location from Firestore

### Prerequisites
- Test Case 2 completed (data in Firestore)
- Device code from Test Case 1
- Second device/emulator available

### Steps (Using Android Studio Console)
1. **Open Android Studio Console:**
   - Android Studio → Logcat

2. **Run Fetch Test:**
   ```typescript
   // From Android Studio console or add to app temporarily
   import { fetchLocationByCode } from '@/services/firestore-service';
   import { getDefaultProjectId, getDefaultApiKey } from '@/config/firebase-helper';
   
   const location = await fetchLocationByCode(
     'TRACK-ABC123',  // Your device code from Test Case 1
     getDefaultProjectId(),
     getDefaultApiKey()
   );
   console.log('Fetched location:', location);
   ```

3. **Expected Output:**
   ```
   Fetched location: {
     latitude: -6.2088,
     longitude: 106.8456,
     timestamp: 1702670400000,
     accuracy: 5.2
   }
   ```

### Alternative Test (UI-based)
If Test Case 4 (tracking) is completed, you'll see location fetched in real-time.

---

## Test Case 4: Real-time Location Tracking (2 Devices) ✅⭐

### Goal
Track location of Device A on Device B in real-time

### Prerequisites
- Device A: Trackify installed, device code available (Test Case 1-2)
- Device B: Trackify installed, blank
- Device A is actively tracking (location uploading to Firestore)
- Device A code written down (e.g., `TRACK-ABC123`)

### Steps

#### Device A Setup (Source)
1. Open Trackify app
2. Grant location permissions when prompted
3. View screen should show:
   - Battery optimization bar
   - Background tracking panel (with Start/Stop)
   - Share Location button
   - "Track Someone" section (empty state)
   - Map showing your blue marker
4. **Copy your device code from logs or UI** (if displayed)
   - Example: `TRACK-A7F9K2L`
5. Walk around for 1-2 minutes to generate GPS trail

#### Device B Setup (Tracker)
1. Open Trackify app
2. Grant location permissions when prompted
3. View same screen as Device A (empty tracked devices)
4. **Click "Add" button** in "Track Someone" section
5. **Enter Device A's code:**
   - Code field: `TRACK-A7F9K2L` (from Device A)
   - Display name: `John's Phone` (or any name)
6. **Verify tracking started:**
   - Device B should show new card with Device A info
   - Status indicator should be GREEN (active)
   - Location coordinates displayed
   - Timestamp shows when last updated

#### Real-time Updates
7. **On Device A:** Walk around slowly
8. **On Device B:** Watch for:
   - Location coordinates changing every 3-5 seconds
   - Timestamp updating
   - Blue marker (your location) on map
   - Orange marker (Device A) on map moving in real-time
9. **Click Refresh button** to force immediate update

### Expected UI on Device B
```
Track Someone
+ Add

Card: John's Phone
Code: TRACK-A7F9K2L
Status: 🟢 (Green dot)
Location: -6.2088, 106.8456
Updated: 2:45:30 PM
Status: Active now

[Refresh Locations button]

[Map shows both locations]
- Blue marker: Your location
- Orange marker: John's location
```

### Expected Console Logs
```
📥 Fetching location from Firestore... { code: 'TRACK-A7F9K2L' }
✅ Location fetched from Firestore: { latitude: ..., longitude: ... }
📥 Fetching location from Firestore... { code: 'TRACK-A7F9K2L' }
✅ Location fetched from Firestore: { latitude: ..., longitude: ... }
[repeats every 3 seconds]
```

---

## Test Case 5: Multiple Tracked Devices ✅

### Goal
Track 2+ devices on single Device C

### Prerequisites
- Test Case 4 completed (Device B tracking Device A)
- Device C available
- Device A still actively tracking
- Device B device code available

### Steps
1. **On Device C:** Add Device A:
   - Code: `TRACK-A7F9K2L`
   - Name: `John's Phone`

2. **On Device C:** Add Device B:
   - Code: `TRACK-B5K2M9P` (Device B's code)
   - Name: `Sarah's Phone`

3. **Verify on Map:**
   - Should see 3 locations:
     - Blue: Your location (Device C)
     - Orange: Device A location
     - Orange: Device B location (different color optional)
   
4. **Click Refresh:** All locations update simultaneously

### Expected Map
```
Blue marker (You)
Orange marker (John) — updating every 3 sec
Orange marker (Sarah) — updating every 3 sec
```

---

## Test Case 6: Map Display ✅

### Goal
Verify tracked locations display correctly on map

### Prerequisites
- Test Case 4 completed
- Tracked device showing location

### Steps
1. **Open Trackify app** with Device A tracked
2. **Scroll down to Map section**
3. **Verify:**
   - Blue marker: Your current location
   - Orange marker: Device A location
   - Map is interactive (pinch-zoom works)
   - Markers update position in real-time

4. **Test Map Features:**
   - Zoom in/out with pinch gesture
   - Pan map with drag
   - Blue marker follows your movement
   - Orange marker follows Device A movement

### Expected Map Behavior
```
Initial state:
- Blue marker center of map
- Orange marker visible (or off-screen if far)

After moving:
- Blue marker updates to new position
- Map stays centered on blue marker
- Orange marker updates independently

After Device A moves:
- Orange marker updates to new position
- Can be in different screen area from blue
```

---

## Test Case 7: Stop Tracking ✅

### Goal
Verify ability to remove tracked device

### Prerequisites
- Test Case 4 completed
- Device being tracked

### Steps
1. **On tracker device:** Long-press or click ✕ on tracked device card
2. **Confirm:** Tap "Stop Tracking" in alert
3. **Verify:**
   - Card removed from list
   - Message returns: "No devices being tracked yet"
   - Orange marker disappears from map

### Expected Behavior
```
Before:
[Card showing John's Phone]
[Map showing both markers]

After stop:
No devices being tracked yet.
[Only blue marker on map]
```

---

## Test Case 8: Offline/Network Loss ✅

### Goal
Verify app handles network disconnection gracefully

### Prerequisites
- Test Case 4 completed
- Tracked device showing location

### Steps
1. **On tracker device:** Disable internet
   - Settings → Wi-Fi: OFF
   - Settings → Mobile Data: OFF (if available)

2. **Wait 30 seconds**

3. **Verify:**
   - Last known location still displays (doesn't disappear)
   - No crash or error message
   - Console shows fetch errors (expected)

4. **Re-enable internet**

5. **Verify:**
   - Location updates resume
   - Updates every 3 seconds again

### Expected Console Logs
```
[Internet disabled]
⚠️ Firestore fetch failed: Network error
[repeats every 3 seconds with same error]

[Internet re-enabled]
📥 Fetching location from Firestore...
✅ Location fetched from Firestore:
[repeats every 3 seconds with success]
```

---

## Test Case 9: Battery Optimization ✅

### Goal
Verify location accuracy with battery saver enabled

### Prerequisites
- Test Case 4 completed

### Steps
1. **Open Battery Optimization Bar** at top of screen
2. **Toggle "Battery Saver" ON/OFF**
3. **Observe:**
   - Tracking continues both modes
   - "Battery Saver: ON" → More frequent polling
   - "Battery Saver: OFF" → Higher accuracy

4. **Check Console:**
   - No errors regardless of setting

---

## Test Case 10: Data Persistence ✅

### Goal
Verify device code persists across app restarts

### Prerequisites
- Test Case 1-2 completed

### Steps
1. **Note device code** from logs or UI
   - Example: `TRACK-A7F9K2L`

2. **Close app completely**
   - Task manager → Swipe app away

3. **Reopen app**

4. **Verify:**
   - Same device code in logs
   - Firestore continues receiving updates
   - No data loss

### Expected Behavior
```
[First launch]
✅ Generated new device code: TRACK-A7F9K2L

[Close and reopen app]
✅ Tracking config set: TRACK-A7F9K2L
[No generation message - code is persisted]
```

---

## Debugging Tools

### Check Firestore Data
```bash
# In Firebase Console
1. Go to https://console.firebase.google.com
2. Select project: trackify-2025-c29e3
3. Firestore Database
4. Collection: devices
5. Document: {your-device-code}
6. Document: location
```

### View Console Logs
```bash
# Android Studio
Android Studio → Logcat → Filter by app name

# Or with ADB
adb logcat | grep trackify
```

### Check API Calls
```bash
# In Firebase Console
1. Go to Firestore Database
2. Check Recent Activity
3. View API calls being made
```

### Test Firestore Rules
```bash
# In Firebase Console
1. Firestore → Rules tab
2. Check current rules
3. View rule violations in Debugging
```

---

## Common Issues & Solutions

### Issue: Device code not generated
**Solution:**
- Clear app data: Settings → Apps → Trackify → Storage → Clear Data
- Reinstall app
- Check console for errors

### Issue: Location not uploading
**Solution:**
- Verify GPS has fix (needs 2-3 minutes outdoor)
- Check location permission: Settings → Permissions → Location: Always
- Verify internet connection
- Check Firestore console for rule violations

### Issue: Location fetching fails
**Solution:**
- Verify device code is correct (TRACK-XXXXX format)
- Check source device is actively tracking
- Verify Firestore has data for that code
- Check API key in firebase-config.ts

### Issue: Map not showing markers
**Solution:**
- Verify location permission granted
- Wait for GPS fix (green circle indicator)
- Zoom map to include all devices
- Refresh page/app

### Issue: Too many API calls
**Solution:**
- Increase polling interval in firestore-service.ts
- Reduce number of tracked devices
- Disable unused features

### Issue: App crashes on tracking
**Solution:**
- Check console for error
- Verify location permissions fully granted
- Try on different device/emulator
- Check Firebase credentials valid

---

## Performance Metrics to Monitor

### Expected Upload Rate
- **Every:** 5 seconds (throttled)
- **Data size:** ~150 bytes per upload
- **Daily:** ~720 uploads per device = ~108 KB

### Expected Fetch Rate
- **Every:** 3 seconds per tracked device
- **Daily:** ~1,200 fetches per device = ~180 KB

### Battery Impact
- **Foreground tracking:** 5-10% per hour
- **Background tracking:** 10-20% per hour (location intensive)
- **Map rendering:** 5-10% per hour

### Network Usage
- **1 device sharing:** ~100 KB/day
- **Tracking 1 device:** ~180 KB/day
- **Total (share + track):** ~280 KB/day

---

## Success Criteria ✅

- [x] Device code generates automatically
- [x] Device code persists across restarts
- [x] Location uploads to Firestore every 5 seconds
- [x] Location fetches from Firestore every 3 seconds
- [x] Multiple devices can be tracked
- [x] Map displays all device locations
- [x] Real-time updates work on 2+ devices
- [x] App handles network loss gracefully
- [x] No crashes or memory leaks
- [x] Battery impact is acceptable

---

## Checklist Before Production

- [ ] Enable Firebase Authentication
- [ ] Set proper Firestore Security Rules
- [ ] Test on physical devices (not just emulator)
- [ ] Test on different Android versions (8+)
- [ ] Test on poor network conditions (3G)
- [ ] Monitor Firebase API costs
- [ ] Implement error reporting (Firebase Crashlytics)
- [ ] Add user privacy policy
- [ ] Implement data deletion functionality
- [ ] Performance test with 100+ tracked devices

---

**Last Updated:** December 15, 2025
**Status:** Testing Guide Complete ✅
