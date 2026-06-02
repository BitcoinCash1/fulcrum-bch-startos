import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

type Network = 'mainnet' | 'chipnet' | 'testnet4' | 'testnet3' | 'scalenet' | 'regtest'

const inputSpec = InputSpec.of({
  network: Value.select({
    name: 'Network',
    description:
      'Select which network\'s Fulcrum index to delete. Fulcrum will re-index from scratch for that network next time it is the active network.',
    default: 'chipnet' as Network,
    values: {
      mainnet: 'Mainnet',
      chipnet: 'Chipnet',
      testnet4: 'Testnet4',
      testnet3: 'Testnet3',
      scalenet: 'Scalenet',
      regtest: 'Regtest',
    },
  }),
})

export const deleteNetworkData = sdk.Action.withInput(
  'delete-network-data',

  {
    name: 'Delete Network Index',
    description:
      'Delete the Fulcrum index for a specific network to free disk space. Fulcrum will re-index from scratch if you switch to that network again. Takes effect on next restart.',
    warning:
      'This permanently deletes the Fulcrum index for the selected network. Fulcrum will need to perform a full re-index for that network. Restart Fulcrum after running this action.',
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  inputSpec,

  async ({ effects }) => {
    return { network: 'chipnet' as Network }
  },

  async ({ effects, input }) => {
    // Write a signal file that main.ts will detect on next startup and delete the network dir.
    await FileHelper.string({
      base: sdk.volumes.main,
      subpath: `.delete-${input.network}`,
    }).write(effects, '1')

    return {
      version: '1' as const,
      title: 'Index Deletion Queued',
      message: `The ${input.network} Fulcrum index will be deleted on next restart. Restart Fulcrum now to apply.`,
      result: null,
    }
  },
)
