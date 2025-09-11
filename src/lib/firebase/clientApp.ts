
import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfigClient: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

// This check ensures we only initialize the app once.
if (getApps().length === 0) {
  // Check if the essential config values are present.
  if (firebaseConfigClient.apiKey && firebaseConfigClient.projectId) {
    app = initializeApp(firebaseConfigClient);
  } else {
    // This will help in debugging if the .env file is missing.
    console.error("Firebase config is missing or incomplete. Please check your environment variables.");
    // We create a dummy object to avoid crashing the app, but services will not work.
    app = {} as FirebaseApp;
  }
} else {
  app = getApps()[0];
}

// We get the services from the initialized app.
// If the app failed to initialize, these will throw errors when used,
// which is appropriate behavior.
try {
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  console.error("Failed to get Firebase services. Is the app initialized correctly?", e);
  auth = {} as Auth;
  firestore = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, firestore, storage };
