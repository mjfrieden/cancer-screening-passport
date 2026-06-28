# Known Issues

Last updated: 2026-06-28

This file tracks issues that beta testers should know before using a staging build.

## Current Known Issues

- Native iOS and Android shells exist, but native simulator/device QA is blocked
  on this machine because full Xcode and a Java/Android SDK toolchain are not
  installed.
- Native Google sign-in behavior has not been validated inside iOS or Android webviews.
- Production privacy, terms, and medical disclaimer pages still need final legal/clinical review.
- Production support is published at `support@whitecloudmedical.com`; a final
  incident-response owner still must be assigned.
- Recommendation logic is guideline-inspired and must be clinically reviewed before public clinical use.
- Recommendation source URLs and review status are now emitted, but the actual wording and intervals still need clinician sign-off.
- Consent acknowledgement is implemented and White Cloud Medical, LLC has
  reviewed the current policies. Independent counsel confirmation remains
  recommended for enforceability and jurisdiction-specific requirements.
- Account/data export and deletion controls exist in the Profile tab, but the deletion flow still needs staging QA with a throwaway Google account.
- Firestore rules tests pass in CI and cover cross-user profile, consent, and
  screening-event isolation; local rules testing still requires Java.

## Resolved Issues

- PWA service worker, offline page, and manifest are present for web beta validation.
- Capacitor iOS and Android shells sync production web assets.
- Approved brand lockup, PWA icons, iOS app icon, and Android launcher assets are
  integrated.
- Bottom navigation and fixed actions account for mobile safe areas.
- Deployment workflows validate required staging/production environment variables before deploy steps.
- Public GitHub issue templates warn against sensitive data and private security/privacy intake is documented.
