import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main').setOptions({
    exclude: [
      '/fulc2_db',
      '/fulc2_db.mainnet',
      '/latch',
    ],
  }),
)
