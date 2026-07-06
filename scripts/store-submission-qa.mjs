import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = (process.env.STORE_QA_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const outputDir = process.env.STORE_QA_OUTPUT_DIR || path.join('artifacts', 'store-submission-qa');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function capturePage(page, fileName, options = {}) {
  const filePath = path.join(outputDir, fileName);
  await page.screenshot({
    path: filePath,
    fullPage: options.fullPage ?? false,
  });
  return filePath;
}

async function verifyLegalPage(page, url, headingText, screenshotName) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('main', { timeout: 30000 });
  await page.getByRole('heading', { name: headingText }).waitFor({ timeout: 30000 });
  return capturePage(page, screenshotName, { fullPage: true });
}

await ensureDir(outputDir);

const results = [];
let browser = null;

try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('[data-smoke="signed-out-shell"]', { timeout: 30000 });
  results.push({
    check: 'Signed-out shell renders in an iPhone-sized viewport',
    status: 'pass',
  });

  const homeScreenshot = await capturePage(page, 'signed-out-home.png');
  results.push({
    check: 'Captured first App Store candidate screenshot',
    status: 'pass',
    artifact: homeScreenshot,
  });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(250);
  const footerScreenshot = await capturePage(page, 'signed-out-footer.png');
  results.push({
    check: 'Captured signed-out footer state after safe-area scroll',
    status: 'pass',
    artifact: footerScreenshot,
  });

  const homeLinks = [
    ['Privacy Policy', '/legal/privacy.html'],
    ['Terms of Use', '/legal/terms.html'],
    ['Medical Disclaimer', '/legal/medical-disclaimer.html'],
    ['Support', '/support.html'],
    ['Account Deletion', '/account-deletion.html'],
  ];

  for (const [label, relativeUrl] of homeLinks) {
    const count = await page.locator(`a[href="${relativeUrl}"]`).count();
    results.push({
      check: `Home page link for ${label}`,
      status: count > 0 ? 'pass' : 'fail',
      detail: count > 0 ? 'present' : 'missing',
    });
  }

  const legalPages = [
    {
      url: `${baseUrl}/legal/privacy.html`,
      heading: 'Privacy Policy',
      screenshot: 'privacy-policy.png',
    },
    {
      url: `${baseUrl}/legal/terms.html`,
      heading: 'Terms of Use',
      screenshot: 'terms-of-use.png',
    },
    {
      url: `${baseUrl}/legal/medical-disclaimer.html`,
      heading: 'Medical Disclaimer',
      screenshot: 'medical-disclaimer.png',
    },
    {
      url: `${baseUrl}/support.html`,
      heading: 'Support',
      screenshot: 'support.png',
    },
    {
      url: `${baseUrl}/account-deletion.html`,
      heading: 'Delete Your Account',
      screenshot: 'account-deletion.png',
    },
    {
      url: `${baseUrl}/offline.html`,
      heading: 'You are offline',
      screenshot: 'offline.png',
    },
  ];

  for (const legalPage of legalPages) {
    const artifact = await verifyLegalPage(page, legalPage.url, legalPage.heading, legalPage.screenshot);
    results.push({
      check: `${legalPage.heading} page renders`,
      status: 'pass',
      artifact,
    });
  }
} catch (error) {
  results.push({
    check: 'QA run',
    status: 'fail',
    detail: error instanceof Error ? error.message : String(error),
  });
} finally {
  if (browser) {
    await browser.close();
  }
}

const reportPath = path.join(outputDir, 'store-submission-qa-report.md');
const lines = [
  '# Store Submission QA',
  '',
  `- Base URL: \`${baseUrl}\``,
  `- Run date: \`${new Date().toISOString()}\``,
  '',
  '| Check | Status | Details |',
  '| --- | --- | --- |',
  ...results.map(result => `| ${result.check} | ${result.status} | ${result.artifact || result.detail || ''} |`),
  '',
];

await fs.writeFile(reportPath, `${lines.join('\n')}\n`, 'utf8');
console.log(JSON.stringify({ reportPath, outputDir, results }, null, 2));

if (results.some(result => result.status === 'fail')) {
  process.exitCode = 1;
}
