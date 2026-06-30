# Data Retention and Recovery

Status: Policy approved; technical restoration test completed

Last updated: June 30, 2026

## Scope

This procedure covers Cancer Prevention Passport production records in
Firestore `(default)` in `nam5`, authentication identities, deployment
configuration, audit evidence, and patient-directed exports.

## Retention

- Active app records remain until the user deletes the app account or White
  Cloud Medical fulfills a verified deletion request.
- The in-app deletion flow removes the user's profile, consent, screening,
  cervical-result, and survivorship records and the Firebase app identity.
- Weekly Firestore backups run Sunday and expire after seven days.
- Backups are for disaster recovery, not indefinite record retention.
- Audit logs use Google Cloud's default retention until counsel approves a
  different period.
- Compliance approvals, risk analyses, training records, incident decisions,
  and BAA records must be retained outside the public repository according to
  the approved company record-retention policy.
- Support email must not contain PHI. Requests are verified using the account
  email and tracked with the minimum necessary information.

## Recovery Objectives

- Draft recovery point objective: seven days.
- Draft recovery time objective: one business day after incident containment
  and authorization to restore.
- Firestore delete protection must remain enabled.
- Point-in-time recovery remains disabled to respect the current cost ceiling.

White Cloud Medical approved the retention policy and draft recovery objectives
on June 29, 2026. The first restoration test validated the recovery procedure
on June 30, 2026.

## Restore Procedure

1. Declare and document the incident and freeze nonessential deployments.
2. Identify the latest usable backup without copying record content into
   tickets, email, logs, or GitHub.
3. Restore the backup to a new Firestore database. Firestore backups do not
   overwrite the source database.
4. Validate record counts, owner isolation, security rules, indexes, and
   application compatibility using controlled accounts.
5. Obtain incident commander and privacy officer approval before redirecting
   production.
6. Document recovery times, data loss, user impact, and required notices.
7. Delete temporary recovery resources after the approved evidence-retention
   period.

## Completed Recovery Test

The first recovery test:

- restore into a temporary named database;
- use synthetic records only;
- prove expected document availability;
- record export timestamp, restore start/end, validation result, and cleanup;
- include the one-time restore and temporary database cost;
- set `HIPAA_BACKUP_RESTORE_TEST_COMPLETED_DATE` only after successful cleanup.

On June 30, 2026, the protected synthetic marker
`_recovery_validation/synthetic-20260629` was exported using Firestore's
managed export service and imported into the isolated
`recovery-test-20260630` database in `nam5`. The export completed successfully
at `2026-06-30T01:53:36.766146Z`; the import completed successfully at
`2026-06-30T01:54:04.940032Z`. The restored marker matched its expected
synthetic boolean, marker version, and creation timestamp.

The temporary database was deleted at `2026-06-30T01:54:40.697841Z`, the
temporary export objects were deleted, and the temporary daily backup schedule
was removed. The permanent Sunday seven-day schedule
`99fce6b4-6d91-402d-9817-c71b3202e759` remains active. The protected GitHub
production variable `HIPAA_BACKUP_RESTORE_TEST_COMPLETED_DATE=2026-06-30`
records completion.

## Cost Boundary

Scheduled backup storage and restore operations are not part of Firestore's
free quota. The production database was empty when the weekly schedule was
created, so current expected backup cost is effectively zero. Backup cost grows
with stored data. Review actual cost monthly and before changing recurrence,
retention, PITR, or database location.
