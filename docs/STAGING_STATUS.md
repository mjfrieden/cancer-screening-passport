# Staging Status

Last updated: 2026-06-23

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

## Required Manual Check

Open Firebase Console as `marshall@whitecloudmedical.com` and try to add Firebase to project `cancer-passport-staging` manually.

If the console also blocks activation, check with the Google Workspace/Cloud organization administrator for Firebase project creation restrictions.

## Current Best Path

Continue with the static no-cost app architecture:

- keep recommendations bundled in the browser,
- avoid Cloud Run,
- avoid Artifact Registry,
- use Firebase Auth/Firestore only after Firebase activation is resolved,
- use Cloudflare Pages Free or Firebase Hosting Spark once the Firebase app config exists.

See `docs/STATIC_FREE_DEPLOYMENT.md`.
