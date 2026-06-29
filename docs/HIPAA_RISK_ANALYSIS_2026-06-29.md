# HIPAA Risk Analysis - June 29, 2026

Status: Draft; approval required

Owner: White Cloud Medical, LLC

## System Boundary

Cancer Prevention Passport is a patient-facing web application hosted on App
Engine Standard. Identity Platform and Firebase Authentication provide account
authentication. Firestore stores user-entered health records. GitHub Actions
deploys through keyless workload identity. The public repository, support
email, analytics, and issue tracker are outside the approved PHI data path.

## Preliminary Risk Register

| Risk | Existing controls | Remaining treatment | Status |
| --- | --- | --- | --- |
| User reads another user's records | Owner-scoped Firestore rules and emulator tests | Complete live two-account isolation test | Open |
| Compromised administrator account | One named owner and no service-account keys | Confirm MFA, backup operator, and quarterly review | Open |
| Accidental database deletion | Firestore delete protection | Recheck quarterly | Controlled |
| Accidental record corruption or deletion | Weekly backup with seven-day retention | Complete synthetic restore test | Open |
| Missing access evidence | Firestore Data Access logs enabled | Define review cadence and escalation | Open |
| PHI copied into support, GitHub, or logs | In-app warnings, private intake guidance, redacted errors | Train workforce and audit support process | Open |
| Excessive enabled cloud services | Dedicated production project and approved core data path | Approve service inventory; disable unused APIs after dependency review | Open |
| Patient credential compromise | Google authentication and Firebase session controls | Document account recovery and patient support procedure | Open |
| Unavailable application | App Engine managed hosting and source-controlled deployment | Approve RTO and emergency-mode procedure | Open |
| Incorrect educational recommendation | Physician review, source tracing, disclaimers, tests | Continue versioned clinical review for every content change | Controlled with ongoing review |
| Cost spike causes operational pressure | F1 cap, one maximum instance, $0.05 budget alert | Monthly cost review; budgets are alerts, not caps | Open |
| Vendor or regulatory change | Google Cloud BAA and covered-service architecture | Annual and event-driven vendor/legal review | Open |

## Approval Requirements

Before approval, White Cloud Medical must:

1. assign likelihood, impact, and residual-risk ratings;
2. accept or remediate every open risk;
3. confirm HIPAA role and scope;
4. approve recovery and retention objectives;
5. complete training, tabletop, and two-account beta testing;
6. retain the signed approval outside the public repository.

Only then may `HIPAA_RISK_ANALYSIS_APPROVED_DATE` be set.
