# HIPAA Access Review - June 29, 2026

Status: Technical review complete; owner MFA confirmation open

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

## Open Owner Confirmations

- [ ] Marshall Frieden confirms MFA is enabled and tested on the White Cloud
  Medical Google Workspace account.
- [ ] Donald Frieden receives and tests appropriate backup operational access.
- [ ] White Cloud Medical approves the current owner-level access or replaces
  it with narrower administrative roles.
- [ ] Quarterly access-review calendar entry is created.
- [ ] Private Logs Viewer access is assigned only if operational log review
  requires it.

Do not set `HIPAA_ACCESS_REVIEW_COMPLETED_DATE` until every open confirmation is
complete and retained with company compliance evidence.
