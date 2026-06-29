# Real-PHI Activation Runbook

Last updated: June 29, 2026

Owner: White Cloud Medical, LLC

## Current Decision

Real PHI is disabled. `VITE_REAL_PHI_ENABLED=false` and
`HIPAA_PRODUCTION_APPROVED=false` must remain set in the GitHub `production`
environment until every gate below has dated evidence.

The Google Cloud BAA and covered infrastructure are necessary but do not, by
themselves, establish HIPAA compliance. White Cloud Medical, LLC must complete
and retain its administrative, physical, and technical safeguard evidence.

## Required Evidence

| Gate | Required GitHub variable | Current status |
| --- | --- | --- |
| Enterprise and application risk analysis approved | `HIPAA_RISK_ANALYSIS_APPROVED_DATE` | Draft prepared; approval open |
| Workforce security and privacy training completed | `HIPAA_SECURITY_TRAINING_COMPLETED_DATE` | Training packet ready; acknowledgments open |
| Incident-response tabletop completed | `HIPAA_INCIDENT_TABLETOP_COMPLETED_DATE` | Exercise packet ready; exercise open |
| Retention and secure-disposal policy approved | `HIPAA_RETENTION_POLICY_APPROVED_DATE` | Draft prepared; approval open |
| Production IAM and user-access review completed | `HIPAA_ACCESS_REVIEW_COMPLETED_DATE` | Technical review passed; MFA and backup-owner confirmations open |
| Backup and restoration procedure tested | `HIPAA_BACKUP_RESTORE_TEST_COMPLETED_DATE` | Weekly backup active; first restore test open |
| Final legal and privacy review approved | `HIPAA_FINAL_LEGAL_REVIEW_APPROVED_DATE` | Open |
| Executed Google Cloud BAA retained in company records | `HIPAA_BAA_RETAINED=true` | Owner confirmation open |
| Live two-account owner-isolation test passed | `HIPAA_SECOND_ACCOUNT_ISOLATION_VERIFIED=true` | Open |

All date values must use `YYYY-MM-DD`.

## Activation Procedure

1. Complete each gate and retain its evidence outside the public repository.
2. Confirm every enabled service that handles PHI remains covered by the
   applicable Google Cloud BAA.
3. Confirm support, logs, GitHub, analytics, email, and crash-reporting paths do
   not receive PHI unless separately reviewed and contracted as required.
4. Enter the dated evidence and boolean approvals in the GitHub `production`
   environment.
5. Set `HIPAA_PRODUCTION_APPROVED=true`.
6. Set `VITE_REAL_PHI_ENABLED=true`.
7. Run the App Engine deployment workflow. The validator must fail if any
   required evidence is absent or malformed.
8. Run authenticated production verification with two controlled accounts,
   then document the release and begin the monthly review cadence.

## Rollback

If a safeguard, vendor approval, or production control becomes invalid:

1. Set `VITE_REAL_PHI_ENABLED=false`.
2. Redeploy immediately to restore the synthetic-data warning.
3. Contain affected access and follow
   `docs/HEALTH_DATA_INCIDENT_RESPONSE.md`.
4. Do not restore real-PHI mode until the risk is documented and approved.
