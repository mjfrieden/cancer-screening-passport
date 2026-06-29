import { execFileSync } from 'node:child_process';

const PROJECT_ID = 'cancer-passport-wcm-prod';
const SOURCE_DATABASE = `(default)`;
const DESTINATION_PREFIX = 'recovery-test-';
const MARKER_COLLECTION = '_recovery_validation';
const MARKER_ID = 'synthetic-20260629';
const MARKER_VERSION = '2026-06-29';
const MARKER_CREATED_AT = new Date('2026-06-29T20:41:37Z');
const execute = process.argv.includes('--execute');

function runGcloud(args, options = {}) {
  return execFileSync('gcloud', args, {
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function readJson(args) {
  const output = runGcloud([...args, '--format=json']);
  return output ? JSON.parse(output) : [];
}

function fail(message, details = undefined, exitCode = 1) {
  console.error(JSON.stringify({ status: 'blocked', message, details }, null, 2));
  process.exit(exitCode);
}

const activeAccount = runGcloud([
  'auth',
  'list',
  '--filter=status:ACTIVE',
  '--format=value(account)',
]);
if (activeAccount !== 'marshall@whitecloudmedical.com') {
  fail('The approved White Cloud Medical Google account is not active.', activeAccount);
}

const backups = readJson([
  'firestore',
  'backups',
  'list',
  '--project',
  PROJECT_ID,
  '--sort-by=~snapshotTime',
]);
const sourceSuffix = `/databases/${SOURCE_DATABASE}`;
const backup = backups.find(item => (
  item.state === 'READY' &&
  item.database?.endsWith(sourceSuffix) &&
  new Date(item.snapshotTime || item.createTime) > MARKER_CREATED_AT
));

if (!backup) {
  fail(
    'No ready production backup containing the synthetic recovery marker is available yet.',
    {
      backupCount: backups.length,
      requiredAfter: MARKER_CREATED_AT.toISOString(),
      nextAction: 'Run this command after the first scheduled Sunday backup completes.',
    },
    2,
  );
}

const dateStamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
const destinationDatabase = `${DESTINATION_PREFIX}${dateStamp}`;
if (!destinationDatabase.startsWith(DESTINATION_PREFIX) || destinationDatabase === SOURCE_DATABASE) {
  fail('Unsafe recovery-test destination database name.', destinationDatabase);
}

const existingDatabases = readJson([
  'firestore',
  'databases',
  'list',
  '--project',
  PROJECT_ID,
]);
if (existingDatabases.some(database => database.name?.endsWith(`/databases/${destinationDatabase}`))) {
  fail('The recovery-test destination already exists and requires manual review.', destinationDatabase);
}

if (!execute) {
  console.log(JSON.stringify({
    status: 'ready',
    mode: 'dry-run',
    sourceBackup: backup.name,
    snapshotTime: backup.snapshotTime,
    destinationDatabase,
    nextCommand: 'PHI_RECOVERY_TEST_APPROVED=true npm run test:phi-recovery -- --execute',
  }, null, 2));
  process.exit(0);
}

if (process.env.PHI_RECOVERY_TEST_APPROVED !== 'true') {
  fail('Execution requires PHI_RECOVERY_TEST_APPROVED=true.');
}

let destinationCreated = false;
let validationPassed = false;

try {
  runGcloud([
    'firestore',
    'databases',
    'restore',
    `--source-backup=${backup.name}`,
    `--destination-database=${destinationDatabase}`,
    '--project',
    PROJECT_ID,
    '--quiet',
  ], { inherit: true });
  destinationCreated = true;

  const token = runGcloud(['auth', 'print-access-token']);
  const markerUrl = new URL(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/` +
    `${destinationDatabase}/documents/${MARKER_COLLECTION}/${MARKER_ID}`,
  );
  const response = await fetch(markerUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-user-project': PROJECT_ID,
    },
  });
  if (!response.ok) {
    throw new Error(`Restored marker read failed with HTTP ${response.status}.`);
  }

  const marker = await response.json();
  validationPassed = (
    marker.fields?.synthetic?.booleanValue === true &&
    marker.fields?.markerVersion?.stringValue === MARKER_VERSION
  );
  if (!validationPassed) {
    throw new Error('The restored synthetic marker did not match the expected values.');
  }
} finally {
  if (destinationCreated) {
    const restoredDatabase = readJson([
      'firestore',
      'databases',
      'describe',
      `--database=${destinationDatabase}`,
      '--project',
      PROJECT_ID,
    ]);
    if (restoredDatabase.deleteProtectionState === 'DELETE_PROTECTION_ENABLED') {
      runGcloud([
        'firestore',
        'databases',
        'update',
        `--database=${destinationDatabase}`,
        '--no-delete-protection',
        '--project',
        PROJECT_ID,
        '--quiet',
      ], { inherit: true });
    }
    runGcloud([
      'firestore',
      'databases',
      'delete',
      `--database=${destinationDatabase}`,
      '--project',
      PROJECT_ID,
      '--quiet',
    ], { inherit: true });
  }
}

console.log(JSON.stringify({
  status: validationPassed ? 'passed' : 'failed',
  completedAt: new Date().toISOString(),
  sourceBackup: backup.name,
  snapshotTime: backup.snapshotTime,
  destinationDatabase,
  markerValidated: validationPassed,
  temporaryDatabaseDeleted: destinationCreated,
}, null, 2));
