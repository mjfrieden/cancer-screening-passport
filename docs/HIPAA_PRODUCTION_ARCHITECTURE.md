# HIPAA Production Architecture

## Decision

The current Cloudflare Pages Free deployment remains a no-PHI public beta.
Cloudflare Pages Free is not approved for production PHI because Cloudflare
states that it enters into business associate agreements only with Enterprise
customers.

Production PHI must use a separate White Cloud Medical, LLC Google Cloud
project under the approved `marshall@whitecloudmedical.com` organization
account. Before the first real record is accepted:

1. White Cloud Medical, LLC must accept and retain the executed Google Cloud
   BAA for the production billing account and project.
2. Every service that creates, receives, maintains, or transmits PHI must be
   confirmed on Google's then-current HIPAA Covered Products list.
3. Authentication must use Google Cloud Identity Platform, and records must use
   Firestore. Both are currently listed as covered services.
4. The production site must not proxy PHI through Cloudflare Free or another
   vendor without an applicable BAA.
5. Staging data must remain synthetic until the production controls and beta
   checklist are approved.

## Cost Position

The target is no fixed monthly infrastructure subscription, not a guarantee of
zero charges. Google Cloud states that HIPAA-covered products use standard
pricing, and low usage may remain within applicable free quotas. A billing
account, budget alerts, and quota controls may still be required. Any billing
activation or paid service requires a new cost review before provisioning.

Cloudflare Enterprise is excluded from the cost-safe production path unless
White Cloud Medical, LLC later approves an Enterprise contract and BAA.

## Required Controls

- Separate production and staging projects, credentials, domains, and data.
- Least-privilege IAM, administrator MFA, and quarterly access review.
- Firestore rules tests that prove user-level isolation.
- Audit logging, documented review cadence, alerting, and incident evidence
  retention without PHI in log labels or resource names.
- Documented retention, export, correction, deletion, backup, and restoration
  procedures.
- Signed BAAs and service inventory retained with compliance records.
- Incident commander and privacy lead assigned in
  `docs/HEALTH_DATA_INCIDENT_RESPONSE.md`.
- Monitored support and privacy intake at
  `support@whitecloudmedical.com`.
- No analytics, crash reporting, email, support, or monitoring vendor may
  receive PHI until its role and contract have been reviewed.

## Activation Sequence

1. Confirm White Cloud Medical, LLC's HIPAA role and approve the risk analysis.
2. Create the dedicated production Google Cloud project only after cost review.
3. Attach the approved billing account and accept the Google Cloud BAA.
4. Enable only covered services required by the application.
5. Configure Identity Platform, Firestore, hosting, IAM, logs, alerts, backups,
   retention, and deletion controls.
6. Deploy with PHI collection disabled and complete authenticated testing using
   synthetic accounts.
7. Verify the BAA, covered-service inventory, incident ownership, and support
   workflow.
8. Enable real-PHI collection only after a documented production approval.

## Important Boundary

A BAA does not make the application HIPAA compliant by itself. White Cloud
Medical, LLC remains responsible for application configuration, workforce and
access controls, policies, risk analysis, training, incident response, and all
other applicable HIPAA obligations.
