import { T } from '@start9labs/start-sdk'
import { autoconfig as bchdAutoconfig } from 'bitcoin-cash-daemon-startos/startos/actions/config/autoconfig'
import { autoconfig as bchnAutoconfig } from 'bitcoin-cash-node-startos/startos/actions/config/autoconfig'
import { autoconfig as knuthAutoconfig } from 'knuth-bch-startos/startos/actions/config/autoconfig'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { NODE_IDS, NodeId } from './utils'

/** The task each node carries on Fulcrum's behalf, keyed `<packageId>:<actionId>`. */
const NODE_TASK_KEYS: Record<NodeId, string> = {
  bitcoincashd: 'bitcoincashd:autoconfig',
  bchd: 'bchd:autoconfig',
  flowee: 'flowee:create-dependent-credential',
  'knuth-bch': 'knuth-bch:autoconfig',
}

// bitcoincashd, bchd, flowee and knuth-bch are all optional in the manifest and exactly one
// is selected at a time, so only the one store.json names is returned here.
export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const store = await storeJson.read().const(effects)
  const node = store?.nodePackageId ?? 'bitcoincashd'

  // A task is keyed `<packageId>:<actionId>`. Drop the ones belonging to the
  // nodes the user is not on, so none sits in the task list against a node
  // Fulcrum no longer talks to. The selected node's own key is deliberately
  // absent: selecting Flowee writes the store, which re-runs this, and clearing
  // its key here would race the task the action raises straight afterwards.
  await sdk.action.clearTask(
    effects,
    ...NODE_IDS.filter((id) => id !== node).map((id) => NODE_TASK_KEYS[id]),
  )

  if (store?.nodeConfirmed) {
    // Upstream requires an unpruned node with a full transaction index. ZeroMQ
    // is upstream's recommendation rather than a requirement, so it is applied
    // when the user runs the task but does not by itself keep the task raised.
    if (node === 'bitcoincashd') {
      await sdk.action.createTask(
        effects,
        'bitcoincashd',
        bchnAutoconfig,
        'critical',
        {
          input: {
            kind: 'partial',
            accept: [{ prune: 0, txindex: true }],
            set: { prune: 0, txindex: true, zmqEnabled: true },
          },
          when: { condition: 'input-not-matches', once: false },
          reason: i18n(
            'Fulcrum indexes every transaction on the chain, which needs an unpruned node and the full transaction index',
          ),
        },
      )
    } else if (node === 'bchd') {
      await sdk.action.createTask(effects, 'bchd', bchdAutoconfig, 'critical', {
        input: {
          kind: 'partial',
          accept: [{ prune: 0, txindex: true }],
          set: { prune: 0, txindex: true },
        },
        when: { condition: 'input-not-matches', once: false },
        reason: i18n(
          'Fulcrum indexes every transaction on the chain, which needs an unpruned node and the full transaction index',
        ),
      })
    } else if (node === 'knuth-bch') {
      // Knuth serves JSON-RPC only when it is enabled, and only the full
      // database mode keeps the transaction data Fulcrum indexes.
      await sdk.action.createTask(
        effects,
        'knuth-bch',
        knuthAutoconfig,
        'critical',
        {
          input: {
            kind: 'partial',
            accept: [{ databaseMode: 'full', rpcEnabled: true }],
            set: { databaseMode: 'full', rpcEnabled: true },
          },
          when: { condition: 'input-not-matches', once: false },
          reason: i18n(
            'Fulcrum reads the chain from Knuth over JSON-RPC, which needs JSON-RPC enabled and the full database mode',
          ),
        },
      )
    }
    // Flowee's task is raised by the Select Node Backend action instead: it
    // registers a credential, which `input-not-matches` cannot judge (Flowee
    // keeps only a hash and its action reports no current input), so a task
    // created here would reappear on every init however many times the user
    // had already answered it.
  }

  // Only the binding Fulcrum actually dials has to be up. Fulcrum indexes to
  // whatever height the node has reached and follows it from there, so gating
  // on the node's `sync-progress` would keep the service unstartable — and its
  // own progress unreadable — for the days a fresh chain takes to sync.
  const nodeDependency: Record<NodeId, T.DependencyRequirement> = {
    bitcoincashd: {
      id: 'bitcoincashd',
      kind: 'running',
      versionRange: '>=29.0.0:10',
      healthChecks: ['primary'],
    },
    bchd: {
      id: 'bchd',
      kind: 'running',
      versionRange: '>=0.22.2:0',
      // BCHD serves RPC over its own TLS with a self-signed certificate, so it
      // is dialed through its plaintext proxy daemon instead — that proxy, not
      // the native RPC, is the binding that has to be up.
      healthChecks: ['rpc-plaintext'],
    },
    flowee: {
      id: 'flowee',
      kind: 'running',
      versionRange: '>=2026.5.2:12',
      healthChecks: ['primary'],
    },
    'knuth-bch': {
      id: 'knuth-bch',
      kind: 'running',
      versionRange: '>=1.3.0:0',
      // Knuth's JSON-RPC port is served by its `rpc-compat` daemon, which is
      // the binding Fulcrum dials.
      healthChecks: ['rpc-compat'],
    },
  }

  return { [node]: nodeDependency[node] }
})
