import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_0_0 = VersionInfo.of({
  version: '2.1.0:0',
  releaseNotes: 'Initial release of Fulcrum BCH for StartOS. Powered by Fulcrum v2.1.0 by Cculianu. Connects to Bitcoin Cash Node for full BCH blockchain indexing and serves the Electrum protocol to BCH wallets.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
