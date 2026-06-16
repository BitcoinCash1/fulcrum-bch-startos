import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_15 = VersionInfo.of({
  version: '2.1.1:15',
  releaseNotes: 'Health checks now show the active network only — e.g. "Electrum ready — chipnet". The node backend is already visible in the dependency panel.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
