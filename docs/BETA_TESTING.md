# Beta Testing

Last updated: 2026-06-18

Use this guide once a staging URL exists and before inviting a broader public audience.

## Beta Positioning

Cancer Prevention Passport should be described to testers as a personal organizer and clinician conversation aid. Do not describe it as a diagnostic tool, treatment tool, medical device, or replacement for care from a licensed clinician.

Testers should not enter protected health information, real medical records, or sensitive personal details until production privacy, compliance, and support processes are complete.

## Tester Invitation Checklist

- Confirm `main` is green in CI.
- Confirm the staging app URL is live.
- Confirm Firestore rules were deployed to staging.
- Confirm Google sign-in works on the staging URL.
- Confirm legal pages use the current beta support contact.
- Confirm known issues are documented in `docs/KNOWN_ISSUES.md`.
- Confirm release notes are updated in `docs/BETA_RELEASE_NOTES.md`.
- Confirm feedback will be collected through GitHub issues or a private intake form.

## Core Test Script

Ask each tester to complete this flow on one desktop browser and one phone browser when possible.

1. Open the staging URL.
2. Read the medical disclaimer and privacy/terms links.
3. Sign in with Google.
4. Complete or edit the profile form using non-sensitive test information.
5. Add at least one screening event.
6. Review recommendations and note whether the language feels clear and appropriately cautious.
7. Export FHIR JSON.
8. Export the clinician PDF.
9. Sign out.
10. Reopen the app and confirm the session/user data behavior is expected.

## Feedback Categories

Classify every beta issue with one primary category:

- `P0`: app launch, sign-in, data loss, cross-user access, or unsafe recommendation issue.
- `P1`: blocked core workflow, broken export, or misleading clinical/product language.
- `P2`: confusing UX, mobile layout problem, accessibility issue, or missing helper text.
- `P3`: polish, copy, documentation, or small fit-and-finish issue.

## Triage Cadence

During beta:

- Review new feedback at least twice per week.
- Move P0/P1 issues into the next sprint before inviting more testers.
- Keep `docs/KNOWN_ISSUES.md` current after every beta build.
- Add a short dated entry to `docs/BETA_RELEASE_NOTES.md` for every beta deploy.
- Do not promote staging to production while unresolved P0/P1 issues remain.

## Privacy Reminder For Public GitHub

GitHub issues in this repository are public. Use them only for product, technical, UX, or non-sensitive clinical-language feedback. Private security, privacy, or health-data concerns should use GitHub private security advisories or a private support channel.
