# Telemetry Monitoring

This app now emits PHI-free first-party telemetry to `/api/telemetry`, and the
server writes allowlisted events into Cloud Logging. The dashboard in
`monitoring/cpp-telemetry-dashboard.json` summarizes that data in Cloud
Monitoring.

The monitoring setup script also installs launch-week alert policies from
`monitoring/alert-policies/` so regressions page the team instead of only
showing up in a dashboard.

## What It Shows

- Total telemetry volume over time.
- Event mix by telemetry type.
- Screen views by screen.
- Recent raw telemetry log entries for quick drill-down.

## Required Permissions

You need Google Cloud project access with:

- `roles/logging.configWriter` to create or update log-based metrics.
- `roles/monitoring.dashboardEditor` to create or update the dashboard.
- `roles/monitoring.alertPolicyEditor` to create or update alert policies.

## One-Time Setup

From the repo root:

```bash
npm run monitoring:setup
```

If you want to target a different project, set `GCP_PROJECT_ID` first:

```bash
GCP_PROJECT_ID=your-project-id npm run monitoring:setup
```

The script creates or updates:

- `cpp_telemetry_event_count`
- `cpp_telemetry_screen_views`
- `Cancer Prevention Passport Telemetry`
- launch-week alert policies for sign-in, consent, export, and account-delete
  regressions

If you have notification channels already configured, pass their resource names
with `MONITORING_NOTIFICATION_CHANNELS` so the alert policies notify someone:

```bash
MONITORING_NOTIFICATION_CHANNELS=projects/your-project/notificationChannels/1234567890 \
  npm run monitoring:setup
```

## How To Use It

1. Open Google Cloud Console.
2. Go to Monitoring, then Dashboards.
3. Open `Cancer Prevention Passport Telemetry`.
4. Use the dashboard time range picker to switch between the last hour, 24
   hours, or 7 days.
5. Click the pie chart slices or logs panel entries to drill into a specific
   event type.
6. Use the Logs Panel widget when you want the exact raw telemetry entry that
   produced a chart value.

## What To Watch

- A sudden drop in `screen_view` events usually means users are not getting
  through login or consent.
- A spike in `account_deletion_started` without matching completions suggests
  a reauth or delete-flow problem.
- A drop in `export_*` events can mean users are not finding sharing tools or a
  recent UI change hid them.
- A steady increase in total telemetry volume is expected as usage grows; the
  dashboard should stay inexpensive because the event set is narrow and
  allowlisted.

## Launch-Week Alerts

- `launch-week sign-in dropoff` watches the success rate from
  `auth_sign_in_click` to `auth_sign_in_success`.
- `launch-week consent failures` watches the acceptance rate from
  `auth_sign_in_success` to `consent_accepted`.
- `launch-week export regressions` watches the combined export rate from
  `auth_sign_in_success` to `export_account_data`, `export_fhir_json`, and
  `export_pdf_summary`.
- `launch-week account deletion gaps` watches the completion rate from
  `account_deletion_started` to `account_deletion_completed`.

These are intentionally launch-week canaries, not long-term SLOs. After the
first week of live traffic, tune the thresholds to match the real baseline.
