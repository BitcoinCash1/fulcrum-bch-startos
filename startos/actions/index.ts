import { sdk } from '../sdk'
import { configure } from './configure'
import { selectNode } from './selectNode'
import { deleteNetworkData } from './deleteNetworkData'

export const actions = sdk.Actions.of().addAction(selectNode).addAction(configure).addAction(deleteNetworkData)
