import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { electrumPort } from '../utils'

/** Unset performance keys are omitted so Fulcrum applies its own defaults. */
const iniNumber = z
  .union([z.string().transform(Number), z.number()])
  .optional()
  .catch(undefined)

export const shape = z.object({
  // Written by `main` on every run, from the chain the selected node reports.
  datadir: z.string().catch('/data/mainnet'),
  bitcoind: z.string().optional().catch(undefined),
  rpcuser: z.string().catch(''),
  rpcpassword: z.string().catch(''),
  tcp: z.literal(`0.0.0.0:${electrumPort}`).catch(`0.0.0.0:${electrumPort}`),
  peering: z.literal(false).catch(false),
  announce: z.literal(false).catch(false),
  bitcoind_timeout: iniNumber,
  bitcoind_clients: iniNumber,
  worker_threads: iniNumber,
  db_mem: iniNumber,
  db_max_open_files: iniNumber,
  banner: z.literal('/data/banner.txt').catch('/data/banner.txt'),
  // Written by versions up to 2.1.1:16, when BCHD was dialed over its native
  // TLS RPC. A file model preserves keys it was never told about, so this has
  // to be named to be dropped: whatever is on disk parses to undefined and the
  // next write omits it.
  bitcoind_tls: z.undefined().optional().catch(undefined),
})

export const fulcrumConf = FileHelper.ini(
  {
    base: sdk.volumes.main,
    subpath: 'fulcrum.conf',
  },
  shape,
)
