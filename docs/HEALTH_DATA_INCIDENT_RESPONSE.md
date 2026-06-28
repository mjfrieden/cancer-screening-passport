# Health Data Incident Response

Last updated: 2026-06-28

Owner: White Cloud Medical, LLC

This beta runbook must be assigned to named people and reviewed by counsel
before unrestricted production use with real health information.

## Intake

Private reports are accepted through:

https://github.com/mjfrieden/cancer-screening-passport/security/advisories/new

Do not request health information, passwords, access tokens, or full exports in
public GitHub issues.

## Immediate Response

1. Record the discovery time, reporter, affected systems, and initial evidence.
2. Preserve relevant logs and configuration without copying unnecessary health
   information.
3. Revoke exposed credentials and stop unauthorized access.
4. Contain affected Firebase, Cloudflare, GitHub, or application paths.
5. Avoid deleting evidence needed for investigation.
6. Notify the named incident, privacy, and legal owners.

## Assessment

Determine:

- what information was acquired, disclosed, altered, or unavailable;
- whether the information identifies or can reasonably identify a person;
- affected people, accounts, systems, vendors, and time period;
- whether encryption or another approved protection rendered data unusable;
- whether the incident involved unauthorized disclosure rather than only a
  traditional security intrusion;
- whether HIPAA, the FTC Health Breach Notification Rule, state law, contracts,
  or store policies apply.

## Notification

Counsel must determine required notices and deadlines. The FTC Health Breach
Notification Rule can require notice to affected people, the FTC, and for
certain larger breaches the media. Do not wait until the end of remediation to
begin the legal deadline analysis.

Official reference:

https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0

## Recovery

1. Correct the root cause and validate access-control rules.
2. Rotate credentials and review privileged access.
3. Verify account export and deletion still work.
4. Run CI, Firestore rules tests, production smoke, and authenticated regression
   checks before restoring affected features.
5. Document decisions, notifications, user support, and residual risk.
6. Conduct a post-incident review and assign corrective actions.

## Required Assignments

- [x] Incident commander: Marshall Frieden
- [x] Privacy lead: Marshall Frieden
- [x] Security/engineering lead: Marshall Frieden
- [x] Backup operational owner: Donald Frieden
- [x] Legal counsel: Marshall Frieden
- [x] User communications lead: Marshall Frieden
- [x] Monitored support/privacy address: `support@whitecloudmedical.com`

Marshall Frieden is the interim primary owner for the assigned operational
roles. Donald Frieden is the backup operational owner.
