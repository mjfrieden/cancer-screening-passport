# Guideline Traceability

Last updated: 2026-06-26

Every recommendation emitted by `src/lib/guidelineEngine.ts` now carries trace metadata:

- `source`
- `source_version`
- `source_url`
- `clinical_review_status`
- `clinical_review_note`

## Review Status

`source_traced` means the recommendation is linked to a public source page, but the product wording still needs release review before public clinical use.

`needs_clinical_review` means the recommendation is an abstraction that must be checked by a qualified clinician against the current guideline before beta or production use.

## Current Source Families

- USPSTF screening recommendations: public USPSTF recommendation pages for colorectal, breast, cervical, prostate, and lung screening.
- AICR prevention recommendations: public AICR cancer prevention recommendations page.
- NCCN survivorship abstractions: linked to NCCN guideline landing page and always marked `needs_clinical_review`.

## Production Gate

Before a public production launch, clinical reviewers should verify:

- the source page is current,
- the app wording matches the source,
- the interval and age logic match the source,
- exceptions and higher-risk pathways are clearly excluded or handled,
- the recommendation is correctly marked as source-traced or clinician-review-needed.
