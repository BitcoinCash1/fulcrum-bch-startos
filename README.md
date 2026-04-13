<p align="center">
  <img src="icon.png" alt="Fulcrum BCH Logo" width="21%">
</p>

# Fulcrum BCH on StartOS

> **Upstream project:** <https://github.com/cculianu/Fulcrum>
>
> Everything not listed in this document should behave the same as upstream
> Fulcrum. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

[Fulcrum](https://github.com/cculianu/Fulcrum) is a fast, feature-complete SPV server for Bitcoin Cash, written by Cculianu. It indexes the BCH blockchain via Bitcoin Cash Node and serves the Electrum protocol to BCH wallets and the BCH Explorer.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                          |
| ------------- | ---------------------------------------------- |
| Fulcrum       | `cculianu/fulcrum:v2.1.0` (upstream, unmodified) |
| Architectures | x86_64, aarch64                                |
| Runtime       | Single container                               |

## Volume and Data Layout

| Volume | Mount Point | Purpose                              |
| ------ | ----------- | ------------------------------------ |
| `main` | `/data`     | Fulcrum index data + configuration   |

StartOS-specific files:

| File            | Volume | Purpose                                           |
| --------------- | ------ | ------------------------------------------------- |
| `fulcrum.conf`  | `main` | Fulcrum configuration (managed by StartOS)        |
| `banner.txt`    | `main` | MOTD banner shown to Electrum clients on connect  |

## Installation and First-Run Flow

1. **Ensure Bitcoin Cash Node is installed** and fully synced
2. Install Fulcrum BCH from the StartOS marketplace
3. Bitcoin Cash Node will be automatically configured with:
   - `txindex=true` (transaction indexing enabled)
   - `prune=0` (pruning disabled)
   - `zmqEnabled=true` (ZMQ notifications enabled)
4. Wait for Bitcoin Cash Node to finish syncing
5. Fulcrum will begin indexing the full BCH blockchain — **this may take several hours** on first run

**Install alert:** Fulcrum BCH requires Bitcoin Cash Node to be fully synced before it begins indexing. Initial indexing of the full BCH blockchain may take several hours.

**Uninstall alert:** Uninstalling Fulcrum BCH will permanently delete all index data. You will need to re-index from scratch if reinstalled.

## Configuration Management

Fulcrum is configured via `fulcrum.conf`, managed by StartOS. RPC credentials are automatically injected from Bitcoin Cash Node's `store.json`.

### Auto-Configured by StartOS

| Setting      | Value                                   | Purpose                    |
| ------------ | --------------------------------------- | -------------------------- |
| `rpcuser`    | From BCHN `store.json`                  | RPC authentication         |
| `rpcpassword`| From BCHN `store.json`                  | RPC authentication         |
| `datadir`    | `/data`                                 | Index data directory       |
| `tcp`        | `0.0.0.0:50001`                         | Electrum TCP port          |

### Bitcoin Cash Node Requirements

StartOS automatically configures Bitcoin Cash Node with critical tasks:

- `txindex=true` — Transaction indexing enabled (required)
- `prune=0` — Pruning disabled (required for full index)
- `zmqEnabled=true` — ZMQ block notifications (required)

These are enforced via StartOS critical tasks — if the settings don't match, the user is prompted to apply them.

## Network Access and Interfaces

| Interface | Port  | Protocol  | Purpose                                |
| --------- | ----- | --------- | -------------------------------------- |
| Electrum  | 50001 | TCP (Electrum protocol) | Serves Electrum clients and BCH Explorer |

The Electrum interface is exposed as a non-HTTP API interface (raw TCP).

## Backups and Restore

**Volumes backed up:**

- `main` — Full Fulcrum index data and configuration

**Restore behavior:** All index data is restored from the backup. If the index is corrupted or too old, Fulcrum may need to re-index. Consider letting it catch up after restore.

## Health Checks

| Check             | Method              | Messages                                                          |
| ----------------- | ------------------- | ----------------------------------------------------------------- |
| **Electrum**      | Port 50001 listening | Success: "The Electrum interface is ready" / Loading: "Electrum interface not ready — syncing BCH blockchain..." |
| **Sync Progress** | Port 50001 + log parsing | Success: "Fulcrum BCH is fully synced" / Loading: Shows current sync progress from Fulcrum's `<Controller>` log |

The sync progress health check parses Fulcrum's stdout for `<Controller>` messages and displays them in the StartOS UI, so you can see exact sync status (e.g., block height, percentage).

## Dependencies

| Dependency         | Required | Mounted Volume                         | Purpose                    | Auto-Config                          |
| ------------------ | -------- | -------------------------------------- | -------------------------- | ------------------------------------ |
| Bitcoin Cash Node  | Yes      | `main` → `/mnt/bitcoin-cash-node`     | Blockchain data + RPC      | txindex=true, prune=0, zmqEnabled=true |

Bitcoin Cash Node latest release must be running and passing its primary health check.

The BCHN `.cookie` or `store.json` at `/mnt/bitcoin-cash-node/store.json` is used for RPC authentication.

## Limitations and Differences

1. **Bitcoin Cash only** — This package is configured for BCH mainnet only
2. **No SSL** — The Electrum interface runs on plain TCP (port 50001), not TLS/SSL
3. **Single network** — Only mainnet is supported

## What Is Unchanged from Upstream

- Full Electrum protocol support
- Complete UTXO index
- Fast initial sync
- Address history and balance queries
- Transaction broadcast
- Block header notifications
- Mempool monitoring
- All Electrum protocol methods

## Contributing

Contributions are welcome. Please open an issue or pull request on the [GitHub repository](https://github.com/CyberAshven/fulcrum-bch-startos).

For build instructions, see the [Makefile](Makefile) and [s9pk.mk](s9pk.mk).

---

## Quick Reference for AI Consumers

```yaml
package_id: fulcrum-bch
upstream_version: 2.1.0
images:
  main: cculianu/fulcrum:v2.1.0
architectures: [x86_64, aarch64]
volumes:
  main: /data (index + config)
ports:
  electrum: 50001 (TCP, Electrum protocol)
dependencies:
  - bitcoin-cash-node (required, version >=29.0.0:0, auto-config: txindex, prune=0, zmq)
health_checks:
  - electrum: port_listening 50001
  - sync-progress: port_listening 50001 + log parsing
backup_strategy: volume rsync (main)
config_files:
  - /data/fulcrum.conf (managed by StartOS)
  - /data/banner.txt (MOTD banner)
```
