# Updating the upstream version

This package wraps the **Fulcrum** Docker image published by `cculianu` on Docker Hub.
Upstream releases live at [github.com/cculianu/Fulcrum](https://github.com/cculianu/Fulcrum/releases).

## Determining the upstream version

Check the latest tag on the [releases page](https://github.com/cculianu/Fulcrum/releases) and confirm the matching image tag exists on [Docker Hub](https://hub.docker.com/r/cculianu/fulcrum/tags).

The current pin lives in `startos/manifest/index.ts` at `images['fulcrum'].source.dockerTag`
(e.g. `cculianu/fulcrum:v2.1.1`).

## Applying the bump

1. Bump `dockerTag` in `startos/manifest/index.ts` to `cculianu/fulcrum:v<new version>`.
2. Add a new `startos/versions/v<X>.<Y>.<Z>.0.ts` file and update `startos/versions/index.ts` to set it as `current`.
3. Update version references in `README.md` and `instructions.md`.
