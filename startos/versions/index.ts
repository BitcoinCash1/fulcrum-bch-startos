import { VersionGraph } from '@start9labs/start-sdk'
import { v_2_1_0_1 } from './v2.1.0.1'
import { v_2_1_0_0 } from './v2.1.0.0'

export const versionGraph = VersionGraph.of({
  current: v_2_1_0_1,
  other: [v_2_1_0_0],
})
