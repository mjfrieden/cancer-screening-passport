const TELEMETRY_SESSION_KEY = 'cpp_telemetry_session_id';

export type TelemetryEventName =
  | 'app_open'
  | 'auth_sign_in_click'
  | 'auth_sign_in_success'
  | 'screen_view'
  | 'consent_accepted'
  | 'profile_saved'
  | 'screening_modal_opened'
  | 'screening_saved'
  | 'recommendations_generated'
  | 'export_account_data'
  | 'export_fhir_json'
  | 'export_pdf_summary'
  | 'account_deletion_started'
  | 'account_deletion_completed'
  | 'account_deletion_canceled';

export type TelemetryValue = string | number | boolean | null;
export type TelemetryPayload = Record<string, TelemetryValue>;

const ALLOWED_PAYLOAD_KEYS = new Set([
  'screen',
  'platform',
  'method',
  'status',
  'count',
  'source',
]);

function getSessionId() {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const existing = window.sessionStorage.getItem(TELEMETRY_SESSION_KEY);
    if (existing) {
      return existing;
    }

    const sessionId = globalThis.crypto?.randomUUID?.() ?? `session-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(TELEMETRY_SESSION_KEY, sessionId);
    return sessionId;
  } catch {
    return globalThis.crypto?.randomUUID?.() ?? `session-${Math.random().toString(36).slice(2)}`;
  }
}

function sanitizePayload(payload?: Record<string, unknown>): TelemetryPayload {
  if (!payload) {
    return {};
  }

  return Object.entries(payload).reduce<TelemetryPayload>((accumulator, [key, value]) => {
    if (!ALLOWED_PAYLOAD_KEYS.has(key)) {
      return accumulator;
    }

    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      accumulator[key] = value as TelemetryValue;
    }

    return accumulator;
  }, {});
}

export function trackTelemetry(eventName: TelemetryEventName, payload?: Record<string, unknown>) {
  if (typeof window === 'undefined') {
    return;
  }

  const body = {
    eventName,
    sessionId: getSessionId(),
    sentAt: new Date().toISOString(),
    payload: sanitizePayload(payload),
  };

  const json = JSON.stringify(body);

  if (navigator.sendBeacon) {
    const blob = new Blob([json], { type: 'application/json' });
    navigator.sendBeacon('/api/telemetry', blob);
    return;
  }

  void fetch('/api/telemetry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: json,
    keepalive: true,
    credentials: 'omit',
  }).catch(() => {});
}
