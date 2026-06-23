# Static Free Deployment

Last updated: 2026-06-23

This is the recommended path while the project needs to stay at or near $0/month.

The app can now run as a static PWA because recommendation generation runs in the browser from shared TypeScript logic. The Express server remains useful for local development and future paid/server deployment, but staging does not require Cloud Run.

## Recommended Free Stack

- Static hosting: Firebase Hosting Spark, Cloudflare Pages Free, or GitHub Pages.
- Data: Firebase Authentication and Firestore Spark/free quota.
- Recommendation engine: bundled client-side TypeScript.
- PWA: manifest, service worker, offline fallback.

## Why This Avoids Cloud Run Costs

The prior Cloud Run plan required billing, Artifact Registry, and container deploys. Artifact Registry has a small free storage allowance but can become billable after a few container images. Static hosting avoids containers entirely.

## Build

```bash
npm run build:static
```

Static assets are generated in `dist/`.

## Static Smoke Test

For static hosts without `/api/health`, use:

```bash
SMOKE_BASE_URL="https://your-staging-url" npm run smoke:static
```

This verifies the app shell, manifest, service worker, legal pages, offline page, and support page while skipping the server-only health endpoint.

## Firebase Hosting Spark

Firebase Hosting can serve the `dist/` folder without Cloud Run.

Required setup:

- Firebase project enabled.
- Firebase Authentication Google provider enabled.
- Firestore database created.
- Authorized domain added for the hosting URL.
- Build-time `VITE_FIREBASE_*` values configured in CI or local shell.

Deploy shape:

```bash
npm run build:static
npx -y firebase-tools@13.13.3 deploy --only hosting --project cancer-passport-staging
```

A manual GitHub Actions workflow is also available:

```text
Deploy Static Firebase Hosting
```

It builds `dist/` and deploys Firebase Hosting without Docker, Cloud Run, Cloud Build, or Artifact Registry.

## Cloudflare Pages Free

Cloudflare Pages can build and serve the static app directly from GitHub.

Suggested settings:

- Build command: `npm run build:static`
- Output directory: `dist`
- Environment variables: all `VITE_FIREBASE_*` values plus `VITE_ENABLE_CLINICAL_SIMULATOR=false`
- Smoke check: `npm run smoke:static`

Add the Cloudflare Pages domain to Firebase Authentication authorized domains before testing Google sign-in.

## GitHub Pages

GitHub Pages can work for a simple public beta, but Cloudflare Pages or Firebase Hosting are better fits for preview deployments and custom domains.

## What Still Requires Manual QA

- Google sign-in on the staging domain.
- Profile save.
- Consent acknowledgement.
- Screening event save.
- Recommendation generation.
- FHIR JSON export.
- PDF export.
- Account data export.
- Account/data deletion with a throwaway account.
