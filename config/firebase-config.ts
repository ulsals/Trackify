/**
 * Firebase Configuration
 * Update these values with your Firebase project credentials from Google Cloud Console
 */

export const firebaseConfig = {
  apiKey: 'AIzaSyDemoKey123456789', // Replace with your Firebase API Key
  authDomain: 'trackify-demo.firebaseapp.com',
  projectId: 'trackify-demo', // Replace with your Firebase Project ID
  storageBucket: 'trackify-demo.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abc123def456ghi789',
};

/**
 * Instructions to set up Firebase:
 * 
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (or use existing)
 * 3. Go to Project Settings -> Service Accounts
 * 4. Copy the config values above
 * 5. Enable Firestore Database in Firebase Console
 * 6. Set Firestore rules for testing:
 *    rules_version = '2';
 *    match /databases/{database}/documents {
 *      match /devices/{deviceId}/locations/{document=**} {
 *        allow read, write: if true;
 *      }
 *    }
 * 
 * Note: For production, implement proper authentication/authorization
 */
