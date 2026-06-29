const environment = process.env.DEPLOY_ENVIRONMENT;

if (!environment) {
  console.error('DEPLOY_ENVIRONMENT is required.');
  process.exit(1);
}

if (environment !== 'production') {
  console.log(`HIPAA production attestation is not required for ${environment}.`);
  process.exit(0);
}

const required = {
  GOOGLE_CLOUD_BAA_EFFECTIVE_DATE: process.env.GOOGLE_CLOUD_BAA_EFFECTIVE_DATE,
  HIPAA_SECURITY_OFFICER: process.env.HIPAA_SECURITY_OFFICER,
  HIPAA_PRIVACY_OFFICER: process.env.HIPAA_PRIVACY_OFFICER,
  HIPAA_INCIDENT_COMMANDER: process.env.HIPAA_INCIDENT_COMMANDER,
  HIPAA_BACKUP_OPERATIONAL_OWNER: process.env.HIPAA_BACKUP_OPERATIONAL_OWNER,
  HIPAA_LEGAL_COUNSEL: process.env.HIPAA_LEGAL_COUNSEL,
  PRODUCTION_AUTH_VERIFIED: process.env.PRODUCTION_AUTH_VERIFIED,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
};

const missing = Object.entries(required)
  .filter(([, value]) => !value?.trim())
  .map(([name]) => name);

if (missing.length > 0) {
  console.error(`Missing HIPAA production attestations: ${missing.join(', ')}`);
  process.exit(1);
}

const syntheticDeployment = (
  ['app-engine', 'firestore-rules'].includes(process.env.DEPLOY_SERVICE) &&
  process.env.HIPAA_SYNTHETIC_TESTING_APPROVED === 'true'
);

if (!syntheticDeployment && process.env.HIPAA_PRODUCTION_APPROVED !== 'true') {
  console.error('HIPAA_PRODUCTION_APPROVED must be exactly true.');
  process.exit(1);
}

if (required.PRODUCTION_AUTH_VERIFIED !== 'true') {
  console.error('PRODUCTION_AUTH_VERIFIED must be exactly true.');
  process.exit(1);
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(required.GOOGLE_CLOUD_BAA_EFFECTIVE_DATE)) {
  console.error('GOOGLE_CLOUD_BAA_EFFECTIVE_DATE must use YYYY-MM-DD.');
  process.exit(1);
}

if (required.FIREBASE_PROJECT_ID === 'cancer-passport-staging') {
  console.error('Production cannot use the staging Firebase project.');
  process.exit(1);
}

if (required.FIREBASE_PROJECT_ID !== required.VITE_FIREBASE_PROJECT_ID) {
  console.error('FIREBASE_PROJECT_ID and VITE_FIREBASE_PROJECT_ID must match.');
  process.exit(1);
}

if (process.env.DEPLOY_SERVICE === 'firebase-hosting') {
  console.error(
    'Firebase Hosting is not approved for PHI production. Select a service explicitly covered by the Google Cloud BAA.',
  );
  process.exit(1);
}

console.log('HIPAA production deployment attestation is present.');
