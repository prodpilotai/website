---
title: VS Code
description: Connect ProdPilot to the GitHub Copilot agent in VS Code, the configuration it writes, and how VS Code behaved when tested.
---

Verified on VS Code 1.137.0 with its built in GitHub Copilot Chat 0.65.0, on 14 September 2026. See the [compatibility matrix](/docs/results/compatibility/).

## Connect

```sh
prodpilot connect vscode
```

This runs VS Code's own command line tool, `code --add-mcp`, which writes the server into your VS Code user profile, so it works for every project. ProdPilot then reads VS Code's configuration back to confirm the entry is there, rather than trusting the command's exit code.

It looks for VS Code's own `code` in VS Code's install locations first. The `code` command of an editor built on VS Code, such as Cursor, is never used, because on the machine ProdPilot was developed on the first `code` on the path was Cursor's, which accepted the command, exited without error and wrote nothing.

## What it writes

Under `servers` in your user profile's `mcp.json`, naming the `prodpilot` command on this machine by its absolute path:

```json
{
  "servers": {
    "prodpilot": {
      "type": "stdio",
      "command": "/absolute/path/to/prodpilot",
      "args": ["serve"]
    }
  }
}
```

If VS Code cannot be found, `connect` stops and prints the entry to add by hand: run **MCP: Open User Configuration** and add it under `servers`.

## Start it

Run **MCP: List Servers** from the Command Palette, select `prodpilot` and start it. Open the chat in Agent mode and check that the five `prodpilot_` tools are listed in the tools picker.

## How VS Code behaved

**Approvals.** The agent asked before each tool's first call. Choosing to allow a tool for the session covered its later calls; a tool not yet allowed asked again.

**A refused first connection.** The Copilot agent's first connection can be refused with protocol error -32022 and then connect on its automatic retry a second later:

```text
MCP server 'prodpilot' failed (error): failed to initialize MCP client:
JSON-RPC error: -32022: connection is serving the 2026-07-28 protocol;
the initialize handshake is not accepted
```

The refusal comes from the MCP SDK ProdPilot is built on, and it is correct: the client's first request fixes the connection to the newer protocol, and the older handshake that follows on the same connection is refused by design. If the retry does not connect, restart `prodpilot` from **MCP: List Servers**. [Troubleshooting](/docs/help/troubleshooting/) has the detail.

**Response size.** ProdPilot's largest response, the Node.js with Express blueprint from `prodpilot_detect_stack`, is 11,988 bytes on the wire. In this agent a 10.9 KB result is over the limit for inline delivery, so the agent received it as a saved file and read it back in parts. It still got every byte, at the cost of an extra step and an extra file read approval. Every other ProdPilot response is 3 KB or less.
