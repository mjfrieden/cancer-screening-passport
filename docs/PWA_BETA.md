# PWA Beta

Last updated: 2026-06-11

Cancer Prevention Passport now includes a basic progressive web app foundation:

- installable web manifest,
- production-only service worker registration,
- offline fallback page,
- cache cleanup on service worker activation,
- smoke checks for PWA endpoints.

## Current Offline Behavior

The PWA shell and static legal pages can be cached. Clinical data workflows still require a network connection because authentication, Firestore records, recommendations, and exports depend on online services.

Offline mode must be described as a connectivity fallback, not as offline medical-record access.

## Manual Mobile QA

Run these checks before a PWA beta:

- Open the staging URL in iOS Safari.
- Add to Home Screen.
- Launch from the home-screen icon.
- Confirm standalone display without browser chrome.
- Repeat install flow on Android Chrome.
- Disable network and refresh a previously loaded page.
- Confirm the offline fallback appears when needed.
- Reconnect and confirm sign-in/profile data works.
- Confirm PDF and JSON export behavior on mobile browsers.

## Future Offline Work

Do not add offline health-record persistence until the data governance model is reviewed. If offline records are added later, include:

- explicit user consent,
- encrypted local storage strategy,
- cache clear/account sign-out behavior,
- device loss guidance,
- clinical and privacy review.
