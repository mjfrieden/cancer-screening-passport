# Public Production Roadmap

Last updated: 2026-06-24

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

Deploy a static no-cost staging PWA through the manual Cloudflare Pages workflow, then run the controlled beta checklist.

See `docs/STATIC_FREE_DEPLOYMENT.md` and `docs/CLOUDFLARE_PAGES_DEPLOYMENT.md` for the recommended no-cost deployment path.

GitHub Environments named `staging` and `production` now exist. A `cancer-passport-staging` Google Cloud project and default Firestore database exist under `marshall@whitecloudmedical.com`, but billing is not linked and Cloud Run should remain paused under the $0.05/month ceiling.

Firebase activation is currently blocked by `PERMISSION_DENIED`; see `docs/STAGING_STATUS.md`.

Beta security/privacy intake is documented in `SECURITY.md` and `docs/SECURITY_PRIVACY_INTAKE.md`, but production still needs a monitored support address and named incident-response owner.
