# Security and Privacy Intake

Last updated: 2026-06-25

This is the beta intake path for security, privacy, and health-data concerns.

## Intake Channels

- Public product bugs and beta feedback: GitHub issues, using the repository templates.
- Private security, privacy, or health-data concerns: GitHub Security Advisories.

Private advisory link:

```text
https://github.com/mjfrieden/cancer-screening-passport/security/advisories/new
```

Do not collect protected health information, real medical records, or sensitive personal details through public GitHub issues.

## Triage Targets

- `P0`: cross-user data access, data loss, exposed secrets, unsafe recommendation output, account deletion failure, or production PHI exposure.
- `P1`: blocked sign-in, blocked export/deletion workflow, Firestore rules concern, privacy copy mismatch, or unclear health-data handling.
- `P2`: confusing safety language, missing support guidance, accessibility issue, or mobile-only usability problem.
- `P3`: documentation, copy, or workflow polish.

## Response Steps

1. Confirm whether the report contains sensitive data.
2. Keep sensitive reports in the private advisory flow.
3. Reproduce with throwaway accounts and non-sensitive test data.
4. Assign severity and owner.
5. Patch and verify in staging.
6. Update `docs/KNOWN_ISSUES.md` and `docs/BETA_RELEASE_NOTES.md` when the issue affects testers.
7. Do not invite more testers while unresolved P0/P1 issues remain.

## Production Gap

Before public production, replace this beta process with a monitored support address, documented response owner, retention policy, breach response procedure, and vendor/compliance review if protected health information is allowed.
