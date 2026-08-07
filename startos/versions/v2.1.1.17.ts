import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_17 = VersionInfo.of({
  version: '2.1.1:17',
  releaseNotes:
    'Knuth backend: JSON-RPC is available as of Knuth v1.3.0. Fulcrum now ' +
    'auto-configures Knuth (RPC on, full DB mode) and uses the same per-network ' +
    'RPC ports as BCHN/Flowee (not a hardcoded 8332). Remaining Knuth method gaps ' +
    'for a full Fulcrum handshake are tracked upstream (k-nuth/kth#616).',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
