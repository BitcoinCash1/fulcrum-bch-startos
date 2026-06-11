import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_12 = VersionInfo.of({
  version: '2.1.1:12',
  releaseNotes: 'Remove incorrect REST autoconfig requirement when using Flowee the Hub as backend — Fulcrum uses JSON-RPC, not REST.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
