/**
 * Firebase Configuration - Trackify 2025
 * Project: Trackify-2025
 * Project ID: trackify-2025-c29e3
 * Project Number: 189142789486
 */

export const firebaseConfig = {
  apiKey: 'AIzaSyA9IfSxjvE79QAXlfkn4Jotp_vQtnYonFA', // From google-services.json
  authDomain: 'trackify-2025-c29e3.firebaseapp.com',
  projectId: 'trackify-2025-c29e3',
  storageBucket: 'trackify-2025-c29e3.firebasestorage.app',
  messagingSenderId: '189142789486',
  appId: '1:189142789486:android:e48c82111ed5453eda257f', // From google-services.json
};

/**
 * Quick Setup Instructions:
 * 
 * 1. ✅ Firebase Project Created: Trackify-2025
 * 2. ✅ Project ID: trackify-2025-c29e3
 * 3. ✅ Cloud Messaging API Enabled
 * 4. ✅ google-services.json added to android/app/
 * 5. ✅ build.gradle.kts configured
 * 6. ✅ API Key: AIzaSyA9IfSxjvE79QAXlfkn4Jotp_vQtnYonFA
 * 7. ✅ App ID: 1:189142789486:android:e48c82111ed5453eda257f
 * 
 * Next Steps:
 * 
 * 8. Enable Firestore Database:
 *    - Firebase Console -> Build -> Firestore Database
 *    - Click "Create database"
 *    - Choose "Test mode" for development
 *    - Select region (asia-southeast1 recommended for Indonesia)
 * 
 * 9. Set Firestore Security Rules:
 *    - In Firestore -> Rules tab, paste this:
 *    
 *    rules_version = '2';
 *    service cloud.firestore {
 *      match /databases/{database}/documents {
 *        match /devices/{deviceId}/locations/{document=**} {
 *          allow read, write: if true;  // Open for testing
 *        }
 *      }
 *    }
 * 
 * 10. Rebuild Android App:
 *    npx expo run:android
 * 
 * Note: For production, implement Firebase Authentication
 */
