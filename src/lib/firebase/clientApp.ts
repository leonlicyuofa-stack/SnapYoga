
import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'; // Import Firestore
// import { getStorage } from 'firebase/storage';
// import { getAnalytics } from "firebase/analytics";

const firebaseConfigClient: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Conditionally add measurementId if it's set
if (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
  firebaseConfigClient.measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
}

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore; // Declare Firestore
// let storage: Storage;
// let analytics: Analytics;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfigClient);
  auth = getAuth(app);
  firestore = getFirestore(app); // Initialize Firestore
  // storage = getStorage(app);
  // if (typeof window !== 'undefined' && firebaseConfigClient.measurementId) {
  //   analytics = getAnalytics(app);
  // }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app); // Initialize Firestore for existing app instance
  // storage = getFirestore(app); // This was a typo, should be getStorage
  // storage = getStorage(app);
  // if (typeof window !== 'undefined' && firebaseConfigClient.measurementId) {
  //   analytics = getAnalytics(app);
  // }
}

export { app, auth, firestore /*, storage, analytics */ };
