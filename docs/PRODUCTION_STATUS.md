# Production Status

Last updated: June 28, 2026

## Provisioned

- Google Workspace organization: `whitecloudmedical.com`
- Organization ID: `883366996416`
- Production project: `cancer-passport-wcm-prod`
- Project number: `410791537492`
- Project owner account used for setup:
  `marshall@whitecloudmedical.com`
- Firebase project activated.
- Firestore `(default)` database created in `nam5`.
- Firestore started with closed default rules; real PHI is not authorized.
- Production Firebase web app created:
  `1:410791537492:web:e4ad8bde07268e7a1976c1`.
- Firebase, Firestore, Identity Toolkit, IAM Credentials, and Security Token
  Service APIs enabled.
- Production Firebase configuration stored as GitHub Environment variables.
- Clinical simulator disabled for production.
- Analytics measurement ID intentionally omitted.
- GitHub production gate set to `HIPAA_PRODUCTION_APPROVED=false`.

## Not Provisioned or Approved

- No Cloud Billing account is accessible to the approved Google identity.
- Billing is not enabled on the production project.
- No budget or billing alerts can be created until a billing account exists.
- Google Cloud BAA acceptance has not been recorded.
- Google Identity provider OAuth client and consent screen are not configured.
- Production Firestore rules have not been deployed.
- No production hosting service has been approved.
- No production deployment has occurred.
- Real PHI remains prohibited.

## Next Owner Actions

1. Create a Business-type Google Cloud Billing account for White Cloud Medical,
   LLC and link it to `cancer-passport-wcm-prod`.
2. Review and accept the Google Cloud BAA as an authorized White Cloud Medical,
   LLC representative, then retain the effective agreement.
3. Provide the BAA effective date and assign the privacy officer, security
   officer, and incident commander.
4. Configure the Google OAuth consent screen and Google Identity Platform
   provider without adding `localhost` to production authorized domains.
5. Select a production web hosting service explicitly covered under the BAA.

After those actions, automation can create budget alerts, configure least
privilege workload identity, deploy and test Firestore rules, complete
authenticated synthetic-data testing, and prepare the final PHI activation
review.
