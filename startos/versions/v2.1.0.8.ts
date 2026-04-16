import { VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../file-models/store.json'

export const v_2_1_0_8 = VersionInfo.of({
  version: '2.1.0:8',
  releaseNotes:
    'Fix dependency task cleanup and require backend re-selection so only the chosen BCH node appears in Fulcrum tasks and dependencies.',
  migrations: {
    up: async ({ effects }) => {
      await (effects as any).clearTasks({ except: [] })
      await storeJson.merge(effects, { nodeConfirmed: false })
    },
    down: async () => {},
  },
})