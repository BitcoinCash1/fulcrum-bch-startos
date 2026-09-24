<p align="center">
  <img src="icon.png" alt="Fulcrum BCH Logo" width="21%">
</p>

# Fulcrum BCH on StartOS

> Everything not listed in this document should behave the same as upstream
> Fulcrum. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Fulcrum](https://github.com/cculianu/Fulcrum) is an Electrum server: it indexes a Bitcoin Cash node so wallets can query their history directly. This package lets you point it at any of the three Bitcoin Cash nodes packaged for StartOS, works out that node's chain and credentials for itself, and keeps a separate index per chain.

- **Upstream repo:** <https://github.com/cculianu/Fulcrum>
- **Wrapper repo:** <https://github.com/Start9-Community/fulcrum-bch-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Upstream Updates](#upstream-updates)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One upstream image, consumed unmodified.

| Property      | Value              |
| ------------- | ------------------ |
| Image         | `cculianu/fulcrum` |
| Architectures | x86_64, aarch64    |

| Subcontainer  | Purpose                                  |
| ------------- | ---------------------------------------- |
| `primary-sub` | The only daemon — the one to `attach` to |

## Volume and Data Layout

One volume, plus a read-only view of the selected node's.

| Volume                 | Mount Point | Purpose                                    |
| ---------------------- | ----------- | ------------------------------------------ |
| `main`                 | `/data`     | One index per chain, the config, the store |
| The node's `main` (ro) | `/mnt/node` | The node's own settings and credentials    |

**Each chain gets its own directory** under the volume. A Fulcrum database belongs to exactly one chain and it refuses to open one built for another, so switching chains never discards an index — the previous one is still there when you switch back.

**Fulcrum never reads the chain off disk.** The node mount exists so the package can read the node's own state file: which chain it is on, and — on three of the four nodes — the RPC credentials to dial it with. Everything else comes over RPC.

The index is tens of gigabytes on mainnet, and is excluded from backups — see [Backups and Restore](#backups-and-restore).

## File Models

Three models. The config's fields split between pinned and tunable, and the store holds the one credential the package has to mint itself.

| File           | Format | Modelled                  | Written by                    |
| -------------- | ------ | ------------------------- | ----------------------------- |
| `fulcrum.conf` | INI    | Yes — `FileHelper.ini`    | Init, `main`, and the actions |
| `banner.txt`   | text   | Yes — `FileHelper.string` | The Configure action          |
| `store.json`   | JSON   | Yes — `FileHelper.json`   | Init and the actions          |

**Pinned in the config:** the Electrum bind address, the banner path, and peering and announcement — both off, because a server behind StartOS's networking should not be advertising itself to the Electrum peer network. TLS is pinned _off_ toward the node, since the package dials plaintext bindings on purpose.

**Written by the package:** the data directory (which chain), the node address, and the RPC credentials.

**User-tunable:** the RPC timeout and client count, worker threads, database memory, and open-file limit.

**The node address is omitted rather than defaulted when the node is absent.** Fulcrum then has no node line at all instead of one pointing somewhere that cannot answer, and the reactive read heals it in when the node appears.

`store.json` holds the selected node, whether that selection has been confirmed, a notification flag, and **a Flowee credential**. That last one is there because of an asymmetry between the nodes: BCHN and BCHD publish their own credentials in their state files, which the package reads off the mount, while **Flowee authenticates against hashed entries and cannot hand a password back** — so the package mints one here and registers it on Flowee instead.

## Dependencies

Four are declared, and **exactly one is required at a time** — whichever node you selected.

| Node                | Health check required | Why that check                                                                                                                 |
| ------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Bitcoin Cash Node   | `primary`             | Its RPC                                                                                                                        |
| Bitcoin Cash Daemon | `rpc-plaintext`       | It serves RPC over its own self-signed TLS, so the package dials its plaintext proxy instead — that proxy is what has to be up |
| Flowee the Hub      | `primary`             | Its RPC                                                                                                                        |
| Knuth               | `primary`             | Its RPC                                                                                                                        |

**None of them gate on the node's sync progress, deliberately.** Fulcrum indexes to whatever height the node has reached and follows it from there, so requiring a fully-synced node would keep this service unstartable — and its own progress unreadable — for the days a fresh chain takes.

**Each node needs to be unpruned with a full transaction index**, and the package raises a recurring task on that node's own page to arrange it. On BCHN it also turns ZeroMQ on, which is upstream's recommendation rather than a requirement — so it is applied when the task runs but does not by itself keep the task raised. On Knuth the task turns JSON-RPC on and sets the full database mode instead, since Knuth serves RPC only when enabled and keeps transaction data only in that mode.

**Flowee is handled differently.** Its task registers a credential rather than changing a setting, and since Flowee keeps only a hash and reports no current input, a recurring "does this match" task would reappear on every init however many times the user had answered it. So that one is raised by the selection action instead.

Tasks belonging to nodes you are _not_ on are cleared, so nothing sits in the list against a node Fulcrum no longer talks to.

## Network Access and Interfaces

One interface, and it is plaintext on purpose.

| Interface | Id         | Type | Port  | Description                                         |
| --------- | ---------- | ---- | ----- | --------------------------------------------------- |
| Electrum  | `electrum` | api  | 50001 | The Electrum protocol, for wallets and BCH Explorer |

**No TLS address is published alongside it**, unlike the Bitcoin Fulcrum package. BCH Explorer reads this binding's bridge address without asking for a scheme, so publishing both would leave which of the two it dials undefined. One address means one answer.

## Installation and First-Run Flow

Install raises one critical task: choose the node. There is no default that would be right — the three nodes differ in how they authenticate, which chains they run, and what has to be configured on them.

Once selected, the sequence is:

1. The package reads the node's state file to learn **which chain it is on**, and picks the matching index directory.
2. It resolves the node's RPC address over the internal bridge, and gets credentials — from the node's own state file on BCHN and BCHD, or from the credential it registered on Flowee.
3. Fulcrum starts indexing, which **takes hours to days on mainnet** and is the long part.

**The chain is followed, not chosen here.** Switching the node's chain moves Fulcrum with it, onto that chain's own index directory.

A notification is sent when the index first completes.

## Actions

Three actions.

### Select Node Backend

Chooses which Bitcoin Cash node Fulcrum indexes from. Run it when its task appears, and again to switch nodes.

- **What it changes:** the selection in the store — and with it the declared dependency, the mounted volume, the RPC address, the credentials, and which node carries the configuration task.
- **Cost:** the service restarts and reconnects.
- **Repeat safety:** idempotent.
- **On Flowee it also registers a credential** on that node, which is why its task comes from here rather than from the dependency setup.
- **Switching nodes does not discard the index** if the new node is on the same chain — the index belongs to the chain, not the node.

### Configure — Configuration group

Sets the server banner and Fulcrum's performance tunables.

- **What it changes:** `banner.txt` and the tunable keys in `fulcrum.conf`.
- **Cost:** applies on restart.
- **Repeat safety:** idempotent.
- **The database memory setting is the one that matters** on constrained hardware; the rest rarely need changing.

### Delete Chain Index — Maintenance group

Deletes the index for a chosen chain.

- **When to run it:** **only while stopped.**
- **What it changes:** removes that chain's directory from the volume.
- **Cost:** **the index has to be rebuilt from scratch** — hours to days on mainnet.
- **Repeat safety:** idempotent, but destructive. Use it to reclaim space from a chain you no longer follow, or to recover from a corrupted index.

## Tasks

Two, and the second appears on **another service's** page.

| Task                     | Severity   | Raised when                              | Cleared when              |
| ------------------------ | ---------- | ---------------------------------------- | ------------------------- |
| Select Node Backend      | `critical` | At install                               | The action runs           |
| The node's configuration | `critical` | The selected node is pruned or unindexed | That node is reconfigured |

The second is recurring on BCHN, BCHD and Knuth, so turning the setting back off brings it back. On Flowee it is raised once by the selection action, for the reason given under [Dependencies](#dependencies).

`critical` blocks the service it belongs to from starting and suspends the ordinary controls.

## Health Checks

Two checks.

| Check           | Displayed as    | Method                          |
| --------------- | --------------- | ------------------------------- |
| `primary`       | "Electrum"      | The Electrum port is listening  |
| `sync-progress` | "Sync Progress" | Fulcrum's own indexing progress |

**"Electrum" goes green long before the server is useful.** Fulcrum binds its port early and indexes afterwards, so a wallet connecting during the initial index gets a server that answers and has no history for it. "Sync Progress" is the one to read.

## Backups and Restore

The `main` volume is copied **except every chain's index directory**.

So the backup is the configuration, the banner, and the node selection — kilobytes rather than the tens of gigabytes an index occupies. The index is derived entirely from the node and is rebuilt on restore.

**A restored instance re-indexes from scratch**, taking the same hours to days a fresh install does, and nothing depending on it works until that finishes. That is the deliberate trade; backing up a live index would be both enormous and unsafe to restore.

The Flowee credential is in the backup, so a restored install still authenticates against a Flowee that was registered before.

## Limitations and Differences

1. **The index is not backed up.** A restore means re-indexing.
2. **The node must be unpruned with a full transaction index**, enforced by a recurring task on the node.
3. **No TLS on the Electrum interface**, deliberately, so dependents have exactly one address to dial.
4. **Peering and announcement are off.** This server does not join the Electrum peer network.
5. **The chain follows the node.** It is not selectable here.
6. **Only the four packaged Bitcoin Cash nodes are supported**; an external node cannot be used.
7. **BCHD is reached through its plaintext proxy**, not its native TLS RPC, so its self-signed certificate never has to be trusted here.

---

## Upstream Updates

`check-upstream.yml` looks for a new Fulcrum release daily. When one appears, `scripts/auto-bump.sh` sets `startos/versions/current.ts` to `<upstream>:0`, resets `ALLOW_DOWNGRADE` to `false`, updates the image tag in the manifest, and opens a pull request from `auto-bump/<tag>`. Nothing reaches `master` until that PR is reviewed and merged; merging it is what releases the new version. Package-only fixes bump the revision after the colon by hand in their own PR.

## Quick Reference for AI Consumers

```yaml
package_id: fulcrum-bch
image: cculianu/fulcrum
architectures:
  - x86_64
  - aarch64
subcontainers:
  - primary-sub
volumes:
  main: /data # one index directory per chain; the node's volume is mounted read-only at /mnt/node
file_models:
  - fulcrum.conf
  - banner.txt
  - store.json
startos_managed_env_vars: [] # configuration is written into fulcrum.conf
dependencies: # exactly one is required, whichever is selected
  - bitcoincashd # health check: primary
  - bchd # health check: rpc-plaintext, not the native TLS RPC
  - flowee # health check: primary
  - knuth-bch # health check: primary
interfaces:
  electrum: { type: api, port: 50001 } # plaintext only, no TLS leg
actions:
  - select-node
  - configure
  - delete-network-index # only-stopped
tasks:
  - { action: select-node, severity: critical } # install only
  - { action: '<node>:autoconfig', severity: critical } # on the node's page, recurring
health_checks:
  - primary # displayed "Electrum"; binds before indexing
  - sync-progress # displayed "Sync Progress"; the one that matters
```
