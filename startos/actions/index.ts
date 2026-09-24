import { sdk } from '../sdk'
import { configure } from './configure'
import { deleteNetworkIndex } from './deleteNetworkIndex'
import { selectNode } from './selectNode'

export const actions = sdk.Actions.of()
  .addAction(selectNode)
  .addAction(configure)
  .addAction(deleteNetworkIndex)
