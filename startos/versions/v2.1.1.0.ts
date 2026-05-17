import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_0 = VersionInfo.of({
  version: '2.1.1:0',
  releaseNotes:
    'Update to upstream Fulcrum v2.1.1. ' +
    'Adds instructions.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
