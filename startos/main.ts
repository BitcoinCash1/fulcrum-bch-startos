import { fulcrumConf } from './fileModels/fulcrum.conf'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  electrumPort,
  networkDir,
  nodeMountpoint,
  nodeNetwork,
  nodeRpcBridge,
} from './utils'

/** The fields `main` reads out of the selected node's own `store.json`. */
type NodeStore = { network?: string; rpcUser?: string; rpcPassword?: string }

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Fulcrum BCH'))

  // A `.const()` read, so choosing a different node backend re-runs main by
  // itself — the Select Node Backend action only has to write the store.
  const store = await storeJson.read().const(effects)
  const node = store?.nodePackageId ?? 'bitcoincashd'

  const primarySub = await sdk.SubContainer.of(
    effects,
    { imageId: 'main' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      })
      .mountDependency({
        dependencyId: node,
        volumeId: 'main',
        subpath: null,
        mountpoint: nodeMountpoint,
        readonly: true,
      }),
    'primary-sub',
  )

  const readNodeStore = async (): Promise<NodeStore | null> => {
    const res = await primarySub
      .exec(['cat', `${nodeMountpoint}/store.json`])
      .catch(() => null)
    if (!res || res.exitCode !== 0) return null
    try {
      return JSON.parse(res.stdout.toString()) as NodeStore
    } catch {
      return null
    }
  }

  const nodeStore = await readNodeStore()
  if (!nodeStore) {
    console.warn(
      i18n(
        'Could not read the settings of the selected node. Assuming mainnet until it reports otherwise.',
      ),
    )
  }
  const reported = nodeStore?.network ?? 'mainnet'
  const network = nodeNetwork(reported)
  if (!network) {
    throw new Error(
      i18n('The selected node reports an unrecognized chain: ${chain}.', {
        chain: reported,
      }),
    )
  }

  const bitcoind = await nodeRpcBridge(effects, node, network)
  if (!bitcoind) {
    console.warn(
      i18n(
        'The selected node is not reachable yet. Fulcrum will connect once it is installed and running.',
      ),
    )
  }

  // Flowee keeps only a hash of each RPC password, so the credential it is
  // dialed with is the one this package minted and registered on it.
  const credentials =
    node === 'flowee'
      ? {
          rpcuser: store?.floweeRpcUser ?? '',
          rpcpassword: store?.floweeRpcPassword ?? '',
        }
      : {
          rpcuser: nodeStore?.rpcUser ?? node,
          rpcpassword: nodeStore?.rpcPassword ?? '',
        }

  const datadir = networkDir(network)
  await primarySub.exec(['mkdir', '-p', datadir])

  await fulcrumConf.merge(effects, {
    datadir,
    // An absent node is left absent rather than pointed at an address that
    // cannot answer; the bridge read heals when it returns.
    bitcoind: bitcoind ?? undefined,
    ...credentials,
  })

  let lastSyncLog: string | null = null
  let syncNotified = store?.syncNotified ?? false

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer: primarySub,
      exec: {
        command: ['Fulcrum', '--ts-format', 'none', '/data/fulcrum.conf'],
        onStdout: (chunk) => {
          const text = Buffer.isBuffer(chunk)
            ? chunk.toString('utf8')
            : String(chunk)

          console.log(text)

          const prefix = '<Controller>'
          if (text.startsWith(prefix)) {
            lastSyncLog = text.slice(prefix.length).trim()
          }
        },
      },
      ready: {
        display: i18n('Electrum'),
        fn: async () => {
          const result = await sdk.healthCheck.checkPortListening(
            effects,
            electrumPort,
            {
              successMessage: i18n(
                'The Electrum interface is ready on ${chain}',
                { chain: network },
              ),
              errorMessage: i18n('The Electrum interface is not ready'),
            },
          )

          if (result.result === 'success') return result

          if (lastSyncLog) {
            return {
              result: 'loading',
              message: i18n('Electrum interface not ready while syncing...'),
            } as const
          }

          return result
        },
      },
      requires: [],
    })
    .addHealthCheck('sync-progress', {
      ready: {
        display: i18n('Sync Progress'),
        fn: async () => {
          // The node's chain is a file, not a reactive source, so a change is
          // noticed here — for every node, BCHN included: the binding it moves
          // off a chain is left disabled, and a disabled binding still
          // resolves, so the bridge address above never goes null.
          const current = (await readNodeStore())?.network
          if (current && nodeNetwork(current) !== network) {
            console.info(
              i18n('The node switched from ${from} to ${to}. Restarting.', {
                from: network,
                to: current,
              }),
            )
            await effects.restart()
            return { result: 'loading', message: null } as const
          }

          const fulcrumReady = await sdk.healthCheck.checkPortListening(
            effects,
            electrumPort,
            {
              successMessage: i18n('Fulcrum is synced'),
              errorMessage: '',
            },
          )

          if (fulcrumReady.result === 'success') return fulcrumReady

          if (!lastSyncLog) {
            return {
              result: 'loading',
              message: i18n('Unknown status'),
            } as const
          }

          return { result: 'loading', message: lastSyncLog } as const
        },
      },
      requires: [],
    })
    .addOneshot('synced-true', {
      subcontainer: null,
      exec: {
        fn: async () => {
          if (!syncNotified) {
            await sdk.notification.create(effects, {
              level: 'success',
              title: i18n('Sync Complete'),
              message: i18n(
                'Fulcrum has finished building its address index. The Electrum server is ready.',
              ),
            })
            await storeJson.merge(effects, { syncNotified: true })
            // Keep the in-memory guard in sync so a sync-progress dip and
            // recovery within this run doesn't re-fire the notification.
            syncNotified = true
          }
          return null
        },
      },
      requires: ['sync-progress'],
    })
})
