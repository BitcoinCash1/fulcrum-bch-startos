export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Fulcrum BCH': 0,
  'Could not read the settings of the selected node. Assuming mainnet until it reports otherwise.': 1,
  'The selected node reports an unrecognized chain: ${chain}.': 2,
  'The selected node is not reachable yet. Fulcrum will connect once it is installed and running.': 3,
  Electrum: 4,
  'The Electrum interface is ready on ${chain}': 5,
  'The Electrum interface is not ready': 6,
  'Electrum interface not ready while syncing...': 7,
  'Sync Progress': 8,
  'The node switched from ${from} to ${to}. Restarting.': 9,
  'Fulcrum is synced': 10,
  'Unknown status': 11,
  'Sync Complete': 12,
  'Fulcrum has finished building its address index. The Electrum server is ready.': 13,
  // interfaces.ts
  'Serves the Electrum protocol to Bitcoin Cash wallets and to BCH Explorer': 14,
  // dependencies.ts
  'Fulcrum indexes every transaction on the chain, which needs an unpruned node and the full transaction index': 15,
  // init/taskSelectNode.ts
  'Choose which Bitcoin Cash node Fulcrum indexes from': 16,
  // actions/selectNode.ts
  'Select Node Backend': 17,
  'Choose which Bitcoin Cash node Fulcrum indexes the chain from.': 18,
  'Fulcrum restarts against the new node. If it is on a different chain, the index for that chain is built from scratch, which takes a while.': 19,
  'Node Backend': 20,
  'The node must be installed and fully synced before Fulcrum can index from it.': 21,
  'Bitcoin Cash Node': 22,
  'Bitcoin Cash Daemon': 23,
  'Flowee the Hub': 24,
  'Flowee needs an RPC credential registered for Fulcrum to log in with': 25,
  // actions/configure.ts
  Configure: 26,
  'Configure Fulcrum banner and performance settings.': 27,
  Configuration: 28,
  'Server Banner': 29,
  'Custom banner text displayed to connecting Electrum clients. Leave empty to use the Fulcrum default banner.': 30,
  'ASCII art welcome! Variables like $SERVER_VERSION are supported.': 31,
  'Node RPC Timeout (seconds)': 32,
  'Controls how long Fulcrum waits for responses from the node before failing a request.': 33,
  'Node RPC Clients': 34,
  'Number of concurrent RPC connections to the node.': 35,
  'Worker Threads (0 for auto)': 36,
  'Set the number of Fulcrum worker threads. Use 0 to allow Fulcrum to choose automatically.': 37,
  'Database Memory (MB)': 38,
  'Upper bound on memory used by the RocksDB cache. Increase for faster queries at the cost of RAM.': 39,
  'Database Max Open Files': 40,
  'Raise this if Fulcrum logs complaints about too many open files.': 41,
  Default: 42,
  // actions/deleteNetworkIndex.ts
  'Delete Chain Index': 43,
  'Delete the index Fulcrum built for one chain, freeing the disk it occupies.': 44,
  'The index for the chosen chain is deleted permanently. Fulcrum rebuilds it from the node the next time it runs on that chain, which takes hours on mainnet.': 45,
  Maintenance: 46,
  Chain: 47,
  'Which chain to delete the index for.': 48,
  Mainnet: 49,
  Testnet3: 50,
  Testnet4: 51,
  Scalenet: 52,
  Chipnet: 53,
  Regtest: 54,
  'Nothing to Delete': 55,
  'Fulcrum has no index for ${chain}.': 56,
  'Index Deleted': 57,
  'The ${chain} index is gone. Fulcrum rebuilds it the next time it runs on that chain.': 58,
  // Knuth backend (actions/selectNode.ts, dependencies.ts)
  Knuth: 59,
  'Fulcrum reads the chain from Knuth over JSON-RPC, which needs JSON-RPC enabled and the full database mode': 60,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
