import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_5 = VersionInfo.of({
  version: '2.1.1:5',
  releaseNotes: 'Fix network monitor: use python3 JSON parsing instead of grep to correctly detect network changes in formatted store.json.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
