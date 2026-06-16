import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_14 = VersionInfo.of({
  version: '2.1.1:14',
  releaseNotes: 'Health checks now show the node backend and active network — e.g. "Electrum ready — Flowee / chipnet".',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
