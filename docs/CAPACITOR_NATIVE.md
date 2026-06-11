# Capacitor Native Shell

Last updated: 2026-06-11

The project now includes Capacitor iOS and Android shells around the production web build.

## Current Native Configuration

- App name: `Cancer Prevention Passport`
- Bundle/application ID: `com.mjfrieden.cancerpassport`
- Web directory: `dist`
- iOS shell: `ios/`
- Android shell: `android/`

Confirm the bundle/application ID before App Store or Play Store submission. Changing it later can affect signing, app transfer, and store listing continuity.

## Common Commands

```bash
npm run cap:sync
npm run cap:open:ios
npm run cap:open:android
```

`npm run cap:sync` builds the web app and syncs assets into both native projects.

## Local Prerequisites

For iOS:

- full Xcode installed,
- Xcode selected with `xcode-select`,
- Apple Developer account,
- signing team configured in Xcode.

For Android:

- Java runtime,
- Android Studio,
- Android SDK,
- signing keystore for release builds.

This development machine generated the native shells, but it currently does not have full Xcode selected and does not have a Java runtime available. Native compilation still needs that local setup or CI runners configured with those toolchains.

## Native QA Checklist

- Launch iOS app in simulator.
- Launch Android app in emulator.
- Verify Google sign-in behavior inside the native webview.
- Verify Firebase authorized domains and OAuth redirect behavior.
- Verify profile save and screening event save.
- Verify PDF export behavior in native webview.
- Verify FHIR JSON export/share behavior.
- Verify legal pages open and are readable.
- Verify offline fallback behavior.
- Verify safe-area spacing around top and bottom bars.
- Verify keyboard behavior on profile and modal forms.

## Store Submission Blockers

- Final app icon and splash assets.
- App Store screenshots.
- Play Store screenshots.
- Privacy policy URL with production support contact.
- Terms URL with production support contact.
- Medical disclaimer reviewed by counsel/clinical reviewer.
- Apple privacy nutrition labels.
- Google Play Data Safety form.
- Signed iOS archive.
- Signed Android App Bundle.
- TestFlight and closed Play testing feedback.
