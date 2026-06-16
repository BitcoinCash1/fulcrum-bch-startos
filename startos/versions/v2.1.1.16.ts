import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_16 = VersionInfo.of({
  version: '2.1.1:16',
  releaseNotes: 'Fix Fulcrum connection to BCHD on non-mainnet networks. BCHD uses different RPC ports per network (e.g. chipnet: 48334, testnet3: 18332) — Fulcrum was always connecting to port 8332, which only works on mainnet.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
