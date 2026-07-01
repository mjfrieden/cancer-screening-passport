import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { chromium } from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const staticOnly = process.env.SMOKE_STATIC_ONLY === 'true';
const authRequired = process.env.SMOKE_AUTH_REQUIRED === 'true';
const expectedEmail = process.env.SMOKE_EXPECTED_EMAIL?.trim() || null;
const skipDelete = process.env.SMOKE_DELETE_ACCOUNT === 'false';

const checks = [
  {
    path: '/api/health',
    expect: body => JSON.parse(body).status === 'ok',
    label: 'health endpoint',
    serverOnly: true,
  },
  {
    path: '/',
    expect: body => body.includes('Cancer Prevention Passport') && body.includes('/site.webmanifest'),
    label: 'app shell',
  },
  {
    path: '/site.webmanifest',
    expect: body => {
      const manifest = JSON.parse(body);
      return manifest.name === 'Cancer Prevention Passport' &&
        manifest.display === 'standalone' &&
        manifest.start_url === '/' &&
        manifest.scope === '/';
    },
    label: 'web manifest',
  },
  {
    path: '/sw.js',
    expect: body => body.includes('self.addEventListener') && body.includes('CACHE_NAME'),
    label: 'service worker',
  },
  {
    path: '/offline.html',
    expect: body => body.includes('You are offline') && body.includes('Cancer Prevention Passport'),
    label: 'offline page',
  },
  {
    path: '/legal/privacy.html',
    expect: body => body.includes('Privacy Policy'),
    label: 'privacy page',
  },
  {
    path: '/legal/terms.html',
    expect: body => body.includes('Terms of Use'),
    label: 'terms page',
  },
  {
    path: '/legal/medical-disclaimer.html',
    expect: body => body.includes('Medical Disclaimer'),
    label: 'medical disclaimer page',
  },
  {
    path: '/support.html',
    expect: body => body.includes('Support') && body.includes('Cancer Prevention Passport'),
    label: 'support page',
  },
];

const smokeProfile = {
  name: process.env.SMOKE_PROFILE_NAME?.trim() || `Owner Smoke Test ${new Date().toISOString().slice(0, 10)}`,
  dob: process.env.SMOKE_PROFILE_DOB?.trim() || '1968-06-30',
  sexAssignedAtBirth: process.env.SMOKE_PROFILE_SEX?.trim() || 'male',
  smokingStatus: process.env.SMOKE_PROFILE_SMOKING_STATUS?.trim() || 'current',
  packYears: Number(process.env.SMOKE_PROFILE_PACK_YEARS || '25'),
  quitDate: process.env.SMOKE_PROFILE_QUIT_DATE?.trim() || '2020-01-15',
};

