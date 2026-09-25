---
title: Cursor
description: Connect ProdPilot to Cursor's agent, the configuration it writes, and why you may want to turn on tool approvals.
---

Verified on Cursor 3.20.17, Agent mode, on 14 September 2026. See the [compatibility matrix](/docs/results/compatibility/).

## Connect

```sh
prodpilot connect cursor
```

This writes the server into Cursor's global configuration, `~/.cursor/mcp.json`, so it works for every project. Any other server the file already lists is kept, and a file ProdPilot cannot read is left untouched, with the reason.

## What it writes

```json
{
  "mcpServers": {
    "prodpilot": {
      "command": "/absolute/path/to/prodpilot",
      "args": ["serve"]
    }
  }
}
```

## Start it

Cursor registers a new server but holds it disconnected until you switch it on. Open **Settings**, then **MCP**, and switch `prodpilot` on. Once enabled, Cursor starts the server and lists its five tools.

## How Cursor behaved

**No approvals by default.** None of the fix instruction calls stopped for approval; each ran as soon as the agent chose to call it. Cursor's documentation says it asks before using MCP tools by default, but on a fresh install this version applied its own default, stored as `smartModeAutoRun: true` with `fullAutoRun: false`, under which the agent decides when a tool runs without asking.

:::caution
With no approval step, nothing in Cursor stops the agent calling `prodpilot_deploy` by itself. The only guard is the tool's own description, which tells the agent to confirm with you first and to commit its changes before deploying. A server cannot require a client to ask. To get the approval step, turn off auto run for tools in Cursor's settings.
:::

**Log lines shown as errors.** Cursor labels every line ProdPilot writes to stderr as an error. Those lines are ProdPilot's ordinary log, kept off stdout because stdout carries the protocol. Nothing failed.

**Response size.** The largest response, 11,988 bytes, arrived whole and inline.
