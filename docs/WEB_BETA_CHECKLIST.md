# Web Beta Checklist

Use this checklist before sending a staging link to beta testers.

## Infrastructure

- [x] Dedicated staging Firebase project exists.
- [x] Dedicated production Firebase project exists.
- [x] `.firebaserc` points to real dev/staging/production project IDs.
- [x] Firestore database exists in staging.
- [x] Firebase Authentication Google provider is enabled.
- [x] Staging domain is added to Firebase Auth authorized domains.
- [x] Firestore rules are deployed to staging.
- [x] CI is green on `main`.
- [x] GitHub `staging` environment variables are configured.
- [ ] GitHub `staging` environment secrets for Google Workload Identity are configured.
- [x] Static hosting target exists.
- [x] Staging deploy does not require Cloud Run, Cloud Build, or Artifact Registry while the cost ceiling is near $0.
- [x] `npm run preflight:beta` passes.
- [x] `Deploy Firestore Rules` workflow has passed for staging, or rules were deployed manually.
- [x] `Deploy Static Cloudflare Pages`, `Deploy Static Firebase Hosting`, or equivalent static-host deploy has passed for staging.
- [x] BAA-covered App Engine Standard production host is live with F1,
  `min_instances=0`, and `max_instances=1`.
- [x] Production App Engine deployment and live smoke workflow passed.
- [x] Production hostname is authorized in Identity Platform.
- [x] Production Google sign-in completed with the approved White Cloud
  Medical account using synthetic data only.

## App Configuration

- [x] `VITE_ENABLE_CLINICAL_SIMULATOR=false`.
- [x] `VITE_REAL_PHI_ENABLED=false` is enforced for the synthetic production
  beta.
- [x] Synthetic-data-only warning is visible before sign-in, during consent,
  and in the authenticated application.
- [x] All `VITE_FIREBASE_*` staging values are set at build time.
- [x] `APP_URL` points to the staging URL.
- [x] Legal pages include `support@whitecloudmedical.com`.
- [x] Privacy/terms/disclaimer links are reachable from the app.
- [x] Support page is reachable from the app.
- [x] Current privacy, terms, and medical disclaimer acknowledgement is required after sign-in.

## Functional Checks

- [x] Sign in with Google.
- [x] Save profile.
- [x] Add screening event.
- [x] View generated recommendations.
- [x] Download FHIR JSON.
- [x] Download clinician PDF.
- [x] Export local account data JSON from Profile.
- [x] Delete app data/account with a throwaway tester account.
- [x] Sign out.
- [x] Confirm a second user cannot access the first user's documents.
- [x] Production synthetic profile, screening record, recommendation refresh,
  JSON export, and permanent app-account deletion completed.
- [ ] Repeat production isolation check with a second Google test account.

## Mobile Checks

- [x] PWA manifest is reachable.
- [x] Service worker is reachable.
- [x] Offline fallback page is reachable.
- [ ] App can be added to iOS Home Screen.
- [ ] App can be installed from Android Chrome.
- [ ] iOS Safari layout works.
- [ ] Android Chrome layout works.
- [x] Bottom navigation respects safe areas.
- [x] PDF download behavior is acceptable in desktop Chrome.
- [x] JSON download/share behavior is acceptable in desktop Chrome.

## Native Shell Checks

- [x] `npm run cap:sync` completes.
- [ ] iOS project opens in Xcode.
- [ ] Android project opens in Android Studio.
- [ ] Bundle/application ID is approved for store use.
- [ ] Native Google sign-in behavior is tested.

## Product Safety

- [x] No "HIPAA-ready" claim unless compliance review supports it.
- [x] No guaranteed EHR/EMR import claim.
- [x] Medical disclaimer is visible.
- [x] Recommendation output is described as guideline-inspired and clinician-reviewable.
- [x] Survivorship recommendations require clinician review.
- [x] Recommendation source URLs and clinical review status are present for generated recommendations.
- [x] Baseline keyboard focus, skip navigation, named icon actions, dialog semantics, and reduced-motion support are guarded by beta preflight.
- [x] Signed-out entry screen renders without horizontal overflow or console errors at desktop and 390x844 phone viewports.
- [ ] Complete authenticated keyboard and screen-reader walkthrough with a throwaway account.

## Feedback Loop

- [x] Tester instructions are published in `docs/BETA_TESTING.md`.
- [x] Known issues are published in `docs/KNOWN_ISSUES.md`.
- [x] Beta release notes are updated in `docs/BETA_RELEASE_NOTES.md`.
- [x] GitHub bug report issue template exists.
- [x] GitHub beta feedback issue template exists.
- [x] Private GitHub Security Advisory intake path exists for security, privacy, or health-data concerns.
- [x] Support owner is assigned to Marshall Frieden.
- [ ] Beta cohort list is documented outside the app.
