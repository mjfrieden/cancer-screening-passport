# Production Readiness Review

Last reviewed: 2026-06-28

## Current Status

This project is a working React/Vite prototype with Firebase Authentication, Firestore persistence, an Express-hosted recommendation endpoint, patient profile/screening entry flows, FHIR JSON export, and PDF summary export.

The app builds successfully, but it is not yet ready for public clinical use or app-store submission.

The live web app is now in production real-PHI mode; keep this document as the pre-launch readiness snapshot and use `docs/PRODUCTION_STATUS.md` for the current state.

## What Works

- Google sign-in through Firebase Auth.
- Per-user profile and screening event persistence in Firestore.
- Local rules-based recommendation generation bundled into the client app, with the Express API retained only for optional server deployments.
- Responsive, mobile-shaped React UI with bottom navigation.
- Clinician-facing PDF export and simplified FHIR JSON bundle export.
- Production Vite build plus bundled Express server.

## Launch Blockers

- Clinical governance: physician content review was recorded on June 28, 2026, and source tracing/test fixtures exist. Future medical-content changes still need versioned re-review, and all outputs remain educational rather than patient-specific medical advice.
- Medical/legal positioning: White Cloud Medical, LLC is identified as operator; education-only, no-relationship, warranty, and liability language is present. Licensed counsel still needs to review enforceability, state-specific requirements, and the final public policies.
- Health data governance: beta privacy policy, terms, medical disclaimer, consent acknowledgement, private GitHub Security Advisory intake, and data export/deletion controls exist; production legal review, breach response process, and monitored support contact are still required.
- Firebase production setup: move from the AI Studio Firebase project to a clean product Firebase project with staging and production environments.
- Mobile packaging: Capacitor iOS/Android shells exist, but native build signing and device QA are not complete.
- Store assets: branded raster app icons are complete; final splash screens, screenshots, store descriptions, privacy nutrition labels, and support URLs remain.
- Observability: add client error monitoring, uptime monitoring, and crash reporting. Structured server logs are only needed if the optional server path is used.
- Accessibility and QA: baseline keyboard focus, skip navigation, named icon actions, dialog semantics, reduced-motion support, and signed-out desktop/mobile viewport checks are complete. Authenticated screen-reader flows and real-device user-flow tests remain.

## Recommended Release Path

1. Web beta: deploy the current app behind a production Firebase project and a custom domain.
2. PWA beta: keep the app installable on mobile browsers while collecting feedback.
3. Native shell: Capacitor exists; build iOS and Android wrappers once the web beta is stable.
4. Store submission: submit after privacy, clinical validation, screenshots, native project signing, and review metadata are complete.

## Technical Next Steps

- Replace fixed due dates with dates calculated from event history and guideline intervals.
- Move guideline content into structured, cited data fixtures instead of inline strings.
- Add unit tests for age boundaries, smoking history, abnormal results, and survivorship branches.
- Complete clinician review using the trace metadata described in `docs/GUIDELINE_TRACEABILITY.md`.
- Keep `npm run preflight:beta` green as the static beta safety gate evolves.
- Hide the profile preset simulator behind a development flag.
- Code-split heavy PDF/chart/FHIR dependencies to reduce the initial bundle.
- Install full Xcode and Java/Android SDK tooling on the build machine.

## Store Notes

- Apple App Store and Google Play may scrutinize medical functionality. Position the app as an organizer and conversation aid unless validated clinical decision support requirements are met.
- If the app stores protected health information, deployment needs HIPAA-aligned hosting, BAAs with vendors that handle PHI, access controls, logging, retention policy, and deletion workflows.
- FHIR export should be described as a structured patient-held export until tested with specific EHR import workflows.
