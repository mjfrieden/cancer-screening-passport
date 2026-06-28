# White Cloud Medical HIPAA Compliance Plan

Owner: White Cloud Medical, LLC  
System: Cancer Prevention Passport  
Support: `support@whitecloudmedical.com`  
Status: Implementation in progress; real PHI is not yet authorized

## Purpose and Boundary

This plan establishes the administrative, physical, and technical safeguards
required before Cancer Prevention Passport accepts real PHI. It is an
operational plan, not a legal opinion or a declaration of compliance.

The current Cloudflare Pages staging site is synthetic-data/no-PHI only.
Production PHI must remain disabled until every launch gate below is documented
and approved.

## Governance

Interim assignments:

- HIPAA privacy officer: Marshall Frieden
- HIPAA security officer: Marshall Frieden
- Incident commander: Marshall Frieden
- Technical system owner: Marshall Frieden
- User communications lead: Marshall Frieden

The privacy and security officers may be the same person for a small
organization, but responsibilities and backups must be documented. White Cloud
Medical, LLC must name a backup before unrestricted PHI production and maintain
an access roster for every workforce member or contractor with production
access.

## Risk Analysis and Management

Before launch:

1. Inventory every place PHI is created, received, maintained, transmitted,
   exported, backed up, logged, or supported.
2. Document threats, vulnerabilities, likelihood, impact, existing controls,
   residual risk, owner, and remediation date.
3. Approve a risk-management plan and formally accept any remaining risk.
4. Repeat the analysis at least annually and after material architecture,
   vendor, security, or regulatory changes.

## Vendor and BAA Management

- Execute and retain the Google Cloud BAA for the White Cloud Medical, LLC
  production account.
- Confirm Firestore and Identity Platform remain on Google's current HIPAA
  Covered Products list before launch and during annual review.
- Do not put PHI in Firebase Hosting, analytics, crash reporting, email,
  customer support, monitoring, CI artifacts, or another service unless its
  role, covered-service status, and BAA requirements are documented.
- Maintain a vendor register with service, purpose, data class, contract owner,
  BAA date, renewal date, subprocessors, and termination procedure.
- Obtain satisfactory assurances and BAAs from every business associate that
  handles PHI.

## Access Controls

- Require unique administrator identities and MFA.
- Use least-privilege IAM and separate staging and production projects.
- Prohibit shared accounts and long-lived service-account keys.
- Use GitHub workload identity federation for deployments.
- Review privileged access quarterly and immediately after role changes.
- Terminate access promptly when workforce or contractor access ends.
- Keep a documented emergency-access procedure.

## Application and Data Security

- Enforce owner-only Firestore rules and run emulator tests before each rules
  deployment.
- Encrypt PHI in transit and rely only on reviewed encryption-at-rest services.
- Keep PHI out of URLs, resource names, analytics, logs, alerts, issue trackers,
  source control, and CI output.
- Disable production clinical simulators and test accounts.
- Validate account export and complete deletion across every user collection.
- Define session timeout, reauthentication, device-loss, and credential-reset
  procedures.
- Complete secure development review, dependency scanning, and authenticated
  penetration testing before launch and after material changes.

## Audit and Monitoring

- Enable appropriate Google Cloud Admin Activity and Data Access audit logs.
- Restrict log access and document a recurring review cadence.
- Alert on privileged IAM changes, unusual authentication activity, rules
  changes, excessive denials, and unexpected cost or usage.
- Retain security evidence according to the approved retention schedule.
- Never place PHI in log labels, alert names, or notification messages.

## Availability, Backup, and Recovery

- Define recovery-time and recovery-point objectives.
- Document backup and restoration choices before relying on paid Firestore
  backup, restore, TTL, or point-in-time recovery features.
- Test recovery at least annually and after major storage changes.
- Maintain downtime and data-integrity communication procedures.

## Privacy Operations

- Publish the final Privacy Policy, Terms, and Medical Disclaimer.
- Document permitted uses and disclosures, minimum-necessary practices, access,
  amendment/correction, accounting, restriction, deletion, and complaint
  handling as applicable.
- Route privacy and support requests to `support@whitecloudmedical.com`.
- Verify the requester's identity before disclosing, correcting, or deleting
  sensitive records.
- Establish approved retention and secure-disposal timelines.

## Incident and Breach Response

- Complete assignments in `docs/HEALTH_DATA_INCIDENT_RESPONSE.md`.
- Maintain an escalation path for security, privacy, legal, clinical, and user
  communications decisions.
- Preserve evidence, contain access, assess affected data and people, document
  the risk assessment, and meet applicable HIPAA, FTC, state, and contractual
  notification deadlines.
- Run a tabletop exercise before launch and at least annually.

## Workforce Program

- Approve privacy, security, acceptable-use, access-control, incident-response,
  sanction, device, and remote-work policies.
- Train each authorized workforce member before access and annually thereafter.
- Retain training, policy acknowledgement, access review, incident, and sanction
  records for the applicable retention period.

## Production Launch Gates

- [ ] White Cloud Medical, LLC HIPAA role and scope documented.
- [x] Privacy officer, security officer, incident commander, and system owner named.
- [ ] Enterprise-wide and application-specific risk analyses approved.
- [ ] Google Cloud BAA accepted and retained.
- [ ] Dedicated production project and billing account configured.
- [ ] Covered-service inventory approved.
- [ ] Production web hosting uses a service explicitly approved under the BAA.
- [ ] Identity Platform and Firestore configured with production-only credentials.
- [ ] IAM, MFA, workload identity, audit logs, and alerts verified.
- [ ] Firestore rules and account deletion tests pass.
- [ ] Retention, backup, restoration, and secure-disposal procedures approved.
- [ ] Incident-response tabletop completed.
- [ ] Workforce training and acknowledgements complete.
- [ ] Authenticated security and privacy beta completed using synthetic data.
- [ ] Final legal, privacy, store, and vendor review completed.
- [ ] `HIPAA_PRODUCTION_APPROVED=true` approved and recorded in GitHub.

## Ongoing Cadence

- Monthly: security alerts, support requests, incidents, and cost review.
- Quarterly: privileged-access and vendor-change review.
- Annually: risk analysis, policy review, training, BAA/vendor review,
  recovery test, incident tabletop, and technical security assessment.
- Event driven: reassess after incidents, major releases, new vendors, material
  data-flow changes, or regulatory changes.
