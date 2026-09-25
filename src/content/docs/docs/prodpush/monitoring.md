---
title: 6. Deploy monitoring
description: Stage 6 polls the deploy every 15 seconds for up to 10 minutes, and tells a failed build apart from a timeout.
---

Stage 6 polls the deploy stage 5 started until it is live, has failed, or 10 minutes have passed.

| Setting | Value |
| --- | --- |
| Poll interval | 15 seconds |
| Limit | 10 minutes |

## Eleven Render states, three outcomes

Render reports eleven deploy states. All eleven map onto the three the [provider interface](/docs/prodpush/provider/) knows, so no state falls through as unknown:

| Render state | Read as |
| --- | --- |
| `created`, `queued`, `build_in_progress`, `update_in_progress`, `pre_deploy_in_progress` | building, keep polling |
| `live` | live, go on to the smoke test |
| `build_failed`, `update_failed`, `pre_deploy_failed`, `canceled`, `deactivated` | failed, fetch the logs |

## A timeout is not a failure

A failed deploy means the build finished and did not work, and the logs say why. A timeout means nothing is known: the deploy may still be running and may yet succeed. They call for different things from you, so they are different outcomes, `failed` and `timeout`, and a caller can tell them apart without reading a sentence.

## Failures use the local taxonomy

A build that fails on Render fails for the same reasons it fails on your machine. The logs are classified with the [Docker build test's](/docs/prodpush/docker-build/#a-fixed-taxonomy) five categories, imported rather than restated. Logs that cannot be fetched leave the failure unclassified, which sends it to a person rather than inventing a category.

## Built against the interface

This stage works with anything offering `poll_status` and `get_logs`, not with Render directly, so a second provider needs no change here. The 15 seconds and 10 minutes are real in production and injected in tests, so the suite does not wait them out.
