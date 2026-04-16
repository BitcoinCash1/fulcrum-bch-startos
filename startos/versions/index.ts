import { VersionGraph } from '@start9labs/start-sdk'
import { v_2_1_0_13 } from './v2.1.0.13'
import { v_2_1_0_12 } from './v2.1.0.12'
import { v_2_1_0_11 } from './v2.1.0.11'
import { v_2_1_0_10 } from './v2.1.0.10'
import { v_2_1_0_2 } from './v2.1.0.2'
import { v_2_1_0_1 } from './v2.1.0.1'
import { v_2_1_0_0 } from './v2.1.0.0'

export const versionGraph = VersionGraph.of({
  current: v_2_1_0_13,
  other: [v_2_1_0_12, v_2_1_0_11, v_2_1_0_10, v_2_1_0_2, v_2_1_0_1, v_2_1_0_0],
})
