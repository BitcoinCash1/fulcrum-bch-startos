import { readFileSync } from 'fs'
import { sdk } from './sdk'
import { electrumPort } from './utils'
import { fulcrumConf } from './file-models/fulcrum.conf'
import { manifest as bchnManifest } from 'bitcoin-cash-node-startos/startos/manifest'

export const main = sdk.setupMain(async ({ effects }) => {
  // Read BCHN RPC credentials from the mounted BCHN volume
  let rpcUser = 'bitcoin-cash-node'
  let rpcPassword = ''
  try {
    const raw = readFileSync('/mnt/bitcoin-cash-node/store.json', 'utf8')
    const store = JSON.parse(raw) as { rpcUser?: string; rpcPassword?: string }
    rpcUser = store.rpcUser ?? rpcUser
    rpcPassword = store.rpcPassword ?? rpcPassword
  } catch {
    console.warn('Could not read BCHN store.json — using defaults')
  }

  // Inject credentials into fulcrum.conf before starting the daemon
  await fulcrumConf.merge(effects, { rpcuser: rpcUser, rpcpassword: rpcPassword })

  let lastSyncLog: string | null = null

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(
      effects,
      { imageId: 'main' },
      sdk.Mounts.of()
        .mountVolume({
          volumeId: 'main',
          subpath: null,
          mountpoint: '/data',
          readonly: false,
        })
        .mountDependency<typeof bchnManifest>({
          dependencyId: 'bitcoin-cash-node',
          volumeId: 'main',
          subpath: null,
          mountpoint: '/mnt/bitcoin-cash-node',
          readonly: true,
        }),
      'primary-sub',
    ),
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
      display: 'Electrum',
      fn: async () => {
        const result = await sdk.healthCheck.checkPortListening(
          effects,
          electrumPort,
          {
            successMessage: 'The Electrum interface is ready',
            errorMessage: 'The Electrum interface is not ready',
          },
        )
        if (result.result === 'success') return result
        if (lastSyncLog) {
          return {
            result: 'loading',
            message: 'Electrum interface not ready — syncing BCH blockchain...',
          }
        }
        return result
      },
    },
    requires: [],
  })
    .addHealthCheck('sync-progress', {
      ready: {
        display: 'Sync Progress',
        fn: async () => {
          const ready = await sdk.healthCheck.checkPortListening(
            effects,
            electrumPort,
            {
              successMessage: 'Fulcrum BCH is fully synced',
              errorMessage: '',
            },
          )
          if (ready.result === 'success') return ready
          if (!lastSyncLog) {
            return { message: 'Waiting for sync information...', result: 'loading' }
          }
          return { message: lastSyncLog, result: 'loading' }
        },
      },
      requires: [],
    })
})
