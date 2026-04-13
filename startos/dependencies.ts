import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(
  async ({ effects: _effects }) => {
    return {
      'bitcoin-cash-node': {
        kind: 'running' as const,
        versionRange: '>=29.0.0:0',
        healthChecks: ['rpc'],
        configRules: [
          {
            rule: (config: Record<string, unknown>) =>
              config['prune'] == null || config['prune'] === 0,
            message:
              'Pruning must be disabled for Fulcrum BCH to index the full blockchain.',
            correction: {
              set: { 'prune': null },
            },
          },
          {
            rule: (config: Record<string, unknown>) =>
              config['txindex'] === true,
            message:
              'Transaction index (txindex) must be enabled for Fulcrum BCH to function properly.',
            correction: {
              set: { 'txindex': true },
            },
          },
          {
            rule: (config: Record<string, unknown>) =>
              config['zmqEnabled'] === true,
            message:
              'ZeroMQ must be enabled on Bitcoin Cash Node for Fulcrum BCH to receive block notifications.',
            correction: {
              set: { 'zmqEnabled': true },
            },
          },
        ],
      },
    }
  },
)
