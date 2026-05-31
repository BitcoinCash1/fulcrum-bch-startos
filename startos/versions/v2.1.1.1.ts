import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_1 = VersionInfo.of({
  version: '2.1.1:1',
  releaseNotes: 'Add Knuth as a selectable node backend. Note: Knuth does not expose JSON-RPC in the current release — Fulcrum will report a connection error until Knuth ships RPC support.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
