import { GoogleAuth, type JWTInput } from 'google-auth-library';

/**
 * Service account credentials for Vercel / non-GCP hosts.
 * Local dev can omit these and use `gcloud auth application-default login`.
 */
export function getServiceAccountCredentials(): JWTInput | undefined {
  const keyJson = process.env.GCP_SERVICE_ACCOUNT_KEY?.trim();
  if (keyJson) {
    return JSON.parse(keyJson) as JWTInput;
  }

  const clientEmail = process.env.GCP_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (clientEmail && privateKey) {
    return { client_email: clientEmail, private_key: privateKey };
  }

  return undefined;
}

export function createGoogleAuth(): GoogleAuth {
  const credentials = getServiceAccountCredentials();
  if (credentials) {
    return new GoogleAuth({ credentials });
  }
  return new GoogleAuth();
}
