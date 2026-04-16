import { autoconfig as bchnAutoconfig } from 'bitcoin-cash-node-startos/startos/actions/config/autoconfig'
import { autoconfig as bchdAutoconfig } from 'bitcoin-cash-daemon-startos/startos/actions/config/autoconfig'
import { sdk } from './sdk'
import { storeJson } from './file-models/store.json'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const store = await storeJson.read().const(effects)
  const nodePackageId = store?.nodePackageId ?? 'bitcoincashd'

  if (nodePackageId === 'bchd') {
    // BCHD always has txindex; just ensure pruning is disabled
    await sdk.action.createTask(effects, 'bchd', bchdAutoconfig, 'critical', {
      input: {
        kind: 'partial',
        value: {
          prune: 0,
        },
      },
      reason:
        'Pruning must be disabled for Fulcrum to function properly.',
      when: { condition: 'input-not-matches', once: false },
    })
  } else {
    // BCHN — request ZMQ for optimal performance
    await sdk.action.createTask(effects, nodePackageId, bchnAutoconfig, 'critical', {
      input: {
        kind: 'partial',
        value: {
          prune: 0,
          txindex: true,
          zmqEnabled: true,
        },
      },
      reason:
        'Pruning must be disabled, txindex and ZMQ must be enabled for Fulcrum to function properly.',
      when: { condition: 'input-not-matches', once: false },
    })
  }

  const deps: Record<string, { kind: 'running'; versionRange: string; healthChecks: string[] }> = {}

  if (nodePackageId === 'bchd') {
    deps['bchd'] = {
      kind: 'running',
      versionRange: '>=0.21.1:0',
      healthChecks: ['primary'],
    }
  } else {
    deps[nodePackageId] = {
      kind: 'running',
      versionRange: '>=29.0.0:0',
      healthChecks: ['primary'],
    }
  }

  return deps as any
})
