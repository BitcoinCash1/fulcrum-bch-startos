import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_2 = VersionInfo.of({
  version: '2.1.1:2',
  releaseNotes: 'Network is now derived from the connected node (single source of truth). Fulcrum uses a per-network data directory (/data/mainnet, /data/chipnet, /data/testnet4) so blockchain data for different networks never mixes. Note: upgrading from 2.1.1:1 requires a one-time full re-index as the data directory structure has changed.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
