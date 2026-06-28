import { existsSync, readFileSync } from 'node:fs';

const checks = [];

function addCheck(label, run) {
  checks.push({ label, run });
}

function readText(path) {
  if (!existsSync(path)) {
    throw new Error(`${path} does not exist`);
  }
  return readFileSync(path, 'utf8');
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function expectIncludes(path, expected) {
  const body = readText(path);
  for (const value of expected) {
    if (!body.includes(value)) {
      throw new Error(`${path} is missing expected text: ${value}`);
    }
  }
}

function expectScript(name) {
  const pkg = readJson('package.json');
  if (!pkg.scripts?.[name]) {
    throw new Error(`package.json is missing script: ${name}`);
  }
}

addCheck('required beta scripts exist', () => {
  for (const name of [
    'build:static',
    'smoke:static',
    'preflight:beta',
    'validate:cloudflare-pages-env',
    'native:check',
    'test:rules',
  ]) {
    expectScript(name);
  }
});

addCheck('PWA manifest is installable', () => {
  const manifest = readJson('public/site.webmanifest');
  if (manifest.name !== 'Cancer Prevention Passport') {
    throw new Error('manifest name must be Cancer Prevention Passport');
  }
  if (manifest.display !== 'standalone') {
    throw new Error('manifest display must be standalone');
  }
  if (manifest.start_url !== '/' || manifest.scope !== '/') {
    throw new Error('manifest start_url and scope must be rooted at /');
  }
  const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
  for (const requiredIcon of ['/icon-192.png', '/icon-512.png', '/apple-touch-icon.png']) {
    if (!icons.some(icon => icon.src === requiredIcon)) {
      throw new Error(`manifest must declare ${requiredIcon}`);
    }
  }
});

addCheck('service worker caches required public routes', () => {
  expectIncludes('public/sw.js', [
    '/offline.html',
    '/site.webmanifest',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-touch-icon.png',
    '/brand/cancer-prevention-passport-lockup.png',
    '/brand/cancer-prevention-passport-mark.png',
    '/legal/privacy.html',
    '/legal/terms.html',
    '/legal/medical-disclaimer.html',
    '/support.html',
  ]);
});

addCheck('production brand assets are wired across app surfaces', () => {
  for (const path of [
    'public/favicon-64.png',
    'public/icon-192.png',
    'public/icon-512.png',
    'public/apple-touch-icon.png',
    'public/brand/cancer-prevention-passport-lockup.png',
    'public/brand/cancer-prevention-passport-mark.png',
    'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
    'android/app/src/main/res/mipmap-mdpi/ic_launcher.png',
    'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
  ]) {
    if (!existsSync(path)) {
      throw new Error(`${path} does not exist`);
    }
  }

  expectIncludes('index.html', [
    '/favicon-64.png',
    '/apple-touch-icon.png',
  ]);
  expectIncludes('src/App.tsx', [
    '/brand/cancer-prevention-passport-lockup.png',
    '/brand/cancer-prevention-passport-mark.png',
  ]);
});

addCheck('legal and support pages keep beta safety warnings', () => {
  expectIncludes('public/legal/privacy.html', [
    'protected health information',
    'Firebase Authentication and Firestore',
    'White Cloud Medical, LLC',
    'Health Breach Notification Rule',
    '/support.html',
  ]);
  expectIncludes('public/legal/terms.html', [
    'Beta Status',
    'not a medical device',
    'No Medical Advice or Physician-Patient Relationship',
    'Limitation of Liability',
    'White Cloud Medical, LLC',
    '/support.html',
  ]);
  expectIncludes('public/legal/medical-disclaimer.html', [
    'not medical advice',
    'No Physician-Patient Relationship',
    'White Cloud Medical, LLC',
    'licensed clinician',
  ]);
  expectIncludes('public/support.html', [
    'GitHub Security Advisories',
    'protected health information',
    'Public Beta Feedback',
  ]);
});

addCheck('public issue templates protect sensitive reports', () => {
  const advisoryUrl = 'https://github.com/mjfrieden/cancer-screening-passport/security/advisories/new';
  for (const path of [
    '.github/ISSUE_TEMPLATE/bug_report.yml',
    '.github/ISSUE_TEMPLATE/beta_feedback.yml',
  ]) {
    expectIncludes(path, [
      'Public issue safety',
      'protected health information',
      'private tokens',
      advisoryUrl,
    ]);
  }
});

addCheck('private intake and traceability docs are present', () => {
  expectIncludes('SECURITY.md', [
    'GitHub Security Advisories',
    'protected health information',
    'Current Beta Boundary',
  ]);
  expectIncludes('docs/SECURITY_PRIVACY_INTAKE.md', [
    'Private security, privacy, or health-data concerns',
    'Do not collect protected health information',
    'Production Gap',
  ]);
  expectIncludes('docs/GUIDELINE_TRACEABILITY.md', [
    'source_url',
    'clinical_review_status',
    'physician_reviewed',
    'needs_clinical_review',
    'Production Gate',
  ]);
  expectIncludes('docs/LEGAL_COMPLIANCE_REVIEW.md', [
    'White Cloud Medical, LLC',
    'Health Breach Notification Rule',
    'licensed counsel',
  ]);
  expectIncludes('docs/HEALTH_DATA_INCIDENT_RESPONSE.md', [
    'Incident commander',
    'Privacy lead',
    'Health Breach Notification Rule',
  ]);
});

addCheck('Cloudflare static deployment path remains wired', () => {
  expectIncludes('.github/workflows/deploy-static-cloudflare.yml', [
    'Deploy Static Cloudflare Pages',
    'npm run validate:env',
    'npm run validate:cloudflare-pages-env',
    'npm run build:static',
    'pages deploy dist',
  ]);
  expectIncludes('docs/CLOUDFLARE_PAGES_DEPLOYMENT.md', [
    'Cloudflare Pages Free',
    'does not require Cloud Run',
    'SMOKE_BASE_URL="https://your-pages-url.pages.dev" npm run smoke:static',
  ]);
});

addCheck('beta checklist covers safety, source trace, and deploy gates', () => {
  expectIncludes('docs/WEB_BETA_CHECKLIST.md', [
    'Deploy Static Cloudflare Pages',
    'Recommendation source URLs and clinical review status',
    'Private GitHub Security Advisory intake path',
    'Staging deploy does not require Cloud Run',
  ]);
});

addCheck('authenticated shell retains keyboard and screen-reader semantics', () => {
  expectIncludes('src/App.tsx', [
    'Skip to main content',
    'id="main-content"',
    'aria-label="Sign out"',
    'aria-label="Add screening record"',
    'aria-label="Primary"',
    "aria-current={active ? 'page' : undefined}",
  ]);
  expectIncludes('src/components/AddScreeningModal.tsx', [
    'role="dialog"',
    'aria-modal="true"',
    'aria-labelledby="add-screening-title"',
    'aria-label="Close add screening dialog"',
  ]);
  expectIncludes('src/components/ProfileForm.tsx', [
    'safe-bottom-action sticky z-20',
    'type="submit"',
    'Update Passport Profile',
  ]);
  expectIncludes('src/index.css', [
    'env(safe-area-inset-bottom, 0px)',
    ':focus-visible',
    'prefers-reduced-motion: reduce',
  ]);
  expectIncludes('index.html', [
    'viewport-fit=cover',
  ]);
});

addCheck('account deletion covers every user-owned data collection', () => {
  expectIncludes('src/components/AccountDataControls.tsx', [
    "'screening_events'",
    "'cervical_results'",
    "'survivorship_plans'",
    "doc(db, 'user_profiles', user.uid)",
    "doc(db, 'user_consents', user.uid)",
  ]);
});

let failures = 0;
for (const check of checks) {
  try {
    check.run();
    console.log(`ok - ${check.label}`);
  } catch (error) {
    failures += 1;
    console.error(`not ok - ${check.label}`);
    console.error(error.message);
  }
}

if (failures > 0) {
  console.error(`${failures} beta preflight check(s) failed.`);
  process.exit(1);
}

console.log(`${checks.length} beta preflight checks passed.`);
