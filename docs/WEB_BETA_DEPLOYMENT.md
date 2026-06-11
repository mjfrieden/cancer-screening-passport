# Web Beta Deployment

Last updated: 2026-06-11

This app is ready to deploy as a single Node service that serves both:

- the React/Vite static app from `dist/`
- the Express API under `/api/*`

The recommended first web beta target is a container host such as Cloud Run, Render, Fly.io, or Railway. Cloud Run is the cleanest fit if Firebase and Google Cloud are already part of the operating model.

## Required Environments

Create separate Firebase projects before inviting beta users:

- `cancer-passport-dev`
- `cancer-passport-staging`
- `cancer-passport-production`

Update `.firebaserc` from `.firebaserc.example` after the projects exist.

## Required Firebase Setup

For each environment:

1. Enable Firebase Authentication.
2. Enable Google sign-in provider.
3. Create a Firestore database.
4. Deploy `firestore.rules`.
5. Add the deployed web domain to Firebase Authentication authorized domains.
6. Add the same domain to Google OAuth consent configuration where required.

## Build-Time Variables

Vite embeds Firebase client configuration during build. These values must be available when the app is built, not only when the container starts.

```bash
VITE_ENABLE_CLINICAL_SIMULATOR=false
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_FIRESTORE_DATABASE_ID=(default)
```

## Cloud Run Container Build

Example local container build for staging:

```bash
docker build \
  --build-arg VITE_ENABLE_CLINICAL_SIMULATOR=false \
  --build-arg VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN" \
  --build-arg VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="$VITE_FIREBASE_STORAGE_BUCKET" \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
  --build-arg VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID" \
  --build-arg VITE_FIREBASE_MEASUREMENT_ID="$VITE_FIREBASE_MEASUREMENT_ID" \
  --build-arg VITE_FIREBASE_FIRESTORE_DATABASE_ID="$VITE_FIREBASE_FIRESTORE_DATABASE_ID" \
  -t cancer-screening-passport:staging .
```

Cloud Run injects `PORT`; the server now honors that automatically.

## Smoke Test

After deployment:

```bash
SMOKE_BASE_URL="https://your-staging-url" npm run smoke
```

The smoke test verifies:

- `/api/health`
- app shell
- web manifest
- privacy page
- terms page
- medical disclaimer page

## Staging Go/No-Go

Before inviting testers, confirm:

- CI is green on `main`.
- `npm run test:rules` passes in CI.
- Firestore rules are deployed to staging.
- Google sign-in works on the staging domain.
- User A cannot read User B data.
- PDF export works on mobile browser.
- FHIR JSON export works on mobile browser.
- Legal pages use a real support contact before public sharing.
- The app is positioned as a patient organizer and conversation aid, not diagnosis or treatment.

## Production Promotion

Do not promote staging to production until:

- clinical content has clinician review,
- privacy/terms have legal review,
- Firebase production project is separate from staging,
- backup/export/deletion workflows are documented,
- support and incident response ownership are assigned.