async function fetchWithRetry(url, attempts = 20) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      const body = await response.text();
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}: ${body.slice(0, 200)}`);
      }
      return body;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}

async function resolveAuthStatePath() {
  const authStatePath = process.env.SMOKE_AUTH_STATE_PATH?.trim();
  if (authStatePath) {
    return authStatePath;
  }

  const authStateB64 = process.env.SMOKE_AUTH_STATE_B64?.trim();
  if (authStateB64) {
    const tempPath = path.join(os.tmpdir(), `cancer-screening-passport-smoke-auth-${process.pid}.json`);
    const normalizedAuthState = authStateB64.replace(/\s+/g, '');
    const decodedAuthState = Buffer.from(normalizedAuthState, 'base64');
    const json = decodedAuthState[0] === 0x1f && decodedAuthState[1] === 0x8b
      ? zlib.gunzipSync(decodedAuthState).toString('utf8')
      : decodedAuthState.toString('utf8');

    try {
      JSON.parse(json);
    } catch (error) {
      throw new Error(`Decoded SMOKE_AUTH_STATE_B64 is not valid JSON: ${error.message}`);
    }

    await fs.writeFile(tempPath, json, 'utf8');
    return tempPath;
  }

  return null;
}

async function runAuthenticatedSmoke(baseUrl, authStatePath) {
  if (!authStatePath) {
    throw new Error('Authenticated smoke requires SMOKE_AUTH_STATE_PATH or SMOKE_AUTH_STATE_B64.');
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      acceptDownloads: true,
      storageState: authStatePath,
    });

    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => (
      Boolean(document.querySelector('[data-smoke="signed-out-shell"]')) ||
      Boolean(document.querySelector('[data-smoke="authenticated-shell"]')) ||
      Boolean(document.querySelector('[data-smoke="consent-gate"]'))
    ));

    const signedOutShell = page.locator('[data-smoke="signed-out-shell"]');
    const authenticatedShell = page.locator('[data-smoke="authenticated-shell"]');
    const consentGate = page.locator('[data-smoke="consent-gate"]');

    if ((await authenticatedShell.count()) === 0 && (await consentGate.count()) === 0) {
      await signedOutShell.waitFor();
      await page.waitForFunction(() => (
        Boolean(document.querySelector('[data-smoke="authenticated-shell"]')) ||
        Boolean(document.querySelector('[data-smoke="consent-gate"]')) ||
        Boolean(document.querySelector('[data-smoke="sign-in-google"]'))
      ), { timeout: 10000 });

      if ((await authenticatedShell.count()) > 0 || (await consentGate.count()) > 0) {
        // Stored auth state can restore asynchronously after the signed-out shell flashes.
      } else {
      await page.locator('[data-smoke="sign-in-google"]').click();
      await page.waitForFunction(() => (
        Boolean(document.querySelector('[data-smoke="authenticated-shell"]')) ||
        Boolean(document.querySelector('[data-smoke="consent-gate"]'))
      ));
      }
    }

    if (await consentGate.count()) {
      await consentGate.locator('input[type="checkbox"]').nth(0).check();
      await consentGate.locator('input[type="checkbox"]').nth(1).check();
      await page.locator('[data-smoke="accept-consent"]').click();
    }

    await authenticatedShell.waitFor();
    await page.locator('[data-smoke="nav-profile"]').click();

    await page.locator('#profile-name').fill(smokeProfile.name);
    await page.locator('#profile-dob').fill(smokeProfile.dob);
    await page.locator('#profile-sex').selectOption(smokeProfile.sexAssignedAtBirth);
    await page.getByRole('button', { name: new RegExp(`^${smokeProfile.smokingStatus.charAt(0).toUpperCase()}${smokeProfile.smokingStatus.slice(1)}$`) }).click();
    if (smokeProfile.smokingStatus !== 'never') {
      await page.locator('#profile-pack-years').fill(String(smokeProfile.packYears));
      if (smokeProfile.smokingStatus === 'former' && (await page.locator('#profile-quit-date').count())) {
        await page.locator('#profile-quit-date').fill(smokeProfile.quitDate);
      }
    }

    const recommendationCardsBeforeSave = await page.locator('[data-smoke="recommendation-card"]').count();
    await page.locator('[data-smoke="save-profile"]').click();
    await page.getByText('Lung Screening', { exact: false }).waitFor();
    const recommendationCardsAfterSave = await page.locator('[data-smoke="recommendation-card"]').count();
    if (recommendationCardsAfterSave <= recommendationCardsBeforeSave) {
      throw new Error('Recommendations did not refresh after saving the profile.');
    }

    await page.locator('[data-smoke="nav-profile"]').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-smoke="export-account-data"]').click();
    const download = await downloadPromise;
    const exportPath = await download.path();
    if (!exportPath) {
      throw new Error('Account export download was not written to disk.');
    }

    const exportPayload = JSON.parse(await fs.readFile(exportPath, 'utf8'));
    if (exportPayload.profile?.name !== smokeProfile.name) {
      throw new Error('Account export did not contain the saved profile.');
    }
    if (!Array.isArray(exportPayload.recommendations) || exportPayload.recommendations.length === 0) {
      throw new Error('Account export did not include recommendations.');
    }
    if (expectedEmail && exportPayload.user?.email !== expectedEmail) {
      throw new Error(`Account export email mismatch: expected ${expectedEmail}, saw ${exportPayload.user?.email || 'missing'}.`);
    }

    if (!skipDelete) {
      page.once('dialog', async dialog => {
        if (dialog.type() === 'prompt') {
          await dialog.accept('DELETE');
          return;
        }
        await dialog.dismiss();
      });
      await page.locator('[data-smoke="delete-account"]').click();
      await page.waitForFunction(() => (
        Boolean(document.querySelector('[data-smoke="signed-out-shell"]')) &&
        Boolean(document.querySelector('[data-smoke="sign-in-google"]'))
      ), { timeout: 120000 });
    }
    console.log('ok - authenticated smoke path');
  } finally {
    await browser.close();
  }
}

for (const check of checks) {
  if (staticOnly && check.serverOnly) {
    console.log(`skip - ${check.label} (static-only smoke)`);
    continue;
  }

  const url = new URL(check.path, baseUrl).toString();
  const body = await fetchWithRetry(url);
  if (!check.expect(body)) {
    throw new Error(`Smoke check failed for ${check.label} at ${url}`);
  }
  console.log(`ok - ${check.label}`);
}

if (!staticOnly) {
  const authStatePath = await resolveAuthStatePath();
  if (authStatePath) {
    await runAuthenticatedSmoke(baseUrl, authStatePath);
  } else if (authRequired) {
    throw new Error('Authenticated smoke requires SMOKE_AUTH_STATE_PATH or SMOKE_AUTH_STATE_B64.');
  }
}
