---
title: Use in CI
description: Check production readiness on every push and pull request, with the GitHub Action or prodpilot audit.
---

New in 1.1.0. ProdPilot can check a project on every push and pull request, with its GitHub Action or with [`prodpilot audit`](/docs/reference/cli/#prodpilot-audit) in any CI system. Both only read the project: nothing is fixed, built for deployment or deployed.

## The GitHub Action

```yaml
name: Production readiness

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  security-events: write

jobs:
  prodpilot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0
      - uses: prodpilotai/ProdPilot@v1
        with:
          fail-on: p0
          min-score: "70"
```

The action installs ProdPilot pinned exactly, uploads the findings to code scanning, writes a report to the job summary and fails the job when the project is not ready. On a pull request it also fails when a rule that passed on the base branch now fails, which is why the checkout fetches the full history. It needs no secret. Where code scanning is not available, the upload is skipped with a notice and the job is still decided by the check.

`@v1` follows the latest 1.x release. To pin one release, use `@v1.1.0`.

| Input | Default | What it does |
| --- | --- | --- |
| `version` | the release the action belongs to | The ProdPilot version installed from PyPI, pinned exactly |
| `path` | `.` | The project to audit, relative to the repository root |
| `min-score` | none | Fail when the score is below this number |
| `fail-on` | `p0` | Fail when a rule at this priority or above fails: `p0`, `p1` or `none` |
| `baseline` | the pull request's base commit | Also fail when the project regressed against this ref |
| `sarif` | `true` | Upload the findings to GitHub code scanning |

The action has one output, `exit-code`: 0 passed, 1 not ready, 2 a tool or usage error.

## Any other CI system

```bash
pip install prodpilot==1.1.0
prodpilot audit --ci --fail-on p0 --min-score 70 .
```

The exit code decides the job, and `--ci` prints a JSON summary. [`prodpilot report`](/docs/reference/cli/#prodpilot-report) writes the same findings as SARIF, Markdown or HTML for whatever your system displays.

## Verified

Before 1.1.0 was released, the action ran on Linux, macOS and Windows against a ready sample, which passed, and a broken one, which failed. After release, the published `prodpilotai/ProdPilot@v1.1.0` did the same on all three systems, installing ProdPilot from PyPI.
