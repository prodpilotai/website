---
title: 1. Pre-flight checks
description: The first ProdPush stage checks for a Git repository, a GitHub origin and both stored credentials, and reports all four checks at once.
---

`prodpilot_deploy` runs the [scoring gate](/docs/concepts/scoring-gate/) first and then eight stages, in order. It stops at the first stage that fails, reports why in that stage's own words, and records every later stage as not reached, so you can see exactly how far the project got.

Pre-flight is stage 1. It checks and changes nothing.

## The four checks

| Check | Passes when |
| --- | --- |
| `repo` | The project is a Git repository |
| `origin` | The `origin` remote is on github.com, in HTTPS or SSH form |
| `render_key` | A Render API key is stored |
| `github_token` | A GitHub token is stored |

The credentials are read from `~/.prodpilot/config.toml` through the same function every other part of ProdPilot uses. Pre-flight only asks whether each one is present; it never reads a value. A missing credential is not collected here: the fix names `prodpilot setup`, so there is only one place a secret is ever typed in.

## Why all four every time

The checks are independent, and each reports what it found and what to do about it. A project that is not a Git repository still gets its credential checks, so you can fix everything in one pass rather than one round trip per problem.

## Real output

A copy of the demo project with no Git repository yet:

```json
{
  "project": "payments-api",
  "ready": false,
  "checks": [
    { "name": "repo", "ok": false,
      "detail": "the project is not a Git repository",
      "fix": "run git init and commit the project before deploying" },
    { "name": "origin", "ok": false,
      "detail": "there is no repository to read a remote from",
      "fix": "run git init and add a GitHub remote named origin" },
    { "name": "render_key", "ok": true, "detail": "a Render API key is stored", "fix": "" },
    { "name": "github_token", "ok": true, "detail": "a GitHub token is stored", "fix": "" }
  ],
  "failed": ["repo", "origin"]
}
```

After `git init` and adding a GitHub `origin`, every check passes, with the detail `the origin remote is on github.com`.

Next: [Environment sealing](/docs/prodpush/sealing/).
