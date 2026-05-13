import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_0_15 = VersionInfo.of({
  version: '2.1.0:15',
  releaseNotes:
    'Add Knuth (knuth-bch) to the Node Backend dropdown. ' +
    'Knuth does not expose JSON-RPC in the current upstream release; selecting it ' +
    'will surface a clear RPC error at startup until upstream ships RPC (port 8332, ' +
    'BCHN-compatible per the Knuth roadmap). No behavior change for BCHN/BCHD/Flowee users.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
