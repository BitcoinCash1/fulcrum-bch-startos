import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_0_14 = VersionInfo.of({
  version: '2.1.0:14',
  releaseNotes:
    'Fix stuck "Task Required" — clear stale bitcoincash:autoconfig ghost task (wrong package ID). Restore reactive .const(effects) for seamless backend switching.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
