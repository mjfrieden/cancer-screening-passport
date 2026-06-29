# HIPAA Access Review - June 29, 2026

Status: Complete by White Cloud Medical owner attestation

Reviewer: Codex technical evidence collection for White Cloud Medical, LLC

Project: `cancer-passport-wcm-prod`

## Verified

- Active setup account: `marshall@whitecloudmedical.com`.
- Human project ownership is limited to Marshall Frieden.
- App Engine and Firestore deployments use separate GitHub workload identities.
- No service account has a user-managed key.
- Production Firebase configuration is separate from staging.
- Firestore Security Rules owner-isolation tests pass in CI.
- Firestore Data Access audit logging is enabled for `ADMIN_READ`,
  `DATA_READ`, and `DATA_WRITE`, with no principal exemptions.
- Firestore delete protection is enabled.
- Weekly seven-day Firestore backup schedule is active.
- Project-specific $0.05 monthly budget alerts remain configured.

Run `npm run verify:phi-operations` to recheck the live technical evidence.

## Owner Confirmations

- [x] Marshall Frieden confirms MFA is enabled and tested on the White Cloud
  Medical Google Workspace account.
- [x] Donald Frieden receives and tests appropriate backup operational access.
- [x] White Cloud Medical approves the current owner-level access or replaces
  it with narrower administrative roles.
- [x] Quarterly access-review calendar entry is created.
- [x] Private Logs Viewer access is assigned only if operational log review
  requires it.

White Cloud Medical attested to these confirmations on June 29, 2026. Supporting
evidence is retained privately.
