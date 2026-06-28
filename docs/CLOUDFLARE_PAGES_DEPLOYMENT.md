# Cloudflare Pages Deployment

Last updated: 2026-06-24

Cloudflare Pages Free is the recommended no-cost static host fallback while Firebase Hosting activation for `cancer-passport-staging` is blocked.

This path is approved only for the no-PHI beta. Cloudflare states that it
enters into BAAs only with Enterprise customers, so Pages Free must not be used
as the production endpoint when real PHI is permitted. See
`docs/HIPAA_PRODUCTION_ARCHITECTURE.md`.

This path deploys the prebuilt `dist/` folder. It does not require Cloud Run, Cloud Build, Artifact Registry, billing, Workers, KV, R2, D1, or Pages Functions.

## Prerequisites

- A Cloudflare account on the Free plan.
- A Cloudflare Pages project, for example `cancer-screening-passport`.
- A working Firebase web app config for the selected environment.
- GitHub Environment variables and secrets configured for `staging` or `production`.

The app can be hosted on Cloudflare before Firebase activation is fixed, but sign-in and Firestore testing still require real Firebase web app values.

## Create the Pages Project

Use Direct Upload so GitHub Actions can deploy the already-built Vite app.

```bash
npm run build:static
npx wrangler pages project create
```

Use:

- project name: `cancer-screening-passport`
- production branch: `main`

Cloudflare will serve the project at a `*.pages.dev` URL. Keep that URL handy for Firebase Authentication authorized domains after Firebase activation is resolved.

## GitHub Environment Values

Start from `docs/cloudflare-pages.env.example`.

Set this as a GitHub Environment variable:

```bash
CLOUDFLARE_PAGES_PROJECT=cancer-screening-passport
```

Set these as GitHub Environment secrets:

```bash
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

The Cloudflare API token should be a custom token with Cloudflare Pages edit access for the account.

The existing `VITE_FIREBASE_*` variables are still required at build time. Keep `VITE_ENABLE_CLINICAL_SIMULATOR=false` for staging and production beta deploys.

## Deploy From GitHub Actions

Run the manual workflow:

```text
Deploy Static Cloudflare Pages
```

Choose `staging` first. The workflow:

- validates Firebase build variables,
- validates Cloudflare Pages deploy variables,
- builds `dist/`,
- deploys `dist/` with Wrangler Pages.

## Smoke Test

After deployment, run:

```bash
SMOKE_BASE_URL="https://your-pages-url.pages.dev" npm run smoke:static
```

Then add the Pages URL host to Firebase Authentication authorized domains before Google sign-in testing.

## Beta Checklist Gate

Do not invite beta users until:

- `Deploy Static Cloudflare Pages` passes for `staging`,
- `npm run smoke:static` passes against the Pages URL,
- Firebase Authentication Google provider is enabled,
- Firestore rules are deployed,
- sign-in, save, export, deletion, and sign-out are tested with throwaway accounts.
