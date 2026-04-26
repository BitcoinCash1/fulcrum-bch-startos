import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_0_15 = VersionInfo.of({
  version: '2.1.0:15',
  releaseNotes:
    'Fix BCHD TLS connection: use bitcoind_tls=true when BCHD is selected as backend. Require BCHD >=0.22.0 for May 2026 consensus upgrade.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
