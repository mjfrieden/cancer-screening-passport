# Production Readiness Review

Last reviewed: 2026-06-10

## Current Status

This project is a working React/Vite prototype with Firebase Authentication, Firestore persistence, an Express-hosted recommendation endpoint, patient profile/screening entry flows, FHIR JSON export, and PDF summary export.

The app builds successfully, but it is not yet ready for public clinical use or app-store submission.

## What Works

- Google sign-in through Firebase Auth.
- Per-user profile and screening event persistence in Firestore.
- Local rules-based recommendation generation through `/api/recommendations/preventive-screening`.
- Responsive, mobile-shaped React UI with bottom navigation.
- Clinician-facing PDF export and simplified FHIR JSON bundle export.
- Production Vite build plus bundled Express server.

## Launch Blockers

- Clinical validation: the recommendation engine has hard-coded dates, simplified intervals, and guideline claims that need clinician review, citations, versioning, and test fixtures.
- Medical/legal positioning: remove or soften unverified claims such as "HIPAA-ready" and direct EMR import until compliance, BAA coverage, audit logging, and integration testing are complete.
- Health data governance: add privacy policy, terms, consent flow, data deletion/export flow, breach response process, and support contact.
- Firebase production setup: move from the AI Studio Firebase project to a clean product Firebase project with staging and production environments.
- Firestore rules: list-query rules should be tested with the Firebase emulator; collection queries commonly require query constraints that rules can prove.
- Mobile packaging: no native iOS/Android projects exist yet. Use Capacitor for store builds or keep the first release as a PWA/web app.
- Store assets: create raster app icons, splash screens, screenshots, store descriptions, privacy nutrition labels, and support URLs.
- Observability: add structured server logs, client error monitoring, uptime monitoring, and crash reporting.
- Accessibility and QA: add keyboard/screen-reader checks, mobile viewport checks, and user-flow tests.

## Recommended Release Path

1. Web beta: deploy the current app behind a production Firebase project and a custom domain.
2. PWA beta: keep the app installable on mobile browsers while collecting feedback.
3. Native shell: add Capacitor once the web beta is stable, then build iOS and Android wrappers.
4. Store submission: submit after privacy, clinical validation, screenshots, native project signing, and review metadata are complete.

## Technical Next Steps

- Replace fixed due dates with dates calculated from event history and guideline intervals.
- Move guideline content into structured, cited data fixtures instead of inline strings.
- Add unit tests for age boundaries, smoking history, abnormal results, and survivorship branches.
- Hide the profile preset simulator behind a development flag.
- Add Firebase emulator tests for Firestore security rules.
- Code-split heavy PDF/chart/FHIR dependencies to reduce the initial bundle.
- Add a `public/` raster icon set generated from the SVG app mark before store packaging.

## Store Notes

- Apple App Store and Google Play may scrutinize medical functionality. Position the app as an organizer and conversation aid unless validated clinical decision support requirements are met.
- If the app stores protected health information, deployment needs HIPAA-aligned hosting, BAAs with vendors that handle PHI, access controls, logging, retention policy, and deletion workflows.
- FHIR export should be described as a structured patient-held export until tested with specific EHR import workflows.
