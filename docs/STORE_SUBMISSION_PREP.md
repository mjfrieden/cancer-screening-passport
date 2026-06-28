# Store Submission Prep

Last updated: 2026-06-28

This project has a Capacitor iOS/Android shell, but it is not ready for App Store or Google Play submission until the items below are completed and reviewed.

## Current Native Status

- Capacitor app ID: `com.whitecloudmedical.cancerpassport`
- Publisher/operator: `White Cloud Medical, LLC`
- App name: `Cancer Prevention Passport`
- iOS wrapper exists in `ios/`
- Android wrapper exists in `android/`
- Web assets sync with `npm run cap:sync`
- CI validates Capacitor sync and native identity with `npm run native:check`

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

- Install full Xcode.
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

- No production Firebase project has been confirmed.
- Native auth behavior has not been tested in webviews.
- Production legal and medical review are not complete.
- Store screenshots and metadata are not complete.
- Release signing is not configured.
- Native release builds have not been compiled on this machine.
- TestFlight and Play closed testing have not been run.
