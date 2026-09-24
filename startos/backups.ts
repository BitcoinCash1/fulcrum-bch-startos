import { sdk } from './sdk'
import { NETWORKS } from './utils'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main').setOptions({
    // Fulcrum's index is derived entirely from the node and is tens of
    // gigabytes on mainnet. Only the settings, banner and node selection at the
    // volume root are worth carrying; a restored install rebuilds the index.
    exclude: NETWORKS.map((network) => `/${network}`),
  }),
)
