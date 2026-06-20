import * as admin from 'firebase-admin';
import {
  getServiceAccountCredentials,
  toFirebaseServiceAccount,
} from '@/lib/gcp/credentials';

function initializeAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const credentials = getServiceAccountCredentials();

  if (credentials?.client_email && credentials?.private_key) {
    const serviceAccount = toFirebaseServiceAccount(credentials);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.projectId,
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
