import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const projectId = process.env.GCP_PROJECT_ID || 'cancer-passport-wcm-prod';
const monitoringDir = join(process.cwd(), 'monitoring');
const alertPoliciesDir = join(monitoringDir, 'alert-policies');
const dashboardName = 'Cancer Prevention Passport Telemetry';
const notificationChannels = (process.env.MONITORING_NOTIFICATION_CHANNELS || '')
  .split(',')
  .map(channel => channel.trim())
  .filter(Boolean);

function run(args) {
  execFileSync('gcloud', args, { stdio: 'inherit' });
}

function runCapture(args) {
  return execFileSync('gcloud', args, { encoding: 'utf8' }).trim();
}

function createOrUpdateMetric(metricName, configFile) {
  try {
    run(['logging', 'metrics', 'create', metricName, '--project', projectId, `--config-from-file=${configFile}`]);
  } catch (error) {
    run(['logging', 'metrics', 'update', metricName, '--project', projectId, `--config-from-file=${configFile}`]);
  }
}

function createOrUpdateDashboard(configFile) {
  const existingName = runCapture([
    'monitoring',
    'dashboards',
    'list',
    '--project',
    projectId,
    '--filter',
    `displayName="${dashboardName}"`,
    '--format=value(name)',
  ]);

  if (!existingName) {
    run(['monitoring', 'dashboards', 'create', '--project', projectId, `--config-from-file=${configFile}`]);
    return;
  }

  run(['monitoring', 'dashboards', 'update', existingName, '--project', projectId, `--config-from-file=${configFile}`]);
}

function createOrUpdateAlertPolicy(displayName, configFile) {
  const existingName = runCapture([
    'monitoring',
    'policies',
    'list',
    '--project',
    projectId,
    '--filter',
    `displayName="${displayName}"`,
    '--limit',
    '1',
    '--format=value(name)',
  ]);

  if (!existingName) {
    const args = ['monitoring', 'policies', 'create', '--project', projectId, `--policy-from-file=${configFile}`];
    if (notificationChannels.length > 0) {
      args.push(`--notification-channels=${notificationChannels.join(',')}`);
    }
    run(args);
    return;
  }

  const args = ['monitoring', 'policies', 'update', existingName, '--project', projectId, `--policy-from-file=${configFile}`];
  if (notificationChannels.length > 0) {
    args.push(`--set-notification-channels=${notificationChannels.join(',')}`);
  }
  run(args);
}

const eventMetric = join(monitoringDir, 'cpp-telemetry-event-count.metric.json');
const screenMetric = join(monitoringDir, 'cpp-telemetry-screen-views.metric.json');
const dashboardFile = join(monitoringDir, 'cpp-telemetry-dashboard.json');
const alertPolicyFiles = [
  'launch-week-sign-in-dropoff.alert-policy.json',
  'launch-week-consent-failures.alert-policy.json',
  'launch-week-export-regressions.alert-policy.json',
  'launch-week-account-deletion-gaps.alert-policy.json',
].map(fileName => join(alertPoliciesDir, fileName));

if (!existsSync(eventMetric) || !existsSync(screenMetric) || !existsSync(dashboardFile) || alertPolicyFiles.some(file => !existsSync(file))) {
  throw new Error('Missing monitoring config files.');
}

createOrUpdateMetric('cpp_telemetry_event_count', eventMetric);
createOrUpdateMetric('cpp_telemetry_screen_views', screenMetric);
createOrUpdateDashboard(dashboardFile);

for (const alertPolicyFile of alertPolicyFiles) {
  const policyName = JSON.parse(readFileSync(alertPolicyFile, 'utf8')).displayName;
  createOrUpdateAlertPolicy(policyName, alertPolicyFile);
}
