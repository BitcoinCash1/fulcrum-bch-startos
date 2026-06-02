import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_4 = VersionInfo.of({
  version: '2.1.1:4',
  releaseNotes: 'Add network monitor: Fulcrum now detects when the node switches networks and restarts automatically to sync the correct per-network index.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
