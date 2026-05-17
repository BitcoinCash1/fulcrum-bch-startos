# Fulcrum BCH

Fulcrum is a high-performance Electrum server for Bitcoin Cash (BCH).
It indexes the full BCH blockchain and provides the Electrum protocol
for wallets and the address/transaction lookup API required by BCH Explorer.

## Prerequisites

Fulcrum requires a fully-synced Bitcoin Cash full node:
- **BCHN** (recommended)
- **BCHD**
- **Flowee the Hub**

The node must be fully synced before Fulcrum can complete its own initial indexing.

## Initial Sync

Fulcrum performs an initial block sync that can take several hours to days
depending on your hardware. During sync, the service status will show
"Indexing...". Wallet connections are available only after indexing completes.

## Connecting Wallets

Point your Electron Cash or other Electrum-compatible BCH wallet to:

| Protocol | Address                        | Port  |
|----------|--------------------------------|-------|
| TCP      | `<your-server-lan-address>`    | 50001 |
| SSL      | `<your-server-lan-address>`    | 50002 |
| Tor      | `<your-onion-address>`         | 50001 |

## BCH Explorer Integration

BCH Explorer uses Fulcrum for address and transaction lookups.
After installing BCH Explorer, select **Fulcrum BCH** as the Electrum indexer
in its **Config** panel.

## Support

- Package: <https://github.com/BitcoinCash1/fulcrum-bch-startos>
- Upstream: <https://github.com/cculianu/Fulcrum>
