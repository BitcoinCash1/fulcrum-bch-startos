import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(
  async ({ effects }) => {
    // Auto-configure BCHN: disable pruning, enable txindex and ZMQ
    await sdk.action.createTask(
      effects,
      'bitcoin-cash-node',
      // Action ID for the BCHN config that controls txindex/zmq/prune
      // This targets BCHN's built-in config action
      'config' as any,
      'critical',
      {
        input: {
          kind: 'partial',
          value: {
            prune: null,
            txindex: true,
            zmqEnabled: true,
          },
        },
        reason:
          'Pruning must be disabled, txindex and ZMQ must be enabled for Fulcrum BCH to function properly.',
        when: { condition: 'input-not-matches', once: false },
      },
    )

    return {
      'bitcoin-cash-node': {
        kind: 'running' as const,
        versionRange: '>=29.0.0:0',
        healthChecks: ['rpc'],
      },
    }
  },
)
