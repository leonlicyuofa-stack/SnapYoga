import { GoogleAuth, type JWTInput } from 'google-auth-library';

export type ServiceAccountCredentials = JWTInput & {
  client_email?: string;
  private_key?: string;
  project_id?: string;
};

export type FirebaseServiceAccount = {
  projectId: string;
  project_id: string;
  clientEmail: string;
  client_email: string;
  privateKey: string;
  private_key: string;
};

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, '\n');
}

/** e.g. vercel-run-service@snapyoga.iam.gserviceaccount.com → snapyoga */
function projectIdFromServiceAccountEmail(email: string): string | undefined {
  const match = email.trim().match(/@([^.]+)\.iam\.gserviceaccount\.com$/i);
  return match?.[1];
}

/**
 * Resolve GCP / Firebase project ID at runtime (server-side env vars first).
 * NEXT_PUBLIC_* is build-time inlined and may be empty on Vercel server actions.
 */
export function resolveProjectId(clientEmail?: string): string | undefined {
  const fromEnv =
    process.env.GCP_PROJECT_ID?.trim() ||
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  if (fromEnv) return fromEnv;

  if (clientEmail) {
    return projectIdFromServiceAccountEmail(clientEmail);
  }

  return undefined;
}

function readSplitCredentialsFromEnv(): ServiceAccountCredentials | undefined {
  const clientEmail = process.env.GCP_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GCP_PRIVATE_KEY?.trim();
  if (!clientEmail || !privateKey) {
    return undefined;
  }

  return {
    client_email: clientEmail,
    private_key: normalizePrivateKey(privateKey),
    project_id: resolveProjectId(clientEmail),
  };
}

function readJsonCredentialsFromEnv(): ServiceAccountCredentials | undefined {
  const keyJson = process.env.GCP_SERVICE_ACCOUNT_KEY?.trim();
  if (!keyJson) return undefined;

  const parsed = JSON.parse(keyJson) as ServiceAccountCredentials;
  if (parsed.private_key) {
    parsed.private_key = normalizePrivateKey(parsed.private_key);
  }
  if (!parsed.project_id && parsed.client_email) {
    parsed.project_id = resolveProjectId(parsed.client_email);
  }
  return parsed;
}

/**
 * Service account credentials for Vercel / non-GCP hosts.
 * Split vars are preferred — they are more reliable than a large JSON blob in Vercel.
 */
export function getServiceAccountCredentials(): ServiceAccountCredentials | undefined {
  return readSplitCredentialsFromEnv() ?? readJsonCredentialsFromEnv();
}

export function createGoogleAuth(): GoogleAuth {
  const credentials = getServiceAccountCredentials();
  if (credentials?.client_email && credentials?.private_key) {
    const projectId = resolveProjectId(credentials.client_email);
    return new GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
        ...(projectId ? { project_id: projectId } : {}),
      },
      ...(projectId ? { projectId } : {}),
    });
  }
  return new GoogleAuth();
}

export function toFirebaseServiceAccount(
  credentials: ServiceAccountCredentials
): FirebaseServiceAccount {
  const clientEmail = credentials.client_email || '';
  const privateKey = credentials.private_key || '';
  const projectId =
    credentials.project_id || resolveProjectId(clientEmail) || '';

  if (!projectId) {
    throw new Error(
      'Firebase Admin requires project_id. Set FIREBASE_PROJECT_ID or GCP_PROJECT_ID, ' +
        'or use a service account email like name@snapyoga.iam.gserviceaccount.com.'
    );
  }

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Service account credentials are incomplete. Set GCP_CLIENT_EMAIL and GCP_PRIVATE_KEY.'
    );
  }

  return {
    projectId,
    project_id: projectId,
    clientEmail,
    client_email: clientEmail,
    privateKey,
    private_key: privateKey,
  };
}
