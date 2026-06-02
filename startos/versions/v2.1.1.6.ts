import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_6 = VersionInfo.of({
  version: '2.1.1:6',
  releaseNotes: 'Fix network monitor: use sed instead of python3 (not available in Fulcrum container) to parse JSON network field, handles whitespace in formatted JSON.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
