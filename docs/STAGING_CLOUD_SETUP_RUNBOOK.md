# Staging Cloud Setup Runbook

Last updated: 2026-06-20

Use this runbook only if you decide to continue with the optional Cloud Run path. For the current no-cost path, prefer `docs/STATIC_FREE_DEPLOYMENT.md`.

GitHub Environments named `staging` and `production` already exist in the repository. A `cancer-passport-staging` Google Cloud project and default Firestore database have been created under `marshall@whitecloudmedical.com`, but billing is not linked.

Cloud Run, Cloud Build, and Artifact Registry setup should remain paused while the cost ceiling is $0.05/month.

For the current state of the created staging project and Firebase activation blocker, see `docs/STAGING_STATUS.md`.

## Prerequisites

- Google Cloud account with permission to create projects.
- Billing account that can be linked to the staging project.
- Google Cloud CLI installed and authenticated.
- Firebase CLI available through `npx firebase-tools`.
- Repository admin access for GitHub environment variables and secrets.

Do not create or select a Google Cloud project from a shared machine until the intended Google account is confirmed. Use `gcloud auth list` and `gcloud config list account` before running project creation commands.

## Recommended IDs

Project IDs are globally unique, so adjust if these are unavailable:

```bash
STAGING_PROJECT_ID=cancer-passport-staging
PRODUCTION_PROJECT_ID=cancer-passport-production
GCP_REGION=us-central1
ARTIFACT_REGISTRY_REPOSITORY=cancer-passport
CLOUD_RUN_SERVICE=cancer-screening-passport
```

## Create Google Cloud/Firebase Staging

Before running these commands, confirm the intended Google account and billing account.

```bash
gcloud auth list
gcloud config list account
gcloud billing accounts list

gcloud projects create "$STAGING_PROJECT_ID" --name="Cancer Passport Staging"
gcloud billing projects link "$STAGING_PROJECT_ID" --billing-account="$BILLING_ACCOUNT_ID"

gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  firebase.googleapis.com \
  firestore.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  --project "$STAGING_PROJECT_ID"

npx -y firebase-tools@13.13.3 projects:addfirebase "$STAGING_PROJECT_ID"
npx -y firebase-tools@13.13.3 firestore:databases:create --project "$STAGING_PROJECT_ID" --location nam5
```

Enable Google sign-in in the Firebase Console:

```text
Firebase Console -> Authentication -> Sign-in method -> Google -> Enable
```

Create a Firebase Web App and copy its client configuration values into GitHub Environment variables.

## Artifact Registry

```bash
gcloud artifacts repositories create "$ARTIFACT_REGISTRY_REPOSITORY" \
  --repository-format=docker \
  --location="$GCP_REGION" \
  --description="Cancer Prevention Passport containers" \
  --project "$STAGING_PROJECT_ID"
```

## Workload Identity For GitHub Actions

Use a dedicated deploy service account.

```bash
DEPLOY_SERVICE_ACCOUNT=github-actions-deploy
REPO=mjfrieden/cancer-screening-passport

gcloud iam service-accounts create "$DEPLOY_SERVICE_ACCOUNT" \
  --display-name="GitHub Actions Deploy" \
  --project "$STAGING_PROJECT_ID"

DEPLOY_SERVICE_ACCOUNT_EMAIL="$DEPLOY_SERVICE_ACCOUNT@$STAGING_PROJECT_ID.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$STAGING_PROJECT_ID" \
  --member="serviceAccount:$DEPLOY_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding "$STAGING_PROJECT_ID" \
  --member="serviceAccount:$DEPLOY_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$STAGING_PROJECT_ID" \
  --member="serviceAccount:$DEPLOY_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/datastore.owner"

gcloud projects add-iam-policy-binding "$STAGING_PROJECT_ID" \
  --member="serviceAccount:$DEPLOY_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountUser"
```

Create a Workload Identity Pool and Provider:

```bash
POOL_ID=github-actions
PROVIDER_ID=github

gcloud iam workload-identity-pools create "$POOL_ID" \
  --project="$STAGING_PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project="$STAGING_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="$POOL_ID" \
  --display-name="GitHub" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
  --attribute-condition="assertion.repository == '$REPO'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

PROJECT_NUMBER="$(gcloud projects describe "$STAGING_PROJECT_ID" --format='value(projectNumber)')"
WORKLOAD_IDENTITY_PROVIDER="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/providers/$PROVIDER_ID"

gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SERVICE_ACCOUNT_EMAIL" \
  --project="$STAGING_PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/attribute.repository/$REPO"
```

## GitHub Environment Values

Set these on the `staging` environment:

```bash
GCP_PROJECT_ID="$STAGING_PROJECT_ID"
GCP_REGION="$GCP_REGION"
ARTIFACT_REGISTRY_REPOSITORY="$ARTIFACT_REGISTRY_REPOSITORY"
CLOUD_RUN_SERVICE="$CLOUD_RUN_SERVICE"
FIREBASE_PROJECT_ID="$STAGING_PROJECT_ID"
VITE_ENABLE_CLINICAL_SIMULATOR=false
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID="$STAGING_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_FIRESTORE_DATABASE_ID=(default)
```

Set these secrets on the `staging` environment:

```bash
GCP_WORKLOAD_IDENTITY_PROVIDER="$WORKLOAD_IDENTITY_PROVIDER"
GCP_SERVICE_ACCOUNT="$DEPLOY_SERVICE_ACCOUNT_EMAIL"
```

## Deploy Staging

From GitHub Actions:

1. Run `Deploy Firestore Rules` with environment `staging`.
2. Run `Deploy Web` with environment `staging`.
3. Copy the Cloud Run URL from the workflow output.
4. Add that URL host to Firebase Authentication authorized domains.
5. Rerun `Deploy Web` if OAuth domain configuration changed.

## Full Beta Checklist

Run `docs/WEB_BETA_CHECKLIST.md` with throwaway Google accounts after staging is deployed. Do not use real health information.
