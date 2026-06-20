export const POLICY_VERSIONS = {
  privacy: '2026-06-20',
  terms: '2026-06-20',
  medicalDisclaimer: '2026-06-20',
} as const;

export type PolicyVersions = typeof POLICY_VERSIONS;
