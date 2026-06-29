# HIPAA Service Inventory

Status: Approved by White Cloud Medical owner attestation

Last updated: June 29, 2026

## Approved Production Data Path

| Service | Purpose | PHI permitted after activation |
| --- | --- | --- |
| App Engine Standard | Serves the web application | Yes, under the Google Cloud BAA |
| Identity Platform / Firebase Authentication | Patient authentication and app identity | Yes, minimum necessary identity data |
| Firestore Native mode | Patient-entered app records | Yes |
| Cloud IAM, IAM Credentials, and Security Token Service | Administrator and deployment access | Administrative metadata only |
| Cloud Logging | Audit, security, and platform logs | No intentional PHI; identifiers may appear only where Google audit logging requires them |
| Cloud Monitoring | Service and usage metrics | No PHI |

The production project is `cancer-passport-wcm-prod`. Firestore is in `nam5`;
App Engine is in `us-central`.

## Deployment-Only Services

Cloud Build, Artifact Registry, Cloud Storage used by App Engine deployment,
GitHub Actions, and Firebase Rules are approved only for source, generated
artifacts, and deployment metadata. Application records and patient exports
must never be placed in these systems.

GitHub is not an approved PHI system. Public issues, Actions logs, commits, and
artifacts must never contain PHI.

## Enabled but Not Approved for Application Data

The project has Firebase and Google Cloud APIs enabled by project provisioning
defaults that the application does not currently use for patient data,
including:

- BigQuery and Analytics Hub;
- Firebase Cloud Messaging and App Distribution;
- Firebase Hosting;
- Firebase Remote Config;
- Pub/Sub;
- Cloud Trace;
- Dataform and Dataplex;
- Firebase Storage as an application upload path.

These services must not receive PHI. Disable unused APIs only after confirming
that App Engine, Firebase management, and deployment workflows do not depend on
them.

## External Systems

- `support@whitecloudmedical.com`: no PHI, exports, screenshots, passwords, or
  identity documents.
- Patient-downloaded PDF, JSON, and FHIR files: patient-directed copies outside
  White Cloud Medical's managed cloud boundary after download.
- Analytics and crash-reporting SDKs: disabled and prohibited until separately
  reviewed.
- Mobile application stores: distribution metadata only; no PHI.

## Review

- [x] White Cloud Medical approves this inventory.
- [x] Counsel confirms the approved services and BAA scope.
- [x] Unused APIs are reviewed for safe disablement.
- [x] Inventory is reviewed annually and after every vendor or architecture
  change.

Approval attested by Marshall Frieden on June 29, 2026. Supporting review
evidence is retained privately.
