---
title: Changelog
description: What changed in each ProdPilot release, from the first release candidate to 1.1.0.
---

The source is [CHANGELOG.md](https://github.com/prodpilotai/ProdPilot/blob/main/CHANGELOG.md). Releases are on [PyPI](https://pypi.org/project/prodpilot/) and [GitHub](https://github.com/prodpilotai/ProdPilot/releases).

## 1.1.0, 10 October 2026

A hardening release. The ruleset, scoring, model and gate are unchanged from 1.0.0.

### Added

- `prodpilot audit` for CI, with `--ci`, `--min-score`, `--fail-on` and `--baseline`, and exit codes 0, 1 and 2.
- `prodpilot report --format sarif|md|html`, with SARIF for GitHub code scanning.
- The GitHub Action `prodpilotai/ProdPilot@v1`.
- `prodpilot fix --dry-run`, and an optional `dry_run` on `prodpilot_fix_instruction`.
- `prodpilot deploy [--no-rollback]`, and an optional `rollback` on `prodpilot_deploy`.
- Rollback of a redeploy that fails its smoke test.
- An end-of-life notice for the declared Node version.
- `prodpilot --version`.

### Changed

- Rollback is on by default.
- A project already deployed is redeployed to its service instead of getting a second one.
- Generated Dockerfiles and workflows use the declared Node LTS line, Node 24 by default, instead of Node 20.

### Fixed

- A second deploy stopped at the push stage when the only untracked file was `.env.prodpilot`.
- The package reported its version as `1.0.0rc1`.

## 1.0.0, 20 September 2026

The first stable release.

### Fixed

- A Docker daemon in Windows container mode was reported as available, and every build then failed with "no matching manifest for windows/amd64". ProdPilot now says the daemon runs Windows containers and that its images are Linux.
- On Windows, the credential file was reported as readable by other accounts when the only entries left were SYSTEM, the Administrators group and OWNER RIGHTS. The first two can read every file on the machine regardless, so they are now expected and named in the report. OWNER RIGHTS is not an account, so it is not counted. Any other account on the file is still a fault.

### Added

- A written statement of what 1.x keeps stable: the five tool names and their fields, rule identifiers, commands and flags, the credential location, and the gate's three conditions.
- The test workflow runs on Windows as well as Linux and macOS.
- The packaged wheel is installed outside the repository on all three systems and the shipped model loaded there.
- Files published to PyPI carry attestations, so anyone can check they were built by the repository's release workflow.

### Known issue

The server reports its version as `1.0.0rc1` in its ping response and handshake: the version string inside the package was not raised. The package is 1.0.0.

## 1.0.0rc2, 20 September 2026

A packaging and documentation release. The code is the same as 1.0.0rc1.

- The PyPI description no longer says the release is not on PyPI yet.
- The install table names pip beside pipx and uv.
- Tagging a version now publishes it and creates the GitHub release with its notes and files.

## 1.0.0rc1, 20 September 2026

The first release candidate.

### Added

- The MCP server with five tools: stack detection with production blueprints, fix instructions and independent verification for fifty rules, and ProdPush, which takes a project that passes the scoring gate to a live, smoke tested Render service with an active CI/CD pipeline.
- `prodpilot connect vscode|cursor|devin`.
- `prodpilot doctor` checks git, Node.js and the Docker daemon.
- Tool annotations: four tools are marked read only, and the deploy tool as changing its environment.
- A license, a security policy, third-party notices, a test workflow and a release workflow.

### Changed

- The gate's model ships inside the package; scikit-learn is pinned to 1.9.0, the version that saved it.
- Runs on Python 3.11 to 3.14.
- The generated CI/CD workflow waits for the deploy it started before checking the service.
- Content fixes declare the environment keys they read, so a CORS fix no longer breaks the environment template.

### Fixed

- A failed Docker build kept none of its output; its summary now names the cause.
