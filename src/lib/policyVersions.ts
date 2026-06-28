export const POLICY_VERSIONS = {
  privacy: '2026-06-28',
  terms: '2026-06-28',
  medicalDisclaimer: '2026-06-28',
} as const;

export type PolicyVersions = typeof POLICY_VERSIONS;
