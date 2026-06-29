# Store Submission Prep

Last updated: 2026-06-29

This project has a Capacitor iOS/Android shell, but it is not ready for App Store or Google Play submission until the items below are completed and reviewed.

## Current Native Status

- Capacitor app ID: `com.whitecloudmedical.cancerpassport`
- Publisher/operator: `White Cloud Medical, LLC`
- App name: `Cancer Prevention Passport`
- iOS wrapper exists in `ios/`
- Android wrapper exists in `android/`
- Web assets sync with `npm run cap:sync`
- CI validates Capacitor sync and native identity with `npm run native:check`
- CI run `28389768588` compiled Android unit tests and a debug APK successfully
  with target SDK 36.
- Production Firebase now has dedicated iOS and Android app registrations for
  `com.whitecloudmedical.cancerpassport`.
- Capacitor uses native Google Sign-In and exchanges the native ID token into
  the Firebase JavaScript session used by Firestore.
- A public account-deletion page is live at
  `https://cancer-passport-wcm-prod.uc.r.appspot.com/account-deletion.html`.

## Required Store Assets

- Final square app icon source, at least 1024x1024.
- iOS app icon set exported through Xcode asset catalogs.
- Android adaptive foreground/background icon assets.
- iOS launch image or launch storyboard styling.
- Android splash screen assets.
- iPhone screenshots for required App Store device sizes.
- iPad screenshots, unless iPad support is intentionally disabled.
- Android phone screenshots.
- Android tablet screenshots, if tablet support is listed.
- Short app description.
- Full app description.
- Keywords and category selection.
- Support URL.
- Marketing URL, if used.
- Public privacy policy URL.
- Public terms URL.
- Public medical disclaimer URL.

## Compliance Work

- Keep the app positioned as a White Cloud Medical, LLC health education and record-organizing service, not individualized medical advice.
- Replace beta legal pages with counsel-reviewed production policies before public release.
- Complete Apple privacy nutrition labels.
- Complete Google Play Data Safety form.
- Define account deletion and data deletion process.
- Define data export process.
- Confirm Firebase, hosting, monitoring, email, analytics, and crash-reporting vendors are appropriate for health data handling before PHI is collected.
- Confirm BAAs and operational controls if the app stores protected health information.
- Document support and incident-response ownership.

## Native QA Matrix

Run this matrix after Firebase staging is configured and before TestFlight or closed Play testing.

| Area | iOS Simulator | iOS Device | Android Emulator | Android Device |
| --- | --- | --- | --- | --- |
| Cold launch | Not run | Not run | Not run | Not run |
| Google sign-in | Not run | Not run | Not run | Not run |
| Profile save | Not run | Not run | Not run | Not run |
| Screening event save | Not run | Not run | Not run | Not run |
| Recommendation refresh | Not run | Not run | Not run | Not run |
| PDF export | Not run | Not run | Not run | Not run |
| FHIR JSON export | Not run | Not run | Not run | Not run |
| Legal page navigation | Not run | Not run | Not run | Not run |
| Offline fallback | Not run | Not run | Not run | Not run |
| Keyboard behavior | Not run | Not run | Not run | Not run |
| Safe-area layout | Not run | Not run | Not run | Not run |

## Build Requirements

For iOS:

- Install Xcode 26 or later and build with the iOS 26 SDK or later, as required
  for App Store uploads after April 28, 2026.
- Select Xcode with `xcode-select`.
- Configure Apple Developer Team signing.
- Build and archive from Xcode.
- Upload first builds to TestFlight before public App Review.

For Android:

- Install Java and Android Studio.
- Install the Android SDK and platform tools.
- Create and secure a release signing keystore.
- Build a signed Android App Bundle.
- Run closed testing in Play Console before production rollout.

## Submission Blockers

- Full Xcode is not installed or selected on the current Mac.
- Java and the Android SDK are not installed locally; Android compilation is
  currently verified in GitHub Actions.
- Native auth behavior has not been tested in webviews.
- Android release signing credentials do not exist yet; their SHA-1 and
  SHA-256 fingerprints must be added to the production Firebase Android app.
- Sign in with Apple is not configured. Confirm the applicable App Review
  requirement and implement it before submission unless an exception applies.
- Final production legal review is not complete.
- Store screenshots and metadata are not complete.
- Release signing is not configured.
- A signed iOS archive and signed Android App Bundle have not been compiled.
- TestFlight and Play closed testing have not been run.
