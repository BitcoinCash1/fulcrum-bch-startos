import { autoconfig as bchnAutoconfig } from 'bitcoin-cash-node-startos/startos/actions/config/autoconfig'
import { autoconfig as bchdAutoconfig } from 'bitcoin-cash-daemon-startos/startos/actions/config/autoconfig'
import { sdk } from './sdk'
import { storeJson } from './file-models/store.json'
import { selectNode } from './actions/selectNode'

const SELECT_NODE_REPLAY_ID = 'select-node'
const BCHN_AUTOCONFIG_REPLAY_ID = 'bitcoincashd-autoconfig'
const BCHD_AUTOCONFIG_REPLAY_ID = 'bchd-autoconfig'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const store = await storeJson.read().const(effects)
  const nodePackageId = store?.nodePackageId ?? 'bitcoincashd'
  const runtimeEffects = effects as any

  if (!store?.nodeConfirmed) {
    await runtimeEffects.clearTasks({ except: [SELECT_NODE_REPLAY_ID] })
    await sdk.action.createOwnTask(effects, selectNode, 'critical', {
      replayId: SELECT_NODE_REPLAY_ID,
      reason: 'Confirm which BCH node package ID should back this Fulcrum instance',
    })

    return {}
  }

  if (nodePackageId === 'bchd') {
    await runtimeEffects.clearTasks({ except: [BCHD_AUTOCONFIG_REPLAY_ID] })
    await sdk.action.createTask(effects, 'bchd', bchdAutoconfig, 'critical', {
      replayId: BCHD_AUTOCONFIG_REPLAY_ID,
      input: {
        kind: 'partial',
        value: {
          prune: 0,
          txindex: true,
          grpcEnabled: true,
        },
      },
      reason:
        'Pruning must be disabled, txindex must be enabled, and gRPC must be enabled for Fulcrum to function properly.',
      when: { condition: 'input-not-matches', once: false },
    })

    return {
      bchd: {
        kind: 'running',
        versionRange: '>=0.21.1:0',
        healthChecks: ['primary'],
      },
    } as any
  }

  await runtimeEffects.clearTasks({ except: [BCHN_AUTOCONFIG_REPLAY_ID] })
  await sdk.action.createTask(effects, nodePackageId, bchnAutoconfig, 'critical', {
    replayId: BCHN_AUTOCONFIG_REPLAY_ID,
    input: {
      kind: 'partial',
      value: {
        prune: 0,
        txindex: true,
        zmqEnabled: true,
      },
    },
    reason:
      'Pruning must be disabled, transaction index and ZMQ must be enabled for Fulcrum to function properly.',
    when: { condition: 'input-not-matches', once: false },
  })

  return {
    [nodePackageId]: {
      kind: 'running',
      versionRange: '>=29.0.0:0',
      healthChecks: ['primary'],
    },
  } as any
})
