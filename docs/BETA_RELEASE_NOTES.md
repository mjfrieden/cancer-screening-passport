# Beta Release Notes

Last updated: 2026-06-25

Use this file to summarize each staging beta deploy. Keep entries brief and tester-facing.

## Unreleased

- Added a public production roadmap.
- Added post-sign-in acknowledgement for privacy, terms, and medical disclaimer versions before health data entry.
- Added Firestore owner rules and tests for saved consent records.
- Added a beta support page and linked it from legal navigation.
- Added Profile account/data controls for local data export and permanent app data/account deletion.
- Limited TypeScript checks to source/config files so generated build output cannot break `npm run lint`.
- Added beta feedback and bug report issue templates.
- Added public-issue safety checkboxes and private GitHub Security Advisory intake guidance.
- Added guideline source URL and clinical-review-status metadata to recommendations.
- Added a beta preflight check for static hosting, PWA, legal, support, issue-template, private-intake, and traceability readiness.
- Added beta testing guidance, known issue tracking, and deployment feedback loop documentation.
- Added deployment environment validation for staging and production workflows.
- Updated build tooling to patched Vite, tsx, and esbuild versions.

## Template

Copy this section for each beta deploy.

```markdown
## YYYY-MM-DD - Staging Beta

Staging URL:

### Changed

- 

### Fixed

- 

### Known Issues

- 

### Tester Notes

- Do not enter protected health information or sensitive personal details.
- Report non-sensitive bugs through GitHub issues. Use GitHub Security Advisories for private security, privacy, or health-data concerns.
```
