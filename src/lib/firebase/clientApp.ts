
import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'; // Import Firestore
import { getStorage, type FirebaseStorage } from 'firebase/storage';
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

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let storage: FirebaseStorage | undefined;
// let analytics: Analytics;

// Check if required config values are present before initializing
if (firebaseConfigClient.apiKey && firebaseConfigClient.projectId) {
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfigClient);
      auth = getAuth(app);
      firestore = getFirestore(app);
      storage = getStorage(app);
    } catch (e) {
      console.error("Failed to initialize Firebase", e);
    }
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
  }
} else {
    console.warn("Firebase environment variables are not set. Firebase features will be disabled.");
}


export { app, auth, firestore, storage };
