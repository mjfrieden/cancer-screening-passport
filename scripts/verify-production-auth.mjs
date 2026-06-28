import { execFileSync } from 'node:child_process';

const projectId = process.env.FIREBASE_PROJECT_ID || 'cancer-passport-wcm-prod';

function accessToken() {
  return execFileSync('gcloud', ['auth', 'print-access-token'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();
}

async function getJson(path, token, { allowNotFound = false } = {}) {
  const response = await fetch(`https://identitytoolkit.googleapis.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Goog-User-Project': projectId,
    },
  });

  if (allowNotFound && response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Identity Platform check failed with HTTP ${response.status}.`);
  }

  return response.json();
}

const token = accessToken();
const config = await getJson(`/admin/v2/projects/${projectId}/config`, token);
const googleProvider = await getJson(
  `/admin/v2/projects/${projectId}/defaultSupportedIdpConfigs/google.com`,
  token,
  { allowNotFound: true },
);

const failures = [];
const authorizedDomains = config.authorizedDomains || [];

if (config.subtype !== 'IDENTITY_PLATFORM') {
  failures.push('Identity Platform is not initialized');
}
if (config.emailPrivacyConfig?.enableImprovedEmailPrivacy !== true) {
  failures.push('improved email privacy is not enabled');
}
if (authorizedDomains.includes('localhost')) {
  failures.push('localhost is authorized in production');
}
if (!authorizedDomains.includes(`${projectId}.firebaseapp.com`)) {
  failures.push('the production Firebase auth domain is not authorized');
}
if (googleProvider?.enabled !== true) {
  failures.push('the Google identity provider is not enabled');
}

if (failures.length > 0) {
  console.error(`Production authentication is not ready: ${failures.join('; ')}.`);
  process.exit(1);
}

console.log(`Production authentication is ready for ${projectId}.`);
