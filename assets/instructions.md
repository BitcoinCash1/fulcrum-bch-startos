# Fulcrum BCH Electrum Server

Fulcrum is a fast, SPV-compatible Electrum server for Bitcoin Cash. The StartOS package is called "Fulcrum BCH" to distinguish it from the Bitcoin version. It indexes
every address and transaction on the BCH chain and serves wallet queries over the
Electrum protocol. This page covers what is specific to running it on StartOS.

## What you get on StartOS

- An **Electrum server** that any standard BCH Electron Cash wallet or Electrum client
  can connect to directly from your LAN (or over Tor if you expose an onion address).
- **Address and transaction history lookups** — the Electrum protocol serves full
  history for any address, confirmed or unconfirmed, without the wallet revealing
  which addresses it owns to a third party.
- **Input to BCH Explorer** — BCH Explorer uses Fulcrum as its address-lookup and
  transaction-history backend.
- A single **Electrum interface** on port 50001 (plain TCP).

## Prerequisites

Fulcrum requires a running and fully-synced Bitcoin Cash full node. Supported
node backends on StartOS:

- **Bitcoin Cash Node (BCHN)** — recommended. C++ implementation; fastest IBD.
- **Bitcoin Cash Daemon (BCHD)** — Go implementation; also supported.

Select your node backend via **Actions → Select Node Backend**. Fulcrum reads
the node's RPC credentials from the shared volume — no manual credential entry
is needed.

**Important:** Fulcrum cannot begin indexing until the BCH node it depends on has
finished its own Initial Block Download. The health check will show a `loading`
state until IBD is complete and Fulcrum finishes its own initial indexing pass.

## Getting started

1. Install a Bitcoin Cash full node (BCHN or BCHD) and let it fully sync.
2. Install Fulcrum. It detects the node backend automatically from the dependency.
3. Fulcrum begins its initial index pass — this takes several hours for the full BCH
   chain. Watch progress on the **Dashboard**.
4. Once indexed, connect your wallets (see below).

## Connecting wallets

Point **Electron Cash** or any Electrum-compatible BCH wallet to:

| Field   | Value                                  |
|---------|----------------------------------------|
| Server  | `<your-startos-lan-address>`           |
| Port    | `50001`                                |
| Protocol| TCP (no SSL — plain Electrum)          |

In Electron Cash: **Tools → Network → Server tab** → uncheck "Select server
automatically" → enter your StartOS LAN address and port 50001.

Over Tor: expose an onion address via **Interfaces → Electrum Interface → Add Onion
Service** in StartOS and connect the wallet to `<your.onion>:50001`.

## Connecting to BCH Explorer

BCH Explorer automatically uses Fulcrum when both are installed. No configuration
is needed — the dependency is wired at install time.

## Port

| Port  | Protocol | Purpose                        |
|-------|----------|--------------------------------|
| 50001 | TCP      | Electrum protocol (plain text) |

SSL (port 50002) is not currently exposed — the StartOS interface layer handles
TLS termination for external access if needed.

## Limitations

- Fulcrum's index database is not included in backups. After a restore, Fulcrum
  re-indexes the full chain from the node — this takes the same time as the original
  index pass.
- Fulcrum cannot start indexing until the BCH node dependency is fully synced.
  Plan for both IBD time (node) and index time (Fulcrum) before the service is usable.
- Only one node backend can be active at a time. Switch backends via
  **Actions → Select Node Backend**; Fulcrum restarts and reconnects automatically.

## Support

- Package: <https://github.com/BitcoinCash1/fulcrum-bch-startos>
- Upstream: <https://github.com/cculianu/Fulcrum>
