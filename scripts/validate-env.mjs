import { config as loadEnvFile } from 'dotenv';
import { existsSync } from 'node:fs';

for (const path of ['.env.local', '.env']) {
  if (existsSync(path)) {
    loadEnvFile({ path, override: false });
  }
}

const requiredBuildVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const optionalBuildVars = [
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

const missing = requiredBuildVars.filter((key) => {
  const value = process.env[key]?.trim() || '';
  return placeholderValues.has(value);
});

if (missing.length > 0) {
  console.error('Missing required build-time environment variables:');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

console.log('Required build-time environment variables are present.');

for (const key of optionalBuildVars) {
  if (process.env[key] === undefined) {
    console.log(`Optional variable not set: ${key}`);
  }
}
