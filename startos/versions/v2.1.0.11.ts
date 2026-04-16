import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_0_11 = VersionInfo.of({
  version: '2.1.0:11',
  releaseNotes:
    'Fix ghost tasks caused by replay-ID mismatch (dash vs colon). All stale task variants are now cleared before creating the active backend task.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
