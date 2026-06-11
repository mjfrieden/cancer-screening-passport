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
- [ ] Artifact Registry repository exists.
- [ ] Cloud Run service account has deploy and Artifact Registry permissions.
- [ ] `Deploy Firestore Rules` workflow has passed for staging.
- [ ] `Deploy Web` workflow has passed for staging.

## App Configuration

- [ ] `VITE_ENABLE_CLINICAL_SIMULATOR=false`.
- [ ] All `VITE_FIREBASE_*` staging values are set at build time.
- [ ] `APP_URL` points to the staging URL.
- [ ] Legal pages include real support contact information.
- [ ] Privacy/terms/disclaimer links are reachable from the app.

## Functional Checks

- [ ] Sign in with Google.
- [ ] Save profile.
- [ ] Add screening event.
- [ ] View generated recommendations.
- [ ] Download FHIR JSON.
- [ ] Download clinician PDF.
- [ ] Sign out.
- [ ] Confirm a second user cannot access the first user's documents.

## Mobile Checks

- [ ] iOS Safari layout works.
- [ ] Android Chrome layout works.
- [ ] Bottom navigation respects safe areas.
- [ ] PDF download behavior is acceptable.
- [ ] JSON download/share behavior is acceptable.

## Product Safety

- [ ] No "HIPAA-ready" claim unless compliance review supports it.
- [ ] No guaranteed EHR/EMR import claim.
- [ ] Medical disclaimer is visible.
- [ ] Recommendation output is described as guideline-inspired and clinician-reviewable.
- [ ] Survivorship recommendations require clinician review.

## Feedback Loop

- [ ] Tester intake form exists.
- [ ] Bug report channel exists.
- [ ] Support owner is assigned.
- [ ] Beta cohort list is documented outside the app.
