# Staging Status

Last updated: 2026-06-27 23:24 CDT

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
- Activated Firebase on `cancer-passport-staging` while signed in as
  `marshall@whitecloudmedical.com`.
- Confirmed the Firebase project remains on the Spark plan at `$0/month`.
- Registered the `Cancer Passport Staging Web` Firebase web app without
  Firebase Hosting or Google Analytics.
- Enabled Google sign-in with `marshall@whitecloudmedical.com` as the support
  email and `Cancer Prevention Passport` as the public-facing project name.
- Added `cancer-screening-passport.pages.dev` to Firebase Authentication's
  authorized domains.
- Configured all staging `VITE_FIREBASE_*` values and `APP_URL` in the GitHub
  `staging` environment.
- Deployed `firestore.rules` to the staging Firestore database.
- Deployed the static PWA through GitHub Actions to:
  - `https://cancer-screening-passport.pages.dev`
- Passed `npm run smoke:static` against the live Pages URL.
- Verified the live signed-out application renders without console warnings or
  errors.
- Completed the authenticated staging beta flow with synthetic data:
  - Google sign-in
  - profile save and persistence after reload
  - screening event creation
  - source-linked recommendation generation
  - FHIR JSON, clinician PDF, and account JSON exports
  - sign-out
- Corrected normal colonoscopy follow-up from an erroneous 3-year projection
  to the expected 10-year projection and added regression coverage.
- Corrected local date handling for screening records.
- Moved the profile save action above the fixed navigation so pointer users can
  submit the form.
- Removed the initial timeline chart sizing warning and confirmed a clean
  authenticated reload on the live staging URL.
- Latest verified staging commit: `e85d237`.
- Latest successful CI run: `28311197754`.
- Latest successful Cloudflare staging deployment: `28311216146`.

## Remaining Beta Checks

- Delete the throwaway Firebase account and its records after explicit
  destructive-action confirmation.
- Verify a second user cannot read the first user's Firestore documents.
- Complete iOS Safari and Android Chrome install/layout/download checks on real
  devices.
- Complete the authenticated keyboard and screen-reader walkthrough.

## Cost Guardrail

Billing is not linked to `cancer-passport-staging`.

Keep billing unlinked while the monthly cost ceiling is `$0.05`. Cloud Run, Cloud Build, and Artifact Registry remain paused because they require billing and can exceed the tiny budget through container image storage.

## Firebase Activation Resolution

The earlier CLI and Console visibility failures were caused by an expired
Google Workspace reauthentication session. After verifying
`marshall@whitecloudmedical.com` in Google Cloud Console, the Firebase Console
could see `cancer-passport-staging` and activation completed successfully.

## Current Best Path

Continue with the static no-cost app architecture:

- keep recommendations bundled in the browser,
- avoid Cloud Run,
- avoid Artifact Registry,
- use Firebase Auth and Firestore on the Spark plan,
- deploy through the existing Cloudflare Pages Free workflow,
- use only non-sensitive or throwaway data during the controlled beta.

The checked-in deployment path does not use the local `.env.local`; GitHub's
`staging` environment supplies the real `cancer-passport-staging` web config.

See `docs/STATIC_FREE_DEPLOYMENT.md`.
