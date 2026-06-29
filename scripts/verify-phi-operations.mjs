import { execFileSync } from 'node:child_process';

const PROJECT_ID = 'cancer-passport-wcm-prod';
const BILLING_ACCOUNT = '0174EF-222187-7B71AF';
const EXPECTED_HUMAN_OWNER = 'user:marshall@whitecloudmedical.com';
const EXPECTED_DEPLOY_SERVICE_ACCOUNTS = [
  'github-actions-app-engine@cancer-passport-wcm-prod.iam.gserviceaccount.com',
  'github-actions-firestore@cancer-passport-wcm-prod.iam.gserviceaccount.com',
];

const checks = [];

function runGcloud(args) {
  return execFileSync('gcloud', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function readJson(args) {
  const output = runGcloud([...args, '--format=json']);
  return output ? JSON.parse(output) : [];
}

function check(label, condition, details) {
  checks.push({ label, ok: Boolean(condition), details });
}

const activeAccount = runGcloud([
  'auth',
  'list',
  '--filter=status:ACTIVE',
  '--format=value(account)',
]);
check(
  'approved Google account is active',
  activeAccount === 'marshall@whitecloudmedical.com',
  activeAccount,
);

const configuredProject = runGcloud(['config', 'get-value', 'project']);
check('production project is selected', configuredProject === PROJECT_ID, configuredProject);

const policy = readJson(['projects', 'get-iam-policy', PROJECT_ID]);
const ownerBinding = policy.bindings?.find(binding => binding.role === 'roles/owner');
check(
  'human project ownership is limited to the approved owner',
  ownerBinding?.members?.length === 1 && ownerBinding.members[0] === EXPECTED_HUMAN_OWNER,
  ownerBinding?.members || [],
);

const firestoreAudit = policy.auditConfigs?.find(
  config => config.service === 'datastore.googleapis.com',
);
const auditTypes = new Set(
  firestoreAudit?.auditLogConfigs?.map(config => config.logType) || [],
);
check(
  'Firestore Data Access audit logging is enabled',
  ['ADMIN_READ', 'DATA_READ', 'DATA_WRITE'].every(type => auditTypes.has(type)),
  [...auditTypes].sort(),
);
check(
  'Firestore audit logging has no principal exemptions',
  (firestoreAudit?.auditLogConfigs || []).every(
    config => !config.exemptedMembers || config.exemptedMembers.length === 0,
  ),
  firestoreAudit?.auditLogConfigs || [],
);

const serviceAccounts = readJson([
  'iam',
  'service-accounts',
  'list',
  '--project',
  PROJECT_ID,
]);
const userManagedKeys = [];
for (const serviceAccount of serviceAccounts) {
  const keys = readJson([
    'iam',
    'service-accounts',
    'keys',
    'list',
    '--iam-account',
    serviceAccount.email,
    '--managed-by=user',
  ]);
  userManagedKeys.push(...keys.map(key => ({ serviceAccount: serviceAccount.email, key: key.name })));
}
check('service accounts have no user-managed keys', userManagedKeys.length === 0, userManagedKeys);

for (const email of EXPECTED_DEPLOY_SERVICE_ACCOUNTS) {
  check(
    `deployment identity exists: ${email}`,
    serviceAccounts.some(account => account.email === email),
    email,
  );
}

const database = readJson([
  'firestore',
  'databases',
  'describe',
  '--database=(default)',
  '--project',
  PROJECT_ID,
]);
check(
  'Firestore delete protection is enabled',
  database.deleteProtectionState === 'DELETE_PROTECTION_ENABLED',
  database.deleteProtectionState,
);
check(
  'Firestore remains in the approved nam5 location',
  database.locationId === 'nam5',
  database.locationId,
);

const backupSchedules = readJson([
  'firestore',
  'backups',
  'schedules',
  'list',
  '--database=(default)',
  '--project',
  PROJECT_ID,
]);
const weeklyBackup = backupSchedules.find(
  schedule => schedule.weeklyRecurrence?.day === 'SUNDAY' && schedule.retention === '604800s',
);
check(
  'weekly Firestore backup with seven-day retention exists',
  Boolean(weeklyBackup),
  weeklyBackup?.name || null,
);

const budgets = readJson([
  'billing',
  'budgets',
  'list',
  `--billing-account=${BILLING_ACCOUNT}`,
]);
const projectBudget = budgets.find(budget => (
  budget.displayName === 'Cancer Passport production monthly alert' &&
  budget.amount?.specifiedAmount?.currencyCode === 'USD' &&
  budget.amount?.specifiedAmount?.nanos === 50_000_000 &&
  budget.budgetFilter?.projects?.includes('projects/410791537492')
));
check(
  'project-specific $0.05 monthly budget alert exists',
  Boolean(projectBudget),
  projectBudget?.name || null,
);

for (const result of checks) {
  console.log(`${result.ok ? 'ok' : 'not ok'} - ${result.label}`);
}

const failed = checks.filter(result => !result.ok);
if (failed.length > 0) {
  console.error(JSON.stringify({ status: 'failed', failed }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'passed',
  project: PROJECT_ID,
  checkedAt: new Date().toISOString(),
  checkCount: checks.length,
}, null, 2));
