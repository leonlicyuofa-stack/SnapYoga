
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

function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!firebaseConfigClient.apiKey || !firebaseConfigClient.projectId) {
      console.error("Firebase config is missing. Please check your .env.local or .env file.");
      // We don't throw here to avoid crashing the app, but services will be unavailable.
      return null;
    }
    
    if (getApps().length === 0) {
      try {
        app = initializeApp(firebaseConfigClient);
        auth = getAuth(app);
        firestore = getFirestore(app);
        storage = getStorage(app);
      } catch (e) {
        console.error("Failed to initialize Firebase", e);
        return null;
      }
    } else {
      app = getApps()[0];
      auth = getAuth(app);
      firestore = getFirestore(app);
      storage = getStorage(app);
    }
    return { app, auth, firestore, storage };
  }
  return null;
}

// Initialize and export. If initialization fails, these will be undefined.
const firebaseServices = initializeFirebase();

// The variables might be undefined if initialization fails,
// and consuming code must handle this gracefully.
app = firebaseServices?.app!;
auth = firebaseServices?.auth!;
firestore = firebaseServices?.firestore!;
storage = firebaseServices?.storage!;

export { app, auth, firestore, storage };
