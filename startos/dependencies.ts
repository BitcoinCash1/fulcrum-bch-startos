import { autoconfig as bchnAutoconfig } from 'bitcoin-cash-node-startos/startos/actions/config/autoconfig'
import { autoconfig as bchdAutoconfig } from 'bitcoin-cash-daemon-startos/startos/actions/config/autoconfig'
import { sdk } from './sdk'
import { storeJson } from './file-models/store.json'

/**
 * Modeled on official Start9 Fulcrum BTC pattern (v2.1.0_7).
 *
 * Key differences from the BTC version:
 *   - We support two backends (BCHN / BCHD) selected at runtime.
 *   - Before creating the active backend's task we purge every
 *     stale replay-ID variant that previous builds may have left behind.
 *   - We do NOT supply an explicit replayId to createTask so the SDK
 *     generates the canonical  `<packageId>:autoconfig`  form.
 */
export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const store = await storeJson.read().const(effects)
  const selectedNodePackageId = store?.nodePackageId ?? 'bitcoincashd'
  const nodePackageId = ['bitcoincashd', 'bchd', 'flowee', 'knuth-bch'].includes(selectedNodePackageId)
    ? selectedNodePackageId
    : 'bitcoincashd'

  // ── Purge every known stale task ──────────────────────────────
  // SDK auto-generates replay IDs as  `<pkgId>:autoconfig`  (colon).
  // Older builds of this package used the dash variants and a
  // manual  `select-node`  task.  Wipe them all so nothing ghosts.
  await sdk.action.clearTask(
    effects,
    // canonical colon format (created by SDK when no replayId given)
    'bitcoincashd:autoconfig',
    'bchd:autoconfig',
    'flowee:autoconfig',
    'knuth-bch:autoconfig',
    // legacy dash format (created by earlier fulcrum-bch builds)
    'bitcoincashd-autoconfig',
    'bchd-autoconfig',
    'flowee-autoconfig',
    'knuth-bch-autoconfig',
    // legacy select-node task
    'select-node',
    // stale typo from earlier builds (wrong package ID)
    'bitcoincash:autoconfig',
  )

  // ── Create only the task for the selected backend ─────────────
  if (nodePackageId === 'bchd') {
    await sdk.action.createTask(effects, 'bchd', bchdAutoconfig, 'critical', {
      input: {
        kind: 'partial',
        // @ts-ignore
        value: {
          txindex: true,
          prune: 0,
          grpcEnabled: true,
        },
      },
      reason:
        'Pruning must be disabled and txindex must be enabled for Fulcrum to function properly.',
      when: { condition: 'input-not-matches', once: false },
    })

    return {
      bchd: {
        kind: 'running',
        versionRange: '>=0.22.0:0',
        healthChecks: ['primary'],
      },
    } as any
  }

  if (nodePackageId === 'flowee') {
    // Fulcrum connects to Flowee via JSON-RPC — no autoconfig needed.
    // (REST API is required by BCH Explorer, not Fulcrum.)
    return {
      flowee: {
        kind: 'running',
        versionRange: '>=2026.2.0:0',
        healthChecks: ['primary'],
      },
    } as any
  }

  if (nodePackageId === 'knuth-bch') {
    // Knuth does not expose JSON-RPC yet (upstream roadmap, port 8332,
    // BCHN-compatible when shipped). We declare the dep so users can
    // pre-select it; Fulcrum will fail at RPC handshake with a clear
    // error until upstream RPC ships. No autoconfig task: there is
    // nothing RPC-relevant to configure today.
    return {
      'knuth-bch': {
        kind: 'running',
        versionRange: '>=0.80.0:0',
        healthChecks: ['primary'],
      },
    } as any
  }

  // Default: BCHN
  await sdk.action.createTask(
    effects,
    nodePackageId,
    bchnAutoconfig,
    'critical',
    {
      input: {
        kind: 'partial',
        // @ts-ignore
        value: {
          txindex: true,
          zmqEnabled: true,
        },
      },
      reason:
        'Pruning must be disabled, txindex and ZMQ must be enabled for Fulcrum to function properly.',
      when: { condition: 'input-not-matches', once: false },
    },
  )

  return {
    [nodePackageId]: {
      kind: 'running',
      versionRange: '>=29.0.0:0',
      healthChecks: ['primary'],
    },
  } as any
})
