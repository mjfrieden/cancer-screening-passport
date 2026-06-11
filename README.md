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
```

## Configuration

Firebase client configuration currently lives in `firebase-applet-config.json`. For production, create a dedicated Firebase project and keep separate local, staging, and production configs.

## Production Readiness

See [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md) before using this with real patients or submitting to app stores.

## Important Medical Disclaimer

This project is not a medical device and does not replace care from a licensed clinician. Recommendation logic must be clinically validated, legally reviewed, and backed by traceable guideline sources before public clinical use.
