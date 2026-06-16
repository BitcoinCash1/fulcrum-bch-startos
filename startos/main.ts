import { sdk } from './sdk'
import { electrumPort } from './utils'
import { fulcrumConf } from './file-models/fulcrum.conf'
import { storeJson } from './file-models/store.json'

export const main = sdk.setupMain(async ({ effects }) => {
  console.log('Starting Fulcrum BCH!')

  const store = await storeJson.read().once()
  const nodePackageId = store?.nodePackageId ?? 'bitcoincashd'

  const mounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    })
    .mountDependency({
      dependencyId: nodePackageId,
      volumeId: 'main',
      subpath: null,
      mountpoint: '/mnt/node',
      readonly: true,
    })

  // Create subcontainer first so we can exec into it to read BCHN's store.json
  // (the dependency volume is only accessible inside the subcontainer, not in Node.js process)
  const primarySub = await sdk.SubContainer.of(
    effects,
    { imageId: 'main' },
    mounts,
    'primary-sub',
  )

  // Read node RPC credentials and network from the mounted dependency volume.
  // Network is derived from the node — Fulcrum follows whatever network the node is on.
  // We read twice (5 s apart) because LXC bind-mounts take a few seconds to propagate
  // after the subcontainer is created; the first read can return stale data from a
  // previously-mounted dependency (e.g. flowee on chipnet) even though the new
  // dependency (e.g. bitcoincashd on mainnet) is already the configured one.
  let rpcUser = nodePackageId
  let rpcPassword = ''
  let nodeNetwork = 'mainnet'
  const readNodeStore = async () => {
    try {
      const result = await primarySub.exec(['cat', '/mnt/node/store.json'])
      if (result.exitCode === 0) {
        return JSON.parse(result.stdout.toString()) as {
          rpcUser?: string
          rpcPassword?: string
          network?: string
        }
      }
    } catch {}
    return null
  }
  const store1 = await readNodeStore()
  if (store1) {
    rpcUser = store1.rpcUser ?? rpcUser
    rpcPassword = store1.rpcPassword ?? rpcPassword
    nodeNetwork = store1.network ?? nodeNetwork
  } else {
    console.warn('Could not read node store.json (attempt 1) — using defaults')
  }
  // Wait for mount to settle, then re-read network (credentials don't change).
  // Observed LXC bind-mount propagation delay is 10-15 s; 20 s ensures the second
  // read always sees the settled value even on slow hosts.
  await new Promise<void>(r => setTimeout(r, 20000))
  const store2 = await readNodeStore()
  if (store2?.network) {
    if (store2.network !== nodeNetwork) {
      console.log(`[node-store] Network settled to ${store2.network} (was ${nodeNetwork} on first read)`)
    }
    nodeNetwork = store2.network
  }

  // Process any pending delete-network-data action signals written by the action handler.
  // The action writes /data/.delete-<network>; we delete the network dir and remove the signal.
  await primarySub.exec([
    'sh', '-c',
    `for net in mainnet chipnet testnet4 testnet3 scalenet regtest; do
       SIGNAL="/data/.delete-$net"
       NETDIR="/data/$net"
       if [ -f "$SIGNAL" ]; then
         echo "[fulcrum-delete] Deleting $NETDIR/ per user request"
         rm -rf "$NETDIR"
         rm -f "$SIGNAL"
         echo "[fulcrum-delete] Done"
       fi
     done`,
  ])

  // One-time migration: if the network-specific subdir is empty but the flat /data/
  // directory has Fulcrum DB files tagged for this network (pre-2.1.1:2 layout),
  // move them into the subdir so Fulcrum can resume without a full re-sync.
  // /data/.network records the network of the flat data; we only migrate if it matches.
  await primarySub.exec([
    'sh', '-c',
    `NETDIR="/data/${nodeNetwork}"
     NETFILE="/data/.network"
     mkdir -p "$NETDIR"
     # Tag the flat data's network if not already tagged (first run with 2.1.1:2)
     if [ ! -f "$NETFILE" ]; then
       # Peek at whether there is any flat DB data at all before tagging
       HAS_FLAT=$(find /data -maxdepth 1 -mindepth 1 \
         -not -name "fulcrum.conf" -not -name "banner.txt" \
         -not -name ".network" -not -name ".delete-*" \
         -not -name "mainnet" -not -name "chipnet" -not -name "testnet4" \
         -not -name "testnet3" -not -name "scalenet" -not -name "regtest" \
         2>/dev/null | head -1)
       if [ -n "$HAS_FLAT" ]; then
         # Flat data exists but no tag — tag it with current network (first boot after upgrade)
         echo "${nodeNetwork}" > "$NETFILE"
         echo "[fulcrum-migrate] Tagged existing flat /data/ data as ${nodeNetwork}"
       fi
     fi
     # Now attempt migration only if tags match and network subdir is empty
     if [ -f "$NETFILE" ] && [ "$(cat "$NETFILE")" = "${nodeNetwork}" ] && [ -z "$(ls -A "$NETDIR" 2>/dev/null)" ]; then
       HAS_DATA=$(find /data -maxdepth 1 -mindepth 1 \
         -not -name "fulcrum.conf" -not -name "banner.txt" \
         -not -name ".network" -not -name ".delete-*" \
         -not -name "mainnet" -not -name "chipnet" -not -name "testnet4" \
         -not -name "testnet3" -not -name "scalenet" -not -name "regtest" \
         2>/dev/null | head -1)
       if [ -n "$HAS_DATA" ]; then
         echo "[fulcrum-migrate] Moving flat /data/ index (${nodeNetwork}) into $NETDIR/"
         find /data -maxdepth 1 -mindepth 1 \
           -not -name "fulcrum.conf" -not -name "banner.txt" \
           -not -name ".network" -not -name ".delete-*" \
           -not -name "mainnet" -not -name "chipnet" -not -name "testnet4" \
           -not -name "testnet3" -not -name "scalenet" -not -name "regtest" \
           -exec mv {} "$NETDIR/" \\;
         rm -f "$NETFILE"
         echo "[fulcrum-migrate] Done — Fulcrum will resume from existing index"
       fi
     elif [ -z "$(ls -A "$NETDIR" 2>/dev/null)" ]; then
       echo "[fulcrum-start] No existing data for ${nodeNetwork} — fresh sync"
     else
       echo "[fulcrum-start] Resuming existing index at $NETDIR"
     fi`,
  ])

  // BCHN, Flowee, and BCHD all remap RPC port per network. Knuth always uses 8332.
  // Flowee uses 'testnet' while BCHN uses 'testnet3' for the same network — both covered.
  // BCHD uses different port numbers than BCHN/Flowee (e.g. chipnet: 48334 vs 48332).
  const perNetworkRpcPorts: Record<string, number> = {
    mainnet: 8332, testnet3: 18332, testnet: 18332, testnet4: 28342,
    scalenet: 38332, chipnet: 48332, regtest: 18443,
  }
  const bchdRpcPorts: Record<string, number> = {
    mainnet: 8332, testnet3: 18332, chipnet: 48334, regtest: 18444,
  }
  const rpcPort = (nodePackageId === 'bitcoincashd' || nodePackageId === 'flowee')
    ? (perNetworkRpcPorts[nodeNetwork] ?? 8332)
    : nodePackageId === 'bchd'
    ? (bchdRpcPorts[nodeNetwork] ?? 8332)
    : 8332
  const nodeHost = `${nodePackageId}.startos:${rpcPort}`

  // Inject credentials and per-network datadir into fulcrum.conf before starting.
  // Each network gets its own subdirectory so mainnet/chipnet/testnet4 data never mixes.
  // BCHD serves RPC over TLS; BCHN uses plaintext JSON-RPC.
  const bitcoindTls = nodePackageId === 'bchd'
  await fulcrumConf.merge(effects, {
    bitcoind: nodeHost,
    rpcuser: rpcUser,
    rpcpassword: rpcPassword,
    bitcoind_tls: bitcoindTls,
    datadir: `/data/${nodeNetwork}`,
  })

  let lastSyncLog: string | null = null

  // Monitor BCHN's network in the background. If it switches, call effects.restart()
  // which re-runs main.ts (not just the daemon), so fulcrum.conf gets rewritten with
  // the new port/datadir. Exit code 1 from the daemon only restarts the daemon process
  // and leaves the stale config in place, causing an infinite restart loop.
  let netMonitorActive = true
  ;(async () => {
    while (netMonitorActive) {
      await new Promise<void>(r => setTimeout(r, 15_000))
      if (!netMonitorActive) break
      try {
        const s = await readNodeStore()
        if (s?.network && s.network !== nodeNetwork) {
          console.log(`[net-monitor] Node network changed ${nodeNetwork} -> ${s.network} — restarting service`)
          netMonitorActive = false
          await effects.restart()
          return
        }
      } catch {}
    }
  })().catch(() => {})

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer: primarySub,
      exec: {
        command: [
          'sh', '-c',
          'exec Fulcrum --ts-format none /data/fulcrum.conf',
        ],
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
          const backendLabel = nodeNetwork
          const result = await sdk.healthCheck.checkPortListening(
            effects,
            electrumPort,
            {
              successMessage: `Electrum ready — ${backendLabel}`,
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
          const backendLabel = nodeNetwork
          const ready = await sdk.healthCheck.checkPortListening(
            effects,
            electrumPort,
            {
              successMessage: `Synced — ${backendLabel}`,
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
