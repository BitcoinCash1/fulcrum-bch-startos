import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_0_12 = VersionInfo.of({
  version: '2.1.0:12',
  releaseNotes:
    'Fix stuck autoconfig task (prune: 0 → null to match actual config). Prevent Fulcrum from stopping when switching node backend.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
