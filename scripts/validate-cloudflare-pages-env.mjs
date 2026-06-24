const deployEnvironment = process.env.DEPLOY_ENVIRONMENT?.trim() || process.env.GITHUB_ENVIRONMENT?.trim() || '';

const requiredVars = [
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_PAGES_PROJECT',
];

const placeholderValues = new Set([
  '',
  'replace-me',
  'your-cloudflare-account-id',
  'your-cloudflare-api-token',
  'your-pages-project',
]);

const missing = requiredVars.filter((key) => {
  const value = process.env[key]?.trim() || '';
  return placeholderValues.has(value);
});

if (missing.length > 0) {
  console.error('Missing required Cloudflare Pages deployment variables:');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID.trim();
if (!/^[a-f0-9]{32}$/i.test(accountId)) {
  console.error('CLOUDFLARE_ACCOUNT_ID should be the 32-character Cloudflare account ID.');
  process.exit(1);
}

const projectName = process.env.CLOUDFLARE_PAGES_PROJECT.trim();
if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(projectName)) {
  console.error('CLOUDFLARE_PAGES_PROJECT should use lowercase letters, numbers, and hyphens.');
  process.exit(1);
}

const simulatorEnabled = (process.env.VITE_ENABLE_CLINICAL_SIMULATOR || 'false').trim().toLowerCase();
if (deployEnvironment === 'production' && simulatorEnabled !== 'false') {
  console.error('VITE_ENABLE_CLINICAL_SIMULATOR must be false for production deploys.');
  process.exit(1);
}

console.log('Required Cloudflare Pages deployment variables are present.');
