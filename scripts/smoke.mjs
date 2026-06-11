const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';

const checks = [
  {
    path: '/api/health',
    expect: body => JSON.parse(body).status === 'ok',
    label: 'health endpoint',
  },
  {
    path: '/',
    expect: body => body.includes('Cancer Prevention Passport') && body.includes('/site.webmanifest'),
    label: 'app shell',
  },
  {
    path: '/site.webmanifest',
    expect: body => JSON.parse(body).name === 'Cancer Prevention Passport',
    label: 'web manifest',
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
];

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

for (const check of checks) {
  const url = new URL(check.path, baseUrl).toString();
  const body = await fetchWithRetry(url);
  if (!check.expect(body)) {
    throw new Error(`Smoke check failed for ${check.label} at ${url}`);
  }
  console.log(`ok - ${check.label}`);
}
