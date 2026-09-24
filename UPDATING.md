# Updating the upstream version

Fulcrum is shipped as a prebuilt Docker image; the upstream project and the published image share the same version tag.

## Determining the upstream version

[cculianu/Fulcrum](https://github.com/cculianu/Fulcrum) — latest GitHub release:

```sh
gh release view -R cculianu/Fulcrum --json tagName -q .tagName
```

Cross-check against the [`cculianu/fulcrum`](https://hub.docker.com/r/cculianu/fulcrum/tags) Docker Hub tags (the image must be published before the bump can land):

```sh
curl -fsSL "https://hub.docker.com/v2/repositories/cculianu/fulcrum/tags?page_size=20&ordering=last_updated" | jq -r '.results[].name'
```

The pinned tag lives in `startos/manifest/index.ts` at `images.main.source.dockerTag`.

## Applying the bump

1. In `startos/manifest/index.ts`, set `images.main.source.dockerTag` to `cculianu/fulcrum:v<new version>`.
2. In `startos/versions/current.ts`, set `version` to `<new version>:0` and rewrite `releaseNotes` for all five locales.

## What to re-check on a bump

- **`fulcrum.conf` keys.** The package writes `datadir`, `bitcoind`, `rpcuser`, `rpcpassword`, `tcp`, `peering`, `announce` and `banner`, and merges the user's tuning keys. If upstream renames or retires one, `startos/fileModels/fulcrum.conf.ts` has to follow, and a retired key needs a `z.undefined()` entry to be cleaned off existing installs.
- **The sync-progress log prefix.** `main.ts` scrapes Fulcrum's `<Controller>` stdout lines for the health check message. A change to that prefix silently leaves the check reporting "Unknown status".
- **The node requirements.** Upstream's README states Fulcrum needs an unpruned node with `txindex` enabled. `startos/dependencies.ts` raises the autoconfig tasks that satisfy exactly that; if upstream's requirements change, those tasks and the README's "What Is Unchanged" section change with them.
