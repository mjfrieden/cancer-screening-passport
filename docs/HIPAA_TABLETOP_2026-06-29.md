# HIPAA Incident Tabletop - June 29, 2026

Status: Completed by White Cloud Medical owner attestation

Participants:

- Incident commander: Marshall Frieden
- Privacy officer: Marshall Frieden
- Security/engineering lead: Marshall Frieden
- Legal counsel: Marshall Frieden
- Backup operational owner: Donald Frieden

## Scenario

A patient reports seeing another person's screening record after signing in.
At the same time, Cloud Logging shows unusual Firestore reads and the support
message contains a screenshot with health information.

## Exercise Prompts

1. Who declares the incident and records the discovery time?
2. How is real-PHI entry disabled without destroying evidence?
3. Which credentials, sessions, deployments, and Firestore rules are reviewed?
4. Where is the support screenshot moved or deleted, and who may access it?
5. How are affected accounts and time ranges determined using minimum necessary
   data?
6. Who determines whether HIPAA, FTC, state, contractual, or store notice
   requirements apply?
7. What evidence is preserved, and for how long?
8. What tests must pass before service restoration?
9. What message is sent to affected users without exposing additional PHI?
10. Which corrective actions receive owners and due dates?

## Success Criteria

- Participants can locate `docs/HEALTH_DATA_INCIDENT_RESPONSE.md`.
- Real-PHI mode can be disabled and redeployed.
- Audit logs can be queried without copying PHI into GitHub or email.
- Firestore access can be contained without deleting evidence.
- Legal notification analysis begins immediately.
- Recovery requires rules tests, two-account isolation, export, and deletion
  verification.
- Decisions, timestamps, owners, and corrective actions are recorded privately.

## Completion Record

- Exercise date: June 29, 2026
- Participants present: Assigned White Cloud Medical incident participants
- Decisions tested: Scenario prompts and success criteria in this document
- Gaps found: Detailed exercise record retained privately
- Corrective actions and owners: Retained privately
- Incident commander approval: Attested complete by Marshall Frieden
- Privacy officer approval: Attested complete by Marshall Frieden
- Legal approval: Attested complete by Marshall Frieden

White Cloud Medical's detailed exercise notes remain in private compliance
records.
