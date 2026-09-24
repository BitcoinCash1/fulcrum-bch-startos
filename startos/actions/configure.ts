import { utils } from '@start9labs/start-sdk'
import { bannerTxt } from '../fileModels/banner.txt'
import { fulcrumConf } from '../fileModels/fulcrum.conf'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  banner: Value.textarea({
    name: i18n('Server Banner'),
    description: i18n(
      'Custom banner text displayed to connecting Electrum clients. Leave empty to use the Fulcrum default banner.',
    ),
    required: false,
    default: null,
    placeholder: i18n(
      'ASCII art welcome! Variables like $SERVER_VERSION are supported.',
    ),
    maxLength: 2000,
  }),
  bitcoind_timeout: Value.number({
    name: i18n('Node RPC Timeout (seconds)'),
    description: i18n(
      'Controls how long Fulcrum waits for responses from the node before failing a request.',
    ),
    required: false,
    default: null,
    integer: true,
    min: 30,
    footnote: `${i18n('Default')}: 30`,
  }),
  bitcoind_clients: Value.number({
    name: i18n('Node RPC Clients'),
    description: i18n('Number of concurrent RPC connections to the node.'),
    required: false,
    default: null,
    integer: true,
    min: 1,
    footnote: `${i18n('Default')}: 3`,
  }),
  worker_threads: Value.number({
    name: i18n('Worker Threads (0 for auto)'),
    description: i18n(
      'Set the number of Fulcrum worker threads. Use 0 to allow Fulcrum to choose automatically.',
    ),
    required: false,
    default: null,
    integer: true,
    min: 0,
    footnote: `${i18n('Default')}: 0 (auto)`,
  }),
  db_mem: Value.number({
    name: i18n('Database Memory (MB)'),
    description: i18n(
      'Upper bound on memory used by the RocksDB cache. Increase for faster queries at the cost of RAM.',
    ),
    required: false,
    default: null,
    integer: true,
    min: 50,
    footnote: `${i18n('Default')}: 2048`,
  }),
  db_max_open_files: Value.number({
    name: i18n('Database Max Open Files'),
    description: i18n(
      'Raise this if Fulcrum logs complaints about too many open files.',
    ),
    required: false,
    default: null,
    integer: true,
    min: 20,
    footnote: `${i18n('Default')}: 1000`,
  }),
})

export const configure = sdk.Action.withInput(
  'configure',

  async () => ({
    name: i18n('Configure'),
    description: i18n('Configure Fulcrum banner and performance settings.'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  inputSpec,

  // Only the keys this spec declares. Spreading the whole config would prefill
  // the banner field with `fulcrum.conf`'s own `banner` key — the path to
  // `banner.txt` rather than its contents — and hand back the RPC password with
  // it.
  async () => {
    const conf = await fulcrumConf.read().once()
    return {
      banner: (await bannerTxt.read().once()) || undefined,
      bitcoind_timeout: conf?.bitcoind_timeout,
      bitcoind_clients: conf?.bitcoind_clients,
      worker_threads: conf?.worker_threads,
      db_mem: conf?.db_mem,
      db_max_open_files: conf?.db_max_open_files,
    }
  },

  async ({ effects, input }) => {
    const { banner, ...conf } = input
    if (banner) await bannerTxt.write(effects, banner)
    await fulcrumConf.merge(effects, utils.nullToUndefined(conf))
  },
)
