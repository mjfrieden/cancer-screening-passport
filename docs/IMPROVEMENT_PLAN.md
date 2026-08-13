# Cancer Prevention Passport Improvement Plan

Last updated: 2026-08-13

## Product outcome

Help patients move from “I may be due” to a completed, documented screening or diagnostic follow-up without overstating what patient-entered data can safely determine.

## Guiding principles

1. Fail safely when important risk information is missing or outside an average-risk pathway.
2. Put the next patient action ahead of charts, scores, and clinical detail.
3. Keep abnormal results open until diagnostic follow-up is explicitly resolved.
4. Distinguish patient-entered, imported, and clinician-confirmed information.
5. Treat survivorship schedules as clinician-authored care plans, not generated protocols.
6. Use plain, inclusive language and meet WCAG 2.2 AA.
7. Measure completed screening and completed follow-up, not time in app.

## Phase 1 — Safety and data integrity

Target: before the next patient beta.

- Add a focused risk review covering hereditary risk, family history, prior high-risk findings, inflammatory bowel disease, immune compromise, prior chest radiation, and DES exposure.
- Mark affected recommendations as needing clinician review when an answer is “yes,” “not sure,” or missing.
- Correct clinical-content governance so NCCN-derived survivorship abstractions cannot appear physician-reviewed by fallback.
- Let patients edit or delete an individual screening record.
- Label recommendations and exports as patient-entered and not verified against the medical record.
- Surface save, update, delete, and sign-in errors in the interface with recovery guidance.
- Replace definitive survivorship terms such as “program,” “protocol,” and “compliant.”

Success measures:

- No average-risk due date is presented as definitive when a material exclusion is known or unknown.
- Every screening record can be corrected without deleting the account.
- Every survivorship recommendation is visibly marked for clinician confirmation.
- Automated tests cover all new risk-review and record-mutation paths.

## Phase 2 — Action-first patient journey

Target: first release after the safety tranche.

- Replace the dashboard status grid with a prioritized “Next steps” list.
- Add states for discuss, order requested, scheduled, completed, result received, follow-up needed, and resolved.
- Add calendar actions, privacy-safe reminders, preparation checklists, and reminder preferences.
- Keep unresolved abnormal results pinned above routine prevention content.
- Add test-choice comparisons based on preparation, frequency, invasiveness, follow-up, and patient preference.
- Remove unsourced sensitivity, specificity, and mortality figures from the patient timeline.

Success measures:

- Patients can identify their next action in usability testing without assistance.
- Screening and abnormal-result tasks can be followed from recommendation through resolution.
- Reminder delivery and completion can be audited without storing unnecessary message content.

## Phase 3 — Navigation and equitable access

- Add screening for cost, insurance, transportation, language, disability access, time off work, preparation concerns, and fear or prior trauma.
- Add referral pathways to human navigation and community screening resources.
- Add multilingual content, caregiver/proxy access, and non-Google authentication.
- Increase minimum body copy size and replace clinical jargon with layered explanations.
- Validate with older adults, people with low health literacy, screen-reader users, rural patients, and cancer survivors.

Success measures:

- Patients can record a barrier and receive a relevant next step or human handoff.
- Core flows meet WCAG 2.2 AA and pass assistive-technology testing.
- Comprehension testing confirms that users understand uncertainty and data provenance.

## Phase 4 — Trustworthy care-team integration

- Capture or import clinician-authored survivorship care plans.
- Add report upload and structured test-specific fields with provenance.
- Validate FHIR resources against implementation guides, terminology bindings, identifiers, and real receiving systems.
- Replace raw medical-data QR payloads with consented, expiring, revocable access.
- Add reconciliation when imported records conflict with patient-entered information.

Success measures:

- Receiving clinicians can identify data source, verification status, and unresolved follow-up.
- Interoperability claims are backed by conformance tests and receiving-system validation.
- Patients can revoke shared access and see what was shared.

## Clinical governance

- Maintain one versioned registry for source, source version, population, exclusions, reviewer, review scope, review date, and next review date.
- Fail closed when required review is missing or expired.
- Require clinical review for every change to recommendation logic, result parsing, interval calculation, or survivorship wording.
- Add release tests that compare code-emitted review status with documentation.

## Work started in this tranche

- Focused screening-risk review in the patient profile.
- Safe `needs_review` recommendations when average-risk assumptions may not apply.
- Correct NCCN fallback review status.
- Individual screening-record edit and delete controls.
- Tests for risk review, governance status, and record mutation behavior.

## Phase 2 implementation completed

- Replaced the dashboard status summary with a prioritized patient action center.
- Added backward-compatible workflow states from clinician discussion through resolved follow-up.
- Pinned abnormal findings until the patient explicitly records resolution with the care team.
- Added privacy-safe calendar export, in-app reminder preferences, and test-specific preparation checklists.
- Removed unsourced screening performance figures from the patient timeline.
- Prevented tests awaiting results from being interpreted or exported as normal completed results.
- Replaced the broad comparison guide with a source-linked colorectal choice aid that appears only for actionable average-risk recommendations and starts the selected tracking workflow.

Remaining Phase 2 work:

- Connect reminder preferences to an approved notification service; current reminders appear only while the patient uses the application.
- Validate the action center and preparation content in moderated usability sessions with patients and clinical navigators.
