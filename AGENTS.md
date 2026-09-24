# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **This is the Bitcoin Cash Fulcrum, distinct from `fulcrum`, the Bitcoin one.** Don't copy changes between them without checking; their node backends and interface shapes differ.
- **Dependencies are reached over the LXC bridge, never `.startos` DNS.** `startos/utils.ts` resolves each node's RPC with `sdk.host.getBridgeAddress(...).const()`. BCHN's RPC port moves per chain, so that `.const()` is also its chain-change signal; BCHD and Flowee pin one port for every chain, so the `sync-progress` health check re-reads the node's `store.json` and restarts on drift. **BCHD must be dialed through its plaintext proxy** (`rpc-plaintext`, 8334) so no self-signed certificate has to be trusted — dialing its native TLS RPC also meant carrying a per-chain port table, which was wrong on testnet4.
- **Knuth is wired like BCHN.** `knuth-bch-startos/startos/utils` exports `networkPorts` and `rpcInterfaceId` (`'rpc'`), and its RPC port moves per chain. Fulcrum treats it as a normal node: it requires `primary` and uses only Knuth's public exports and autoconfig inputs (JSON-RPC on, full database mode), never its internal daemons.
- **BCHN does not export its host ids.** `bitcoin-cash-node-startos/startos/utils` exports `networkPorts` and the _interface_ ids but no `rpcHostId`, so the host id `'rpc'` is a literal in `startos/utils.ts`. Exporting it upstream would remove the literal.
- **The chain follows the node and drives `datadir`.** `main` reads the chain off the node's read-only `/mnt/node` mount and points Fulcrum at `/data/<chain>`. A Fulcrum database refuses to open on a chain it was not built for, so these directories must never be merged. `NETWORKS` in `startos/utils.ts` is the single source for them — the backup excludes and the Delete Chain Index picker both derive from it, so adding a chain means adding it there.
- **`fulcrum.conf` performance keys are deliberately optional.** Unset keys are omitted from the file so Fulcrum applies its own defaults; do not reintroduce `.catch(<number>)` defaults, which hard-code upstream's values into this package and go stale.

## Repository conventions

This repo is the original the Start9-Community copy is imported from. Keep it a
near-replica of that copy: every difference must be one of those listed below.

- **Syncing with Start9-Community:** `git merge` their `master` into ours, never
  rebase or force-push. Take their side for packaging, layout, docs and CI;
  keep only the deliberate differences below.
- **Branches:** `master` is released — every push to it runs Tag and Release.
  Work happens on short-lived branches and reaches `master` through a PR.
  `next` is kept on purpose: Start9's Sync Next workflow mirrors `master` into
  it, so do not delete it.
- **Versions:** `<upstream>:<revision>` in the single `startos/versions/current.ts`.
  Never change the upstream part by hand; a new upstream starts at `:0` (the
  auto-bump PR does this). Bump the revision once per shipped package change —
  not for docs, CI or archive changes. `ALLOW_DOWNGRADE` stays `false` unless a
  release is known to be reversible.
- **`assets/` vs `archive/`:** `assets/` is packed into the s9pk as a whole, so
  it holds only `.gitkeep` unless the service reads a file at runtime.
  `archive/` holds reference material (`ABOUT.md`, logos, picture variants) and
  is not packed. Never delete anything in `archive/`.
- **What StartOS shows:** name from `title` in `startos/manifest/index.ts`,
  description and About text from `short`/`long` in `startos/manifest/i18n.ts`,
  Instructions tab from `instructions.md` (required), logo from `icon.png`.
- **Commit and PR hygiene:** no session links, `Co-Authored-By` trailers or
  "Generated with" footers in commit messages, PR descriptions or comments.
  The Session Link Guard workflow fails any PR or push that carries one.
  Commits are authored by the maintainer.
- **Deliberate differences from Start9-Community:** Knuth (`knuth-bch`) as a fourth node backend; `ALLOW_DOWNGRADE` in `current.ts`; `sdk.ts` and `i18n/index.ts` synced to the hello-world template; `check-upstream.yml` + `scripts/auto-bump.sh` (daily upstream check, opens a bump PR); `dependabot.yml`; `session-link-guard.yml`; `archive/`; the matching README/instructions notes.
