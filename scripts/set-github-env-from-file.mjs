import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const [environment, envFile] = process.argv.slice(2);
const allowedEnvironments = new Set(['staging', 'production']);

if (!environment || !envFile) {
  console.error('Usage: node scripts/set-github-env-from-file.mjs <environment> <KEY=value file>');
  process.exit(1);
}

if (!allowedEnvironments.has(environment)) {
  console.error(`Environment must be one of: ${[...allowedEnvironments].join(', ')}`);
  process.exit(1);
}

const repo = 'mjfrieden/cancer-screening-passport';
const secretKeys = new Set([
  'GCP_SERVICE_ACCOUNT',
  'GCP_WORKLOAD_IDENTITY_PROVIDER',
]);

const contents = await readFile(envFile, 'utf8');
const lines = contents
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));

for (const line of lines) {
  const separator = line.indexOf('=');
  if (separator === -1) {
    console.error(`Invalid line: ${line}`);
    process.exit(1);
  }

  const key = line.slice(0, separator).trim();
  const value = line.slice(separator + 1).trim().replace(/^"|"$/g, '');
  if (!key || !value) {
    console.error(`Missing key or value for line: ${line}`);
    process.exit(1);
  }

  const command = secretKeys.has(key)
    ? ['secret', 'set', key, '--repo', repo, '--env', environment, '--body', value]
    : ['variable', 'set', key, '--repo', repo, '--env', environment, '--body', value];

  const result = spawnSync('gh', command, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Configured GitHub environment values for ${environment}.`);
