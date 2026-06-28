# GitHub Environments

Last updated: 2026-06-24

The manual deployment workflows expect GitHub Environments named `staging` and `production`.

Status: `staging` and `production` have been created in GitHub for `mjfrieden/cancer-screening-passport`. Cloud Run deployment variables/secrets are not needed for the static no-cost path unless the project later moves back to container deployment.

Create them in GitHub at:

```text
Settings -> Environments -> New environment
```

Use environment protection rules for `production` before enabling production deployment.

## Required Static Variables

Set these values on both `staging` and `production` for Firebase Hosting or Cloudflare Pages static deploys.

```bash
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

## Required Cloudflare Pages Values

Set this variable if using `Deploy Static Cloudflare Pages`:

```bash
CLOUDFLARE_PAGES_PROJECT=cancer-screening-passport
```

Set these secrets if using `Deploy Static Cloudflare Pages`:

```bash
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

Start from `docs/cloudflare-pages.env.example`.

## Required Firebase Hosting Secrets

Set these secrets only if using `Deploy Static Firebase Hosting` or the optional Cloud Run workflow.

```bash
GCP_WORKLOAD_IDENTITY_PROVIDER=...
GCP_SERVICE_ACCOUNT=...
```

The service account should have only the permissions needed to deploy Firebase Hosting or Firestore rules. If the project later moves back to Cloud Run, add the separate Cloud Run, Artifact Registry, and service deployment permissions at that time.

## Optional Cloud Run Variables

These are paused under the current no-cost budget and are only needed for `.github/workflows/deploy-web.yml`.

```bash
GCP_PROJECT_ID=...
GCP_REGION=us-central1
ARTIFACT_REGISTRY_REPOSITORY=...
CLOUD_RUN_SERVICE=cancer-screening-passport
```

## Validation

The workflows run these checks before deployment:

```bash
npm run validate:env
npm run validate:cloudflare-pages-env
npm run validate:deploy-env
npm run validate:rules-deploy-env
```

`validate:cloudflare-pages-env` catches missing Cloudflare Pages credentials and invalid project names before Wrangler deploy starts.

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

After the first staging deployment completes, add the Cloudflare Pages URL, Firebase Hosting URL, Cloud Run service URL, or custom staging domain to Firebase Authentication authorized domains.

## Recommended Production Gates

Before setting production variables, confirm:

- staging has been tested with real OAuth on its public URL,
- Firestore rules have been deployed to staging,
- production Firebase is separate from staging,
- production legal pages are reviewed,
- clinical guidance content is reviewed or clearly positioned as non-diagnostic,
- account/data deletion support is documented,
- production has GitHub Environment approvals enabled.

The `production` environment must also define these non-secret attestation
variables. Do not set `HIPAA_PRODUCTION_APPROVED=true` until the evidence is
complete:

```bash
HIPAA_PRODUCTION_APPROVED=false
HIPAA_SYNTHETIC_TESTING_APPROVED=false
GOOGLE_CLOUD_BAA_EFFECTIVE_DATE=
HIPAA_SECURITY_OFFICER=
HIPAA_PRIVACY_OFFICER=
HIPAA_INCIDENT_COMMANDER=
HIPAA_BACKUP_OPERATIONAL_OWNER=
HIPAA_LEGAL_COUNSEL=
PRODUCTION_AUTH_VERIFIED=false
```

Production Firebase Hosting and Firestore rules workflows run
`npm run validate:hipaa-production` and fail closed when the attestation is
missing, the BAA date is malformed, or staging is selected as production.
The Firebase Hosting workflow also fails closed for production because Firebase
Hosting is not currently named on Google's HIPAA Covered Products list. Use it
only for synthetic-data staging until a covered production hosting service is
selected and reviewed.

`HIPAA_SYNTHETIC_TESTING_APPROVED=true` permits only the production Firestore
rules workflow to run before final PHI approval. It does not permit hosting,
public production deployment, or real-PHI collection.
