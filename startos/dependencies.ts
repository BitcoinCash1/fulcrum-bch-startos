import { sdk } from './sdk'

// BCHN action stubs — IDs come from bitcoin-cash-node-startos action definitions
const pruningAction = { id: 'pruning-config' } as any
const otherAction = { id: 'other-config' } as any

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  // Require pruning disabled (prune: null = 0 = disabled)
  await sdk.action.createTask(
    effects,
    'bitcoin-cash-node',
    pruningAction,
    'critical',
    {
      input: { kind: 'partial', value: { prune: null } },
      reason:
        'Pruning must be disabled for Fulcrum BCH to index the full blockchain.',
      when: { condition: 'input-not-matches', once: false },
    },
  )

  // Require txindex and ZMQ enabled
  await sdk.action.createTask(
    effects,
    'bitcoin-cash-node',
    otherAction,
    'critical',
    {
      input: { kind: 'partial', value: { txindex: true, zmqEnabled: true } },
      reason:
        'Transaction index and ZMQ must be enabled for Fulcrum BCH to function properly.',
      when: { condition: 'input-not-matches', once: false },
    },
  )

  return {
    'bitcoin-cash-node': {
      kind: 'running' as const,
      versionRange: '>=29.0.0:0',
      healthChecks: ['primary'],
    },
  }
})
