import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_8 = VersionInfo.of({
  version: '2.1.1:8',
  releaseNotes: 'Fix crash loop on network switch: increase LXC bind-mount settle wait from 5 s to 20 s so the second store.json read always sees the settled network value rather than stale data from a previous mount.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
