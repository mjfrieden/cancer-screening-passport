# Capacitor Native Shell

Last updated: 2026-06-29

The project now includes Capacitor iOS and Android shells around the production web build.

## Current Native Configuration

- App name: `Cancer Prevention Passport`
- Bundle/application ID: `com.whitecloudmedical.cancerpassport`
- Web directory: `dist`
- iOS shell: `ios/`
- Android shell: `android/`

Confirm the bundle/application ID before App Store or Play Store submission. Changing it later can affect signing, app transfer, and store listing continuity.

## Common Commands

```bash
npm run cap:sync
npm run native:check
npm run qa:store
npm run cap:open:ios
npm run cap:open:android
```

`npm run cap:sync` builds the web app and syncs assets into both native projects.

`npm run native:check` verifies the checked-in native identity files still match the production app ID and app name.

`npm run qa:store` runs the mobile browser store-prep pass, captures screenshots, and writes a markdown report under `artifacts/store-submission-qa/`.

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

This development machine generated the native shells, but it currently does
not have full Xcode selected and does not have a Java runtime or Android SDK
available. GitHub Actions run `28389768588` successfully compiled Android unit
tests and a debug APK. Local device testing and signed release builds still
need the local toolchains.

Current App Store uploads require Xcode 26 or later with the iOS 26 SDK or
later.

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

## Native Health-Data Protections

- Android OS backup is disabled.
- Android cleartext network traffic is disabled.
- Android file sharing is restricted to the app's export cache directory.
- CI compiles the Android application so manifest and resource errors block
  merges.
- Production Firebase iOS and Android registrations are checked into the
  native shells using the shared app identifier.
- Google authentication uses the native provider and then signs into the
  Firebase JavaScript session so existing Firestore access rules remain in
  force.

See `docs/STORE_SUBMISSION_PREP.md` for the fuller store asset, compliance, and native QA checklist.
