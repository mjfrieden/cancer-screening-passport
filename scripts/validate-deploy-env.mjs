const deployEnvironment = process.env.DEPLOY_ENVIRONMENT?.trim() || process.env.GITHUB_ENVIRONMENT?.trim() || '';

const requiredVars = [
  'GCP_PROJECT_ID',
  'GCP_REGION',
  'ARTIFACT_REGISTRY_REPOSITORY',
  'CLOUD_RUN_SERVICE',
  'FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const optionalVars = [
  'VITE_ENABLE_CLINICAL_SIMULATOR',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_FIREBASE_FIRESTORE_DATABASE_ID',
];

const placeholderValues = new Set([
  '',
  'replace-me',
  'replace-me.firebaseapp.com',
  'replace-me.firebasestorage.app',
]);

const missing = requiredVars.filter((key) => {
  const value = process.env[key]?.trim() || '';
  return placeholderValues.has(value);
});

if (missing.length > 0) {
  console.error('Missing required deployment environment variables:');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

const region = process.env.GCP_REGION.trim();
if (!/^[a-z]+-[a-z]+[0-9]$/.test(region)) {
  console.error(`GCP_REGION must look like "us-central1"; received "${region}".`);
  process.exit(1);
}

const viteProjectId = process.env.VITE_FIREBASE_PROJECT_ID.trim();
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID.trim();
if (viteProjectId !== firebaseProjectId) {
  console.error('FIREBASE_PROJECT_ID must match VITE_FIREBASE_PROJECT_ID for the selected environment.');
  console.error(`FIREBASE_PROJECT_ID=${firebaseProjectId}`);
  console.error(`VITE_FIREBASE_PROJECT_ID=${viteProjectId}`);
  process.exit(1);
}

const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN.trim();
if (!authDomain.endsWith('.firebaseapp.com') && !authDomain.endsWith('.web.app')) {
  console.error('VITE_FIREBASE_AUTH_DOMAIN should be a Firebase auth domain ending in .firebaseapp.com or .web.app.');
  process.exit(1);
}

const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET.trim();
if (!storageBucket.endsWith('.appspot.com') && !storageBucket.endsWith('.firebasestorage.app')) {
  console.error('VITE_FIREBASE_STORAGE_BUCKET should end in .appspot.com or .firebasestorage.app.');
  process.exit(1);
}

const simulatorEnabled = (process.env.VITE_ENABLE_CLINICAL_SIMULATOR || 'false').trim().toLowerCase();
if (deployEnvironment === 'production' && simulatorEnabled !== 'false') {
  console.error('VITE_ENABLE_CLINICAL_SIMULATOR must be false for production deploys.');
  process.exit(1);
}

console.log('Required deployment environment variables are present.');

for (const key of optionalVars) {
  if (process.env[key] === undefined) {
    console.log(`Optional variable not set: ${key}`);
  }
}
