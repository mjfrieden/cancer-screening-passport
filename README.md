# Cancer Prevention Passport

A mobile-first web application for organizing cancer screening history, survivorship context, guideline-inspired reminders, and clinician-ready exports.

## Current Capabilities

- Firebase Google sign-in.
- Patient profile and screening history storage in Firestore.
- Rule-based preventive screening and survivorship recommendations.
- FHIR JSON export and QR display.
- Physician summary PDF export.
- Responsive React UI designed for phone-sized use.

## Run Locally

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Validate

```bash
npm run lint
npm run build
npm run audit
npm run smoke
npm run native:check
npm run test:rules
```

`npm run test:rules` uses the Firebase Firestore emulator and requires Java locally. GitHub Actions installs Java automatically.

## Configuration

Copy `.env.example` to `.env.local` for local development and set the `VITE_FIREBASE_*` values for your Firebase environment. Use separate Firebase projects for local/staging/production before inviting beta users.

Copy `.firebaserc.example` to `.firebaserc` and replace the project IDs after creating dedicated Firebase projects.

## Production Readiness

See [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md) before using this with real patients or submitting to app stores.

For the public launch path, see [docs/PUBLIC_PRODUCTION_ROADMAP.md](docs/PUBLIC_PRODUCTION_ROADMAP.md).

For the first hosted beta, see [docs/WEB_BETA_DEPLOYMENT.md](docs/WEB_BETA_DEPLOYMENT.md) and [docs/WEB_BETA_CHECKLIST.md](docs/WEB_BETA_CHECKLIST.md).

For beta tester instructions, known issues, and release notes, see [docs/BETA_TESTING.md](docs/BETA_TESTING.md), [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md), and [docs/BETA_RELEASE_NOTES.md](docs/BETA_RELEASE_NOTES.md).

For GitHub deployment environment setup, see [docs/GITHUB_ENVIRONMENTS.md](docs/GITHUB_ENVIRONMENTS.md).

For real staging Firebase/GCP setup, see [docs/STAGING_CLOUD_SETUP_RUNBOOK.md](docs/STAGING_CLOUD_SETUP_RUNBOOK.md).

For the recommended no-cost static deployment path, see [docs/STATIC_FREE_DEPLOYMENT.md](docs/STATIC_FREE_DEPLOYMENT.md).

For the current staging project state and Firebase activation blocker, see [docs/STAGING_STATUS.md](docs/STAGING_STATUS.md).

For installable browser beta behavior, see [docs/PWA_BETA.md](docs/PWA_BETA.md).

For iOS/Android wrapper work, see [docs/CAPACITOR_NATIVE.md](docs/CAPACITOR_NATIVE.md).

For App Store and Google Play preparation, see [docs/STORE_SUBMISSION_PREP.md](docs/STORE_SUBMISSION_PREP.md).

## Beta Legal Pages

- `/legal/privacy.html`
- `/legal/terms.html`
- `/legal/medical-disclaimer.html`

## Important Medical Disclaimer

This project is not a medical device and does not replace care from a licensed clinician. Recommendation logic must be clinically validated, legally reviewed, and backed by traceable guideline sources before public clinical use.
