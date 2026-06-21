# GitHub Environments

Last updated: 2026-06-13

The manual deployment workflows expect GitHub Environments named `staging` and `production`.

Status: `staging` and `production` have been created in GitHub for `mjfrieden/cancer-screening-passport`. They still need real environment variables and secrets after the Google Cloud/Firebase staging project is created.

Create them in GitHub at:

```text
Settings -> Environments -> New environment
```

Use environment protection rules for `production` before enabling production deployment.

## Required Variables

Set these values on both `staging` and `production`.

```bash
GCP_PROJECT_ID=...
GCP_REGION=us-central1
ARTIFACT_REGISTRY_REPOSITORY=...
CLOUD_RUN_SERVICE=cancer-screening-passport
FIREBASE_PROJECT_ID=...
VITE_ENABLE_CLINICAL_SIMULATOR=false
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_FIRESTORE_DATABASE_ID=(default)
```

`FIREBASE_PROJECT_ID` must match `VITE_FIREBASE_PROJECT_ID` for the selected environment.

## Required Secrets

Set these secrets on both `staging` and `production`.

```bash
GCP_WORKLOAD_IDENTITY_PROVIDER=...
GCP_SERVICE_ACCOUNT=...
```

The service account should have only the permissions needed to push the image, deploy Cloud Run, inspect the Cloud Run service URL, and deploy Firestore rules.

## Validation

The workflows run these checks before deployment:

```bash
npm run validate:env
npm run validate:deploy-env
npm run validate:rules-deploy-env
```

`validate:deploy-env` catches missing Cloud Run, Artifact Registry, Firebase, and production simulator settings before Docker or Google Cloud deployment starts.

`validate:rules-deploy-env` catches a missing or malformed Firebase project ID before attempting to deploy Firestore rules.

You can bulk set GitHub Environment values from a local filled-in env file:

```bash
node scripts/set-github-env-from-file.mjs staging /path/to/staging.env
```

Start from `docs/staging.env.example`, but do not commit the filled-in file.

## Recommended Staging Values

Use a dedicated staging Firebase and Google Cloud project. Do not point staging at a personal prototype Firebase project.

```bash
GCP_PROJECT_ID=cancer-passport-staging
FIREBASE_PROJECT_ID=cancer-passport-staging
VITE_FIREBASE_PROJECT_ID=cancer-passport-staging
VITE_ENABLE_CLINICAL_SIMULATOR=false
```

After the first staging deployment completes, add the Cloud Run service URL and any custom staging domain to Firebase Authentication authorized domains.

## Recommended Production Gates

Before setting production variables, confirm:

- staging has been tested with real OAuth on its public URL,
- Firestore rules have been deployed to staging,
- production Firebase is separate from staging,
- production legal pages are reviewed,
- clinical guidance content is reviewed or clearly positioned as non-diagnostic,
- account/data deletion support is documented,
- production has GitHub Environment approvals enabled.
