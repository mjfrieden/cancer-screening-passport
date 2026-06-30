import { execFileSync } from 'node:child_process';

const REQUIRED_DATE_VARIABLES = [
  'HIPAA_RISK_ANALYSIS_APPROVED_DATE',
  'HIPAA_SECURITY_TRAINING_COMPLETED_DATE',
  'HIPAA_INCIDENT_TABLETOP_COMPLETED_DATE',
  'HIPAA_RETENTION_POLICY_APPROVED_DATE',
  'HIPAA_ACCESS_REVIEW_COMPLETED_DATE',
  'HIPAA_BACKUP_RESTORE_TEST_COMPLETED_DATE',
  'HIPAA_FINAL_LEGAL_REVIEW_APPROVED_DATE',
];
const REQUIRED_TRUE_VARIABLES = [
  'HIPAA_BAA_RETAINED',
  'HIPAA_SECOND_ACCOUNT_ISOLATION_VERIFIED',
  'PRODUCTION_AUTH_VERIFIED',
];
const REQUIRED_FALSE_VARIABLES = [
  'HIPAA_PRODUCTION_APPROVED',
  'VITE_REAL_PHI_ENABLED',
];

function run(command, args) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

const variables = JSON.parse(run('gh', [
  'variable',
  'list',
  '--env',
  'production',
  '--json',
  'name,value',
]));
const values = Object.fromEntries(variables.map(variable => [variable.name, variable.value]));
const checks = [];

for (const name of REQUIRED_DATE_VARIABLES) {
  checks.push({
    name,
    ok: /^\d{4}-\d{2}-\d{2}$/.test(values[name] || ''),
    expected: 'YYYY-MM-DD',
    actual: values[name] || null,
  });
}
for (const name of REQUIRED_TRUE_VARIABLES) {
  checks.push({
    name,
    ok: values[name] === 'true',
    expected: 'true',
    actual: values[name] || null,
  });
}
for (const name of REQUIRED_FALSE_VARIABLES) {
  checks.push({
    name,
    ok: values[name] === 'false',
    expected: 'false until a separate activation approval',
    actual: values[name] || null,
  });
}

for (const check of checks) {
  console.log(`${check.ok ? 'ok' : 'not ok'} - ${check.name}`);
}

const failed = checks.filter(check => !check.ok);
if (failed.length > 0) {
  console.error(JSON.stringify({
    status: 'blocked',
    readyForActivationApproval: false,
    failed,
  }, null, 2));
  process.exit(2);
}

console.log(JSON.stringify({
  status: 'passed',
  readyForActivationApproval: true,
  safetyLocksRemainOff: true,
  checkedAt: new Date().toISOString(),
}, null, 2));
