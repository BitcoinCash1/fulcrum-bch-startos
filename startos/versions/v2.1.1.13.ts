import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_13 = VersionInfo.of({
  version: '2.1.1:13',
  releaseNotes: 'Fix Flowee backend connection on non-mainnet networks: Flowee remaps RPC port per network (e.g. chipnet=48332) the same as BCHN does.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
