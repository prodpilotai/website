---
title: 3. Docker build test
description: Stage 3 builds your project with Docker on your machine, runs it the way Render would, and probes /health before anything leaves your machine.
---

Stage 3 builds the project's image with your local Docker daemon, runs the container, and asks it for `/health` on localhost. Nothing leaves your machine at this stage. A project with no Dockerfile is recorded as not applicable, though the audit normally requires one.

## Run the way Render runs it

The container is given a `PORT`: the project's own sealed `PORT` first, else the port its image exposes, else Render's default of 10000, which is then published so the probe can reach it. Every published port is tried until one answers, for up to 30 seconds. All three details come from faults the full-chain run found in an earlier version of this stage. See the [pipeline record](https://github.com/prodpilotai/ProdPilot/blob/main/docs/pipeline.md#defects-the-run-found-and-how-each-was-closed).

Your sealed values go to the container when it runs, never as build arguments, because a build argument is recorded in the image history.

## A fixed taxonomy

A failed build is classified into one of five categories, and only a classified failure is handed back to the fix loop:

| Fault | Matched when |
| --- | --- |
| `missing dependency` | A `RUN` step running an install command, such as `npm install`, `npm ci` or `apk add`, failed |
| `bad base image` | The base image cannot be resolved or pulled: no such repository, access denied, or no manifest |
| `port mismatch` | The container says it listens on a port other than the one it exposes, or publishes no port |
| `missing file` | A `COPY` or `ADD` names a file that is not in the build context |
| `build script failure` | Any other `RUN` step failed |

Both of Docker's builders are covered: the legacy builder and BuildKit word the same failure differently, and the patterns were written from real failing builds on both. Anything unmatched goes to manual review, with the first line of the build output that explains it. The raw log is capped and kept for a person to read; it never enters the loop as text.

A daemon running Windows containers is reported as such, since every image ProdPilot builds is Linux: switch Docker Desktop to Linux containers.

## Real output

The demo project, built and probed:

```json
{
  "project": "build-ok",
  "ok": true,
  "image": "prodpilot-buildtest",
  "fault": null,
  "detail": "the container answered",
  "health": { "ok": true, "url": "http://127.0.0.1:32770/health", "status": 200,
              "detail": "the container answered" }
}
```

The `node_express_hardened` sample with the same Dockerfile. The image builds, so `ok` is true, but the application requires a module the sample does not contain, and the container stops on start:

```json
{
  "project": "orders-api",
  "ok": true,
  "image": "prodpilot-buildtest",
  "fault": null,
  "detail": "the container exited on start with code 1: Error: Cannot find module '../controllers/orderController'",
  "health": { "ok": false, "url": "", "status": null,
              "detail": "the container exited on start with code 1: Error: Cannot find module '../controllers/orderController'" }
}
```

The stage passes only when the image builds and the container answers. This sample scored 100 at the gate, since no audit rule checks for a `require` of a missing file; this stage is what catches it. See [Known limitations](/docs/help/limitations/).
