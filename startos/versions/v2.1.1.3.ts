import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_3 = VersionInfo.of({
  version: '2.1.1:3',
  releaseNotes: 'Add "Delete Network Index" action to free disk space per network. Add startup migration to move existing flat /data/ index into the correct per-network subdirectory, avoiding a full re-sync when upgrading from 2.1.1:1.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
