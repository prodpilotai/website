---
title: Provider interface
description: The four methods ProdPush is built against, why Render sits behind them, and how the claim that a second provider needs no rewrite was tested.
---

Render is the only deployment target in version 1. ProdPush is still built against a small provider interface rather than against Render directly, so a second target would be a new implementation, not a rewrite of stages 4 to 8.

## The four methods

```python
class Provider(Protocol):
    def deploy(self, service: Service) -> Deployment:
        """Create the service and start its first deploy."""

    def poll_status(self, deploy_id: str) -> Status:
        """Ask where one deploy has got to."""

    def get_logs(self, deploy_id: str) -> str:
        """Fetch the build logs for one deploy, for classifying a failure."""

    def set_env(self, service_id: str, env: Mapping[str, str]) -> None:
        """Replace the environment variables on an existing service."""
```

## The records

| Record | Fields |
| --- | --- |
| `Service` | `name`, `repo`, `branch`, `build`, `start`, `env`, `publish` |
| `Deployment` | `service_id`, `deploy_id`, `url` |
| `Status` | `building`, `live`, `failed` |

`env` carries the sealed values, which travel through the provider's API and are never committed.

## Why a Protocol

Every other seam in the codebase is structural, and nothing inherits from a base class. A Protocol keeps that: an implementation conforms by having the right methods. It is runtime checkable, but that only confirms the methods exist, so the tests check their signatures separately.

## How it was tested

The claim was tested with running code rather than on paper. The test suite adds a second provider, `Local`, that shares nothing with Render: no HTTP, no API key, a different identifier format and a different internal model. Every stage from 4 to 8 then runs against it with its own real code and no edits, only a different object passed in.

This shows the stages need no rewrite for a second provider. It does not add one: `Local` exists only in the tests, and Render is the only target you can deploy to.
