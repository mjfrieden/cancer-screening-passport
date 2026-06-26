# Web Beta Checklist

Use this checklist before sending a staging link to beta testers.

## Infrastructure

- [ ] Dedicated staging Firebase project exists.
- [ ] Dedicated production Firebase project exists.
- [ ] `.firebaserc` points to real dev/staging/production project IDs.
- [ ] Firestore database exists in staging.
- [ ] Firebase Authentication Google provider is enabled.
- [ ] Staging domain is added to Firebase Auth authorized domains.
- [ ] Firestore rules are deployed to staging.
- [ ] CI is green on `main`.
- [ ] GitHub `staging` environment variables are configured.
- [ ] GitHub `staging` environment secrets for Google Workload Identity are configured.
- [ ] Static hosting target exists.
- [ ] Staging deploy does not require Cloud Run, Cloud Build, or Artifact Registry while the cost ceiling is near $0.
- [ ] `npm run preflight:beta` passes.
- [ ] `Deploy Firestore Rules` workflow has passed for staging, or rules were deployed manually.
- [ ] `Deploy Static Cloudflare Pages`, `Deploy Static Firebase Hosting`, or equivalent static-host deploy has passed for staging.

## App Configuration

- [ ] `VITE_ENABLE_CLINICAL_SIMULATOR=false`.
- [ ] All `VITE_FIREBASE_*` staging values are set at build time.
- [ ] `APP_URL` points to the staging URL.
- [ ] Legal pages include real support contact information.
- [ ] Privacy/terms/disclaimer links are reachable from the app.
- [ ] Support page is reachable from the app.
- [ ] Current privacy, terms, and medical disclaimer acknowledgement is required after sign-in.

## Functional Checks

- [ ] Sign in with Google.
- [ ] Save profile.
- [ ] Add screening event.
- [ ] View generated recommendations.
- [ ] Download FHIR JSON.
- [ ] Download clinician PDF.
- [ ] Export local account data JSON from Profile.
- [ ] Delete app data/account with a throwaway tester account.
- [ ] Sign out.
- [ ] Confirm a second user cannot access the first user's documents.

## Mobile Checks

- [ ] PWA manifest is reachable.
- [ ] Service worker is reachable.
- [ ] Offline fallback page is reachable.
- [ ] App can be added to iOS Home Screen.
- [ ] App can be installed from Android Chrome.
- [ ] iOS Safari layout works.
- [ ] Android Chrome layout works.
- [ ] Bottom navigation respects safe areas.
- [ ] PDF download behavior is acceptable.
- [ ] JSON download/share behavior is acceptable.

## Native Shell Checks

- [ ] `npm run cap:sync` completes.
- [ ] iOS project opens in Xcode.
- [ ] Android project opens in Android Studio.
- [ ] Bundle/application ID is approved for store use.
- [ ] Native Google sign-in behavior is tested.

## Product Safety

- [ ] No "HIPAA-ready" claim unless compliance review supports it.
- [ ] No guaranteed EHR/EMR import claim.
- [ ] Medical disclaimer is visible.
- [ ] Recommendation output is described as guideline-inspired and clinician-reviewable.
- [ ] Survivorship recommendations require clinician review.
- [ ] Recommendation source URLs and clinical review status are present for generated recommendations.

## Feedback Loop

- [ ] Tester instructions are published in `docs/BETA_TESTING.md`.
- [ ] Known issues are published in `docs/KNOWN_ISSUES.md`.
- [ ] Beta release notes are updated in `docs/BETA_RELEASE_NOTES.md`.
- [ ] GitHub bug report issue template exists.
- [ ] GitHub beta feedback issue template exists.
- [ ] Private GitHub Security Advisory intake path exists for security, privacy, or health-data concerns.
- [ ] Support owner is assigned.
- [ ] Beta cohort list is documented outside the app.
