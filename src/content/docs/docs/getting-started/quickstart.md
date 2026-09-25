---
title: Quickstart
description: From install to a first audit in your editor, with the real output of each command.
---

This takes you from an installed ProdPilot to your editor's agent auditing and fixing a project. It assumes you have [installed it](/docs/getting-started/installation/).

## 1. Store your credentials

```sh
prodpilot setup
```

It asks for the GitHub token and the Render API key, writes them to `~/.prodpilot/config.toml`, restricts the file to your account and checks that it did. Nothing you type is printed back. Real output:

```text
ProdPilot credential setup
Credentials are stored in E:\tmp\dev\.prodpilot\config.toml
They are never written into a project directory.

GitHub token: Render API key:
Saved to E:\tmp\dev\.prodpilot\config.toml
Permissions: access is limited to the current user
```

This capture set `PRODPILOT_CONFIG_HOME` to a scratch folder so no real credentials were involved; normally the path is `~/.prodpilot/config.toml`. Run it again at any time, and press enter to keep a stored value.

You only need the credentials to deploy. Auditing and fixing work without them.

## 2. Check everything is in place

```sh
prodpilot doctor
```

Real output on the machine this site was built on:

```text
ProdPilot doctor

Config file: E:\tmp\dev\.prodpilot\config.toml
  found
  github_token: stored
  render_api_key: stored
  permissions: access is limited to the current user

Tools ProdPilot runs:
  git: git version 2.54.0.windows.1
  Node.js: v26.3.0
  Docker: daemon 29.7.2

All checks passed.
```

Doctor never prints a credential, only whether it is stored. If anything is missing it names it and exits non-zero, so a script can see the failure.

## 3. Connect your editor

```sh
prodpilot connect vscode
prodpilot connect cursor
prodpilot connect devin --project PATH
```

Each writes the editor's own configuration in the place that editor documents, naming the `prodpilot` command on this machine by its absolute path. VS Code and Cursor are connected once for every project; Windsurf, now Devin, once per project. Each editor has its own page: [VS Code](/docs/getting-started/vscode/), [Cursor](/docs/getting-started/cursor/), [Windsurf (now Devin)](/docs/getting-started/windsurf/).

## 4. Audit and fix

Open your project and ask the agent:

> Use ProdPilot to audit this project and fix what it reports, one rule at a time, reporting each fix with prodpilot_fix_applied.

The agent calls `prodpilot_detect_stack`, then asks `prodpilot_fix_instruction` for each failing rule, applies what it says and reports back with `prodpilot_fix_applied`. ProdPilot answers `resolved`, `unresolved` or `blocked` from the rule's own checker, whatever the agent claimed. The [MCP tools reference](/docs/reference/mcp-tools/) shows real responses from each tool.

On one of the deliberately broken sample projects in the ProdPilot repository, `node_express_insecure`, the first audit scores 13 out of 100 with 6 critical failures, and after the fix loop it scores 96 with none. That run is [recorded in full](/docs/results/metrics/#one-run-in-detail).

## 5. Deploy

Commit your own changes first, then ask:

> Deploy this project with prodpilot_deploy.

The deploy creates a real Render service on the free plan and pushes to your GitHub repository, so the tool tells the agent to confirm with you before calling it. It runs the scoring gate and then the eight [ProdPush stages](/docs/prodpush/preflight/), and stops at the first that fails, saying which and why. On success you get a live URL and a GitHub Actions workflow that redeploys on every push.

:::caution
Whether your editor asks you before a tool runs depends on the editor, not on ProdPilot. On Cursor's fresh install default nothing in the editor stops the agent calling `prodpilot_deploy`. See [Cursor](/docs/getting-started/cursor/) to turn approvals on.
:::
