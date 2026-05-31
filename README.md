<div align="center">
  <img src="icon.png" alt="Fulcrum BCH logo" width="21%" />
  <h1>Fulcrum BCH</h1>
</div>

> **Upstream docs:** [github.com/cculianu/Fulcrum](https://github.com/cculianu/Fulcrum)
>
> Fulcrum is a fast, scalable Electrum SPV server for Bitcoin Cash. It indexes the full BCH blockchain to serve light wallets, block explorers, and other Electrum-protocol clients without requiring them to download the blockchain themselves.

---

## Table of Contents

1. [Image and Container Runtime](#1-image-and-container-runtime)
2. [Volume and Data Layout](#2-volume-and-data-layout)
3. [Installation and First-Run Flow](#3-installation-and-first-run-flow)
4. [Default Networking](#4-default-networking)
5. [Configuration Management](#5-configuration-management)
6. [Network Access and Interfaces](#6-network-access-and-interfaces)
7. [Actions (StartOS UI)](#7-actions-startos-ui)
8. [Backups and Restore](#8-backups-and-restore)
9. [Health Checks](#9-health-checks)
10. [Dependencies](#10-dependencies)
11. [Default Overrides](#11-default-overrides)
12. [Limitations and Differences](#12-limitations-and-differences)
13. [What Is Unchanged from Upstream](#13-what-is-unchanged-from-upstream)
14. [Contributing](#14-contributing)
15. [Quick Reference for AI Consumers](#15-quick-reference-for-ai-consumers)

---

## 1. Image and Container Runtime

| Field | Value |
|---|---|
| **Image ID** | `main` |
| **Source** | `cculianu/fulcrum:v2.1.1` from Docker Hub |
| **Architectures** | `x86_64`, `aarch64` (aarch64 emulates as x86_64 if not natively available) |
| **Command** | `Fulcrum --ts-format none /data/fulcrum.conf` |

---

## 2. Volume and Data Layout

| Volume Name | Mount Point | Purpose |
|---|---|---|
| `main` | `/data` | Fulcrum config, Electrum index database, and state |

**StartOS-managed files inside `/data`:**

| File / Directory | Managed By | Purpose |
|---|---|---|
| `fulcrum.conf` | StartOS SDK file model | Fulcrum configuration (RPC endpoint, credentials, performance tuning) |
| `store.json` | StartOS SDK file model | Package state: selected node package ID, sync latch |
| `banner.txt` | StartOS SDK file model | MOTD banner sent to connecting Electrum clients |
| `fulc2_db` / `fulc2_db.mainnet` | Fulcrum | Electrum index database (RocksDB) |
| `latch` | Fulcrum | First-run sync latch marker |

**Dependency volume mounted at runtime (read-only):**

| Mount Point | Source | Purpose |
|---|---|---|
| `/mnt/node` | Selected node package `main` volume | Read `store.json` for node RPC credentials (inside SubContainer only) |

---

## 3. Installation and First-Run Flow

1. StartOS pulls the `cculianu/fulcrum:v2.1.1` image.
2. Seed files are written: `fulcrum.conf` and `store.json` with defaults (node: BCHN).
3. On first start, Fulcrum reads the selected node's RPC credentials from `/mnt/node/store.json` inside the SubContainer.
4. `fulcrum.conf` is updated with the node RPC endpoint, credentials, and TLS mode (TLS enabled automatically when BCHD is selected; plaintext for BCHN/Flowee).
5. Fulcrum connects to the BCH node and waits for it to be fully synced.
6. Once the node is synced, Fulcrum begins indexing the blockchain. Initial indexing of the full BCH chain takes several hours.
7. When indexing completes, the Electrum interface opens on port 50001 and the health check reports success.

---

## 4. Default Networking

| Transport | Default | Inbound | How to Change |
|---|---|---|---|
| **Clearnet (IPv4/IPv6)** | Enabled — Electrum port exposed by StartOS | Enabled for Electrum clients (wallets, BCH Explorer) | Managed by StartOS |
| **Tor** | Available via StartOS routing | Available if StartOS assigns a `.onion` address to the package | Automatic via StartOS |
| **SSL/TLS Electrum** | Not separately exposed | Not available in this package version | — |

---

## 5. Configuration Management

| Group | Settings Covered |
|---|---|
| **Select Node Backend** | Choose which BCH full node Fulcrum connects to: BCHN, BCHD, Flowee, or Knuth |
| **Configure** | Server banner (MOTD), Bitcoin RPC timeout, number of RPC clients, worker threads, database memory (MB), database max open files |

---

## 6. Network Access and Interfaces

| Interface | Port | Protocol | Purpose | Condition |
|---|---|---|---|---|
| Electrum Interface | 50001 | TCP (plaintext) | Electrum protocol for BCH wallets and BCH Explorer | Always |

---

## 7. Actions (StartOS UI)

### Configuration

| Action ID | Name | Description |
|---|---|---|
| `select-node` | Select Node Backend | Choose which installed BCH node package (BCHN / BCHD / Flowee / Knuth) Fulcrum uses for blockchain data |
| `configure` | Configure | Set server banner, RPC timeout, RPC client count, worker threads, DB memory, and max open files |

---

## 8. Backups and Restore

**What IS backed up:**
- `fulcrum.conf` — configuration
- `store.json` — selected node, sync state
- `banner.txt` — MOTD banner

**What is NOT backed up:**
- `/fulc2_db` — Electrum index database (entirely derived from the blockchain; too large to back up usefully)
- `/fulc2_db.mainnet` — same, mainnet-specific variant
- `/latch` — first-run sync marker

The Electrum index is fully re-derivable from the connected BCH node. After restore, Fulcrum will re-index from scratch — this can take several hours.

---

## 9. Health Checks

| Check | Method | Key Messages |
|---|---|---|
| **Electrum** (daemon ready) | `sdk.healthCheck.checkPortListening` on port 50001 | `The Electrum interface is ready` / `Electrum interface not ready — syncing BCH blockchain...` |
| **Sync Progress** | Port 50001 listen check; falls back to last stdout `<Controller>` log line during indexing | `Fulcrum BCH is fully synced` / Last sync log message (e.g., `Processed N/M blocks`) / `Waiting for sync information...` |

---

## 10. Dependencies

### Bitcoin Cash Node — BCHN (optional)

| Field | Value |
|---|---|
| **Package ID** | `bitcoincashd` |
| **Version constraint** | Any |
| **Required state** | Running and fully synced; pruning must be disabled; `txindex` must be active |
| **Mounted volumes** | `main` volume mounted read-only at `/mnt/node` for credential discovery |
| **Purpose** | C++ BCH full node providing JSON-RPC for Fulcrum to index |

### Bitcoin Cash Daemon — BCHD (optional)

| Field | Value |
|---|---|
| **Package ID** | `bchd` |
| **Version constraint** | Any |
| **Required state** | Running and fully synced |
| **Mounted volumes** | `main` volume mounted read-only at `/mnt/node` for credential discovery |
| **Purpose** | Go BCH full node alternative; Fulcrum automatically enables `bitcoind-tls` mode when BCHD is selected |

### Flowee the Hub (optional)

| Field | Value |
|---|---|
| **Package ID** | `flowee` |
| **Version constraint** | Any |
| **Required state** | Running and fully synced |
| **Mounted volumes** | `main` volume mounted read-only at `/mnt/node` for credential discovery |
| **Purpose** | Fast C++ BCH validator; SPV-level validation only — follow the canonical chain but does not fully re-validate every transaction |

**At least one of the above three node dependencies must be installed and selected.**

---

## 11. Default Overrides

| Setting | Upstream Default | StartOS Value | Reason |
|---|---|---|---|
| `bitcoind-tls` | Off | Enabled automatically when BCHD is selected | BCHD serves RPC over native TLS; Fulcrum must use HTTPS for the bitcoind connection |
| `bitcoind_timeout` | 30 s | 30 s (configurable) | Default is adequate; exposed to UI for users with slow nodes during initial sync |
| `worker_threads` | Auto | 0 (auto) | Lets Fulcrum use all available CPU cores for indexing |
| `db_mem` | 4096 MB upstream | 2048 MB default | Conservative default for StartOS hardware; user-adjustable |

---

## 12. Limitations and Differences

1. Fulcrum will **not start until the selected BCH node is fully synced**. The health check reports loading until port 50001 opens.
2. Only **TCP (plaintext) Electrum** is exposed on port 50001. The upstream Fulcrum supports SSL/TLS Electrum (port 50002) and an admin port (8000), but these are not configured or exposed in this StartOS package.
3. The node backend must be changed via the **Select Node Backend action** — not by editing `fulcrum.conf` directly. The config file is overwritten on each start.
4. RPC credentials are read **from the dependency volume** inside the SubContainer. They are not stored in Fulcrum's own `store.json`; they are always fetched fresh from the selected node.
5. Re-indexing is triggered automatically when the selected node changes. This can take several hours.
6. Knuth is listed as a selectable node backend but Knuth currently has no RPC. Selecting Knuth will cause Fulcrum to fail to connect until Knuth RPC support is added in a future release.

---

## 13. What Is Unchanged from Upstream

- All upstream Fulcrum Electrum protocol behavior (methods, notifications, subscription handling)
- RocksDB index format and storage layout
- `fulcrum.conf` configuration file format and all supported keys
- Performance characteristics: single-pass indexing, O(1) address lookup

---

## 14. Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 15. Quick Reference for AI Consumers

```yaml
package_id: fulcrum-bch
title: Fulcrum
license: MIT
upstream_repo: https://github.com/cculianu/Fulcrum
package_repo: https://github.com/BitcoinCash1/fulcrum-bch-startos
image:
  id: main
  source: cculianu/fulcrum:v2.1.1 (Docker Hub)
architectures:
  - x86_64
  - aarch64
volumes:
  - name: main
    mountpoint: /data
    purpose: Fulcrum config, Electrum index database, state
ports:
  - interface: electrum
    port: 50001
    protocol: tcp
    purpose: Electrum protocol for BCH wallets and BCH Explorer
    condition: always
dependencies:
  bitcoincashd:
    optional: true
    purpose: BCHN full node — JSON-RPC source for indexing
  bchd:
    optional: true
    purpose: BCHD full node — alternative JSON-RPC source; TLS mode auto-enabled
  flowee:
    optional: true
    purpose: Flowee the Hub — fast BCH validator; alternative JSON-RPC source
startos_managed_files:
  - /data/fulcrum.conf
  - /data/store.json
  - /data/banner.txt
actions:
  - { id: select-node, name: "Select Node Backend", group: Configuration }
  - { id: configure, name: "Configure", group: Configuration }
health_checks:
  - { id: primary, display: "Electrum", method: "port 50001 listen check" }
  - { id: sync-progress, display: "Sync Progress", method: "port 50001 listen check + stdout log" }
backup_volumes:
  - main
backup_excludes:
  - /fulc2_db
  - /fulc2_db.mainnet
  - /latch
```
