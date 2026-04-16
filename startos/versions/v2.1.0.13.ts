import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_0_13 = VersionInfo.of({
  version: '2.1.0:13',
  releaseNotes:
    'Fix stuck autoconfig task — remove prune from partial input (null vs undefined mismatch caused input-not-matches to never resolve).',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
