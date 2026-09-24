# Fulcrum BCH

Fulcrum indexes a Bitcoin Cash chain from a full node, so a node has to be installed and fully synced before Fulcrum is of any use. Pick that node first — Fulcrum asks you to as soon as it installs — because switching later means building the index again.

## Documentation

- [Fulcrum upstream repository](https://github.com/cculianu/Fulcrum) — the README and configuration reference for the server this package runs.

## What you get on StartOS

- **An Electrum server for your own wallets.** Point Electron Cash, or any other Electrum-protocol wallet, at it and your addresses are queried against hardware you own instead of a stranger's server.
- **The backend BCH Explorer reads from.** If you run BCH Explorer, it gets address and transaction history from here.
- **One index per chain.** Fulcrum keeps a separate index for mainnet, chipnet, testnet and the rest, so moving your node between chains never throws away work you have already done.

## Getting set up

1. **Install a Bitcoin Cash node and let it finish syncing.** Bitcoin Cash Node, Bitcoin Cash Daemon, Flowee the Hub and Knuth all work.
2. **Answer the Select Node Backend prompt** that Fulcrum raises after install, choosing the node you installed.
3. **Answer the prompt that then appears on the node.** For Bitcoin Cash Node and Bitcoin Cash Daemon it turns on the full transaction index and turns pruning off, which Fulcrum needs. For Flowee it registers the login Fulcrum will use. For Knuth it turns JSON-RPC on and sets the full database mode.
4. **Start Fulcrum.** It begins indexing immediately. A full mainnet index takes several hours — the **Sync Progress** health check reports how far along it is, and you will get a notification when it finishes.

Fulcrum will not accept wallet connections until the index has caught up.

## Using Fulcrum BCH

### Connecting a wallet

Fulcrum serves the Electrum protocol on the **Electrum** interface. Copy its address from the Dashboard and give it to your wallet as a server, keeping the port that comes with it.

The interface is plaintext TCP — if your wallet insists on encryption, or you are connecting from outside your LAN, use the Tor address instead.

### Actions

- **Select Node Backend** — change which node Fulcrum indexes from. Fulcrum restarts against the new node; if that node is on a different chain, the index for that chain is built from scratch.
- **Configure** — set the banner your Electrum clients see on connect, and tune Fulcrum's RPC timeout, RPC client count, worker threads, database memory and open-file limit. Leave a field empty to let Fulcrum choose for itself.
- **Delete Chain Index** — free the disk one chain's index is using. Fulcrum has to be stopped first, because it holds the database open while it runs. The index is rebuilt the next time Fulcrum runs on that chain.

## Limitations

- **Backups do not include the index.** Your settings, banner and node choice are restored; the index is rebuilt from your node, which takes as long as the first one did.
