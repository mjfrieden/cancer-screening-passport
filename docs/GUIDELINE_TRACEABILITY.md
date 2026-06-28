# Guideline Traceability

Last updated: 2026-06-28

Every recommendation emitted by `src/lib/guidelineEngine.ts` now carries trace metadata:

- `source`
- `source_version`
- `source_url`
- `clinical_review_status`
- `clinical_review_note`

## Review Status

`source_traced` means the recommendation is linked to a public source page but has not completed content review.

`needs_clinical_review` means the recommendation is an abstraction that must be checked by a qualified clinician against the current guideline before beta or production use.

`physician_reviewed` means a physician reviewed the application content for medical accuracy on behalf of White Cloud Medical, LLC on June 28, 2026. This is a content-review status, not individualized medical advice or patient-specific clearance.

## Current Source Families

- USPSTF screening recommendations: public USPSTF recommendation pages for colorectal, breast, cervical, prostate, and lung screening.
- AICR prevention recommendations: public AICR cancer prevention recommendations page.
- NCCN survivorship abstractions: linked to NCCN guideline landing page and always marked `needs_clinical_review`.

## Production Gate

Clinical content review is complete for the June 28, 2026 beta release. Before
each later public release that changes guideline logic, source versions, or
medical wording, a qualified clinical reviewer should verify:

- the source page is current,
- the app wording matches the source,
- the interval and age logic match the source,
- exceptions and higher-risk pathways are clearly excluded or handled,
- the recommendation is correctly marked as source-traced or clinician-review-needed.
