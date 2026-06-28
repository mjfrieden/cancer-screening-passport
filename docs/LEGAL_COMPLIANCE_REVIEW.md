# Legal and Compliance Review

Last updated: 2026-06-28

This document is an engineering and operational checklist, not legal advice.
White Cloud Medical, LLC should have licensed counsel confirm the final legal
position before unrestricted production use with real health information.

## Operator and Intended Use

- Operator and intended store publisher: White Cloud Medical, LLC.
- Product: Cancer Prevention Passport.
- Intended use: general health education, personal record organization, and
  clinician conversation support.
- Excluded use: diagnosis, treatment, prescribing, emergency care, or replacing
  patient-specific professional judgment.
- Native identity: `com.whitecloudmedical.cancerpassport`.

## Current Safeguards

- Terms, Privacy Policy, and Medical Disclaimer identify White Cloud Medical,
  LLC and require versioned acknowledgement after sign-in.
- The app states that no physician-patient relationship is created.
- Educational outputs retain source links and physician content-review status.
- Patient-specific clinician review remains required.
- Account export and deletion controls exist.
- Public issue templates prohibit sensitive data; private reports use GitHub
  Security Advisories.
- The public beta tells users not to enter protected health information.

## Federal Review Areas

### FDA Intended Use

Confirm with counsel that product claims, store metadata, screenshots, and
in-app language remain consistent with education and record organization.
Avoid claims that the app diagnoses, treats, prevents, or cures disease.

Official references:

- https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices
- https://www.fda.gov/medical-devices/digital-health-center-excellence/device-software-functions-including-mobile-medical-applications

### HIPAA

Determine whether White Cloud Medical, LLC offers the app independently to
consumers or on behalf of a covered entity. If the app creates, receives,
maintains, or transmits protected health information for a covered entity or
business associate, complete HIPAA analysis, BAAs, security controls, and breach
procedures before allowing that use.

Official reference:

- https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html

### FTC and Consumer Health Data

Analyze whether the app is a vendor of personal health records or otherwise
subject to the FTC Health Breach Notification Rule. Confirm that privacy and
security statements match actual practices and that no health information is
used for targeted advertising.

Official references:

- https://www.ftc.gov/business-guidance/resources/mobile-health-apps-interactive-tool
- https://www.ftc.gov/legal-library/browse/rules/health-breach-notification-rule
- https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0

## Before Unrestricted Production

- [ ] Licensed counsel approves Terms, Privacy Policy, Medical Disclaimer, and
      consent language.
- [ ] Counsel determines HIPAA, FTC HBNR, state consumer-health, biometric,
      privacy, minor, and breach-notification obligations.
- [ ] Firebase, Cloudflare, monitoring, email, and support vendors are approved
      for the permitted data class.
- [ ] Required BAAs or other data-processing agreements are executed.
- [x] A monitored White Cloud Medical support/privacy address is published at
      `support@whitecloudmedical.com`.
- [ ] Privacy, security, and incident-response owners are named.
- [ ] Data retention and deletion timelines are approved.
- [ ] Store privacy disclosures match actual collection and sharing.
- [ ] Marketing claims and screenshots remain within the approved intended use.
