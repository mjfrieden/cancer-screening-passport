# Public Production Roadmap

Last updated: 2026-06-28

This roadmap separates a controlled web beta from public production and app-store launch. Cancer Prevention Passport handles sensitive health-related information, so production means more than a passing build.

## Phase 1: Staging Web Beta

Goal: deploy a controlled staging beta for invited testers using non-sensitive or throwaway data.

- Create dedicated Firebase/GCP staging and production projects.
- Configure GitHub `staging` and `production` environments.
- Deploy Firestore rules to staging.
- Deploy the static PWA to Cloudflare Pages Free, Firebase Hosting Spark, or another static host.
- Add the staging URL to Firebase Auth authorized domains.
- Run the web beta checklist end to end.
- Validate account data export and account/data deletion with throwaway Google accounts.
- Keep known issues and beta release notes current after every staging deploy.

Exit criteria:

- CI is green.
- Cloudflare Pages or Firebase Hosting static staging deploy and `npm run smoke:static` pass.
- Sign-in, profile save, screening event save, recommendations, exports, deletion, and sign-out work on staging.
- No unresolved P0/P1 beta issues remain.

## Phase 2: Production Web Readiness

Goal: prepare the hosted web app for real public use.

- Replace beta legal pages with counsel-reviewed privacy, terms, and medical disclaimer pages.
- Add production support contact and private security/privacy intake path.
- Record user acknowledgement of privacy, terms, and medical disclaimer before health data entry.
- Define breach response, support, data retention, data export, and deletion operations.
- Decide whether protected health information is allowed.
- If PHI is allowed, complete vendor review, BAAs, access controls, audit logging, and incident response controls.
- Add uptime monitoring, structured server logs, and client error monitoring.
- Complete accessibility and mobile browser QA.
- Clinically review recommendation language, citations, and guideline versions.

Exit criteria:

- Production Firebase/GCP is separate from staging.
- Policies and support workflows are final.
- Observability is live.
- Clinical/legal reviewers approve the public positioning.

## Phase 3: PWA Public Launch

Goal: launch the installable web app publicly before native store submission.

- Deploy production web.
- Verify custom domain and Firebase authorized domains.
- Run production smoke tests.
- Verify installability on iOS Safari and Android Chrome.
- Validate support, deletion, export, and feedback paths.
- Publish release notes and known issues.

Exit criteria:

- Production web/PWA works across target devices.
- No unresolved production launch blockers remain.

## Phase 4: Native Store Preparation

Goal: prepare iOS and Android submissions after the web/PWA path is stable.

- Install and configure full Xcode, Java, Android Studio, SDKs, and signing.
- Confirm final bundle/application ID.
- Generate final app icons and splash assets.
- Run native QA on simulator/emulator and physical devices.
- Validate native Google sign-in behavior.
- Prepare store screenshots, descriptions, support URL, privacy URL, and disclaimer URL.
- Complete Apple privacy nutrition labels.
- Complete Google Play Data Safety form.
- Upload TestFlight and Play closed testing builds.

Exit criteria:

- Signed iOS archive and Android App Bundle are produced.
- TestFlight and Play closed testing feedback is addressed.
- Store metadata and compliance forms are complete.

## Current Next Step

The authenticated controlled-beta path at
`https://cancer-screening-passport.pages.dev` now passes for sign-in, persisted
synthetic profile/event data, recommendations, navigation, exports, sign-out,
keyboard skip navigation, and Firestore cross-user isolation. Production brand
assets are live across the PWA and native icon sets.

The next gates are:

1. Assign the final incident-response owner. Public support is now monitored at
   `support@whitecloudmedical.com`.
2. White Cloud Medical, LLC reviewed the current policies and physician content
   review was completed June 28, 2026. Obtain independent counsel confirmation
   for enforceability and jurisdiction-specific requirements before real-PHI
   production.
3. Test PWA installation, downloads, and safe areas on physical iOS and Android
   devices.
4. Install full Xcode plus Java/Android SDK tooling, then build and run the
   Capacitor shells.
5. The separate production Firebase project `cancer-passport-wcm-prod` was
   created under the White Cloud Medical organization on June 28, 2026. It
   remains unbilled, closed to PHI, and blocked by the HIPAA production gate.

White Cloud Medical, LLC is the application operator and intended store
publisher. The final bundle/application ID is
`com.whitecloudmedical.cancerpassport`.

Legal/compliance and incident-response working documents now live in
`docs/LEGAL_COMPLIANCE_REVIEW.md` and
`docs/HEALTH_DATA_INCIDENT_RESPONSE.md`.

See `docs/STATIC_FREE_DEPLOYMENT.md` and `docs/CLOUDFLARE_PAGES_DEPLOYMENT.md` for the recommended no-cost deployment path.

GitHub Environments named `staging` and `production` now exist. A `cancer-passport-staging` Google Cloud project and default Firestore database exist under `marshall@whitecloudmedical.com`, but billing is not linked and Cloud Run should remain paused under the $0.05/month ceiling.

Firebase activation, the staging web app, Google sign-in, authorized Pages
domain, Firestore rules, GitHub staging variables, Cloudflare deployment, live
static smoke tests, authenticated browser verification, production brand
assets, and safe-area support are complete. The project remains on the no-cost
Firebase Spark and Cloudflare Pages Free path.
See `docs/STAGING_STATUS.md`.

Beta security/privacy intake is documented in `SECURITY.md` and `docs/SECURITY_PRIVACY_INTAKE.md`, but production still needs a monitored support address and named incident-response owner.
