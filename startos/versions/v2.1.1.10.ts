import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_10 = VersionInfo.of({
  version: '2.1.1:10',
  releaseNotes: 'Fix network switch: move network monitor to main.ts using effects.restart() for proper service restart (daemon exit code 1 only restarted the daemon, not main.ts, causing an infinite restart loop).',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
