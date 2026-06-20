# Known Issues

Last updated: 2026-06-18

This file tracks issues that beta testers should know before using a staging build.

## Current Known Issues

- Native iOS and Android shells exist, but native simulator/device QA has not been completed on this machine.
- Native Google sign-in behavior has not been validated inside iOS or Android webviews.
- Production privacy, terms, and medical disclaimer pages still need final legal/clinical review.
- Recommendation logic is guideline-inspired and must be clinically reviewed before public clinical use.
- Account/data export and deletion controls exist in the Profile tab, but the deletion flow still needs staging QA with a throwaway Google account.
- Firestore rules tests pass in CI, but local rules testing requires Java to be installed.

## Resolved Issues

- PWA service worker, offline page, and manifest are present for web beta validation.
- Capacitor iOS and Android shells sync production web assets.
- Deployment workflows validate required staging/production environment variables before deploy steps.
