import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_11 = VersionInfo.of({
  version: '2.1.1:11',
  releaseNotes: 'Bundle instructions.md inside the package so the Instructions tab is populated in StartOS.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
