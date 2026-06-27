# Staging Status

Last updated: 2026-06-27

## Confirmed Account

Google Cloud and Firebase CLI are authenticated as:

```text
marshall@whitecloudmedical.com
```

No other Google account should be used without explicit confirmation.

## Completed

- Created Google Cloud project `cancer-passport-staging`.
- Set `cancer-passport-staging` as the active `gcloud` project.
- Created default Firestore database in `nam5`.
- Enabled non-billing APIs:
  - Firebase Management API
  - Firestore API
  - Firebase Rules API
  - IAM Credentials API
  - Security Token Service API
- Created GitHub Actions deploy service account:
  - `github-actions-deploy@cancer-passport-staging.iam.gserviceaccount.com`
- Granted staging deploy service account:
  - Artifact Registry Writer
  - Cloud Run Admin
  - Datastore Owner
  - Service Account User
- Created GitHub Environments:
  - `staging`
  - `production`
- Created Cloudflare Pages Free project:
  - `cancer-screening-passport`
  - reserved hostname `cancer-screening-passport.pages.dev`
- Configured GitHub `staging` environment with:
  - `CLOUDFLARE_ACCOUNT_ID` secret
  - `CLOUDFLARE_API_TOKEN` secret
  - `CLOUDFLARE_PAGES_PROJECT=cancer-screening-passport`
  - `VITE_ENABLE_CLINICAL_SIMULATOR=false`
- Created a Cloudflare account API token limited to `Pages Write`, expiring June 27, 2027.

## Cost Guardrail

Billing is not linked to `cancer-passport-staging`.

Keep billing unlinked while the monthly cost ceiling is `$0.05`. Cloud Run, Cloud Build, and Artifact Registry remain paused because they require billing and can exceed the tiny budget through container image storage.

## Firebase Activation Blocker

Firebase activation is blocked.

Command:

```bash
npx -y firebase-tools@13.13.3 projects:addfirebase cancer-passport-staging
```

Result:

```text
HTTP 403 PERMISSION_DENIED: The caller does not have permission
```

This still fails after granting `roles/firebase.admin` to `marshall@whitecloudmedical.com`, even though the account is also project Owner. The project belongs to organization `883366996416`, so this may be an organization policy, Firebase onboarding, or console-level permission restriction.

The Firebase Console was also tested on June 27, 2026 while signed in as
`marshall@whitecloudmedical.com`. Its "Add Firebase to Google Cloud project"
dialog returned "No Google Cloud projects match your search" for
`cancer-passport-staging`. This confirms the blocker exists in the Firebase
Console as well as the CLI.

## Required Manual Check

Ask the Google Workspace/Cloud organization administrator for organization
`883366996416` to allow `marshall@whitecloudmedical.com` to add Firebase to the
existing `cancer-passport-staging` project, or move the project to a parent
resource where Firebase project onboarding is allowed.

## Current Best Path

Continue with the static no-cost app architecture:

- keep recommendations bundled in the browser,
- avoid Cloud Run,
- avoid Artifact Registry,
- use Firebase Auth/Firestore only after Firebase activation is resolved,
- deploy the existing Cloudflare Pages Free project once the Firebase web app
  config exists.

Do not deploy the current `.env.local` build as staging. It points to the older
`gray-cloud-medical` Firebase project rather than `cancer-passport-staging`.

See `docs/STATIC_FREE_DEPLOYMENT.md`.
