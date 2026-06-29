# Production Status

Last updated: June 29, 2026

## Provisioned

- Google Workspace organization: `whitecloudmedical.com`
- Organization ID: `883366996416`
- Production project: `cancer-passport-wcm-prod`
- Project number: `410791537492`
- Project owner account used for setup:
  `marshall@whitecloudmedical.com`
- Firebase project activated.
- Firestore `(default)` database created in `nam5`.
- Firestore started with closed default rules; real PHI is not authorized.
- Production Firebase web app created:
  `1:410791537492:web:e4ad8bde07268e7a1976c1`.
- Firebase, Firestore, Identity Toolkit, IAM Credentials, and Security Token
  Service APIs enabled.
- Identity Platform initialized on June 28, 2026.
- Improved email privacy is enabled.
- Production authorized domains exclude `localhost`.
- Google Auth Platform is configured for an external patient audience with
  White Cloud Medical support contact information.
- A production-only OAuth web client is configured for the production Firebase
  origins and auth callback.
- The Google Identity Platform provider is enabled and independently verified
  by `npm run verify:production-auth`.
- Production Firebase configuration stored as GitHub Environment variables.
- Clinical simulator disabled for production.
- Analytics measurement ID intentionally omitted.
- Cloud Billing account `0174EF-222187-7B71AF` linked and billing enabled.
- A recurring $0.05 monthly budget covers the production project, with alerts
  at 50% actual spend, 100% actual spend, and 100% forecasted spend.
- White Cloud Medical, LLC accepted the Google Cloud HIPAA Business Associate
  Addendum on June 28, 2026.
- The BAA effective date is recorded in the GitHub production environment.
- Keyless GitHub workload identity is configured for
  `mjfrieden/cancer-screening-passport`.
- The production deployment service account is limited to Firebase Rules
  administration and has no downloaded service-account key.
- GitHub production environment secrets reference the workload identity
  provider and production rules service account.
- Marshall Frieden is assigned as interim HIPAA privacy officer, HIPAA security
  officer, incident commander, technical system owner, and user communications
  lead.
- Donald Frieden is assigned as backup operational owner.
- Marshall Frieden is designated as legal counsel.
- Static hosting configuration now enforces CSP, clickjacking, MIME sniffing,
  referrer, permissions, and cross-origin opener protections.
- Production Firestore errors no longer log or rethrow patient email, UID, or
  record paths.
- Healthy-living adherence selections no longer persist across users in
  unscoped browser storage.
- Patient privacy regressions and required security headers are enforced by the
  beta preflight gate.
- GitHub production gate set to `HIPAA_PRODUCTION_APPROVED=false`.
- A separate synthetic-testing gate may permit owner-isolated Firestore rules
  deployment without authorizing hosting or real PHI.
- Production Firestore rules were deployed through keyless GitHub workload
  identity after passing emulator tests. Deployment run `28345367781`
  completed successfully on June 28, 2026.
- App Engine Standard was selected as the BAA-covered production web host and
  created in `us-central`, aligned with the existing `nam5` Firestore database.
- The production host is live at
  `https://cancer-passport-wcm-prod.uc.r.appspot.com/`.
- App Engine automatic scaling uses an F1 instance with zero minimum instances
  and a hard maximum of one instance.
- A dedicated keyless App Engine deployment service account is separate from
  the Firebase Rules deployment account.
- The App Engine hostname is authorized in Identity Platform.
- Production deployment run `28346851110` passed its environment validation,
  HIPAA synthetic-deployment gate, beta preflight, build, deploy, and live
  smoke checks.
- Production commit `6647181` added a fail-closed real-PHI runtime lock and a
  visible synthetic-data-only warning on signed-out, consent, and authenticated
  screens.
- GitHub production variable `VITE_REAL_PHI_ENABLED=false` keeps the runtime
  lock active. Deployment run `28388925709` passed validation, build, App
  Engine deployment, and live smoke checks on June 29, 2026.
- Desktop and 390-by-844 mobile signed-out layouts were verified without
  horizontal overflow, and the live host returned the required security
  headers.
- Google popup authentication reached the production Google account chooser
  after the required Firebase authentication runtime origins were added to the
  Content Security Policy.

## Not Provisioned or Approved

- Single-account authenticated synthetic testing passed on June 29, 2026 using
  `marshall@whitecloudmedical.com`: Google sign-in, profile save, screening
  record save, recommendation refresh, account-data JSON export, deletion
  reauthentication, permanent app-account deletion, and return to the
  signed-out screen.
- Live second-account isolation testing is not complete because a second
  production test Google account was unavailable. Firestore emulator tests
  continue to enforce owner isolation.
- Real PHI remains prohibited.
- Real-PHI activation now fails closed unless the dated risk analysis,
  training, tabletop, retention, access-review, recovery-test, and legal-review
  evidence is present along with BAA retention and two-account isolation
  approvals. See `docs/PHI_ACTIVATION_RUNBOOK.md`.

## Next Owner Actions

1. Retain a downloaded or printed copy of the accepted Google Cloud BAA with
   White Cloud Medical, LLC compliance records.
2. Create a second production test Google account and use only synthetic
   information for the remaining live isolation test.

After the second-account isolation test, automation can prepare the final PHI
activation review.
