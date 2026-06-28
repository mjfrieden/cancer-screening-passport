# Production Status

Last updated: June 28, 2026

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

## Not Provisioned or Approved

- Google Identity provider OAuth client and consent screen are not configured.
- Production Firestore rules have not been deployed.
- No production hosting service has been approved.
- No production deployment has occurred.
- Real PHI remains prohibited.

## Next Owner Actions

1. Retain a downloaded or printed copy of the accepted Google Cloud BAA with
   White Cloud Medical, LLC compliance records.
2. Configure the Google OAuth consent screen and Google Identity Platform
   provider without adding `localhost` to production authorized domains.
3. Select a production web hosting service explicitly covered under the BAA.

After those actions, automation can deploy and test Firestore rules, complete
authenticated synthetic-data testing, and prepare the final PHI activation
review.
