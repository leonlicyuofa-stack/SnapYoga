import * as admin from 'firebase-admin';
import { getServiceAccountCredentials } from '@/lib/gcp/credentials';

function initializeAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const credentials = getServiceAccountCredentials();
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (credentials) {
    return admin.initializeApp({
      credential: admin.credential.cert(credentials as admin.ServiceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket,
    });
  }

  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket,
  });
}

export function getAdminApp(): admin.app.App {
  return initializeAdminApp();
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

export function getAdminStorageBucket(): admin.storage.Storage {
  return getAdminApp().storage();
}
