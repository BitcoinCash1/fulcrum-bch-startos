import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_0_1 = VersionInfo.of({
  version: '2.1.0:1',
  releaseNotes:
    'Dependency metadata improvements for better UI display. Bitcoin Cash Node dependency now shows title and icon in the Dependencies section.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
