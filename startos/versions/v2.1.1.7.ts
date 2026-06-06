import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_1_1_7 = VersionInfo.of({
  version: '2.1.1:7',
  releaseNotes: 'Fix crash loop when switching node backends: double-read the node store.json (5 s apart) at startup so LXC bind-mount propagation delay does not cause the network monitor to see a stale network value and immediately restart Fulcrum.',
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
