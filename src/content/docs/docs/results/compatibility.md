---
title: Compatibility matrix
description: What was observed when ProdPilot ran in VS Code with Copilot, Cursor, and Windsurf (now Devin), including every failure.
---

Recorded on 14 September 2026 on Windows 11. Every cell is a result that was observed, with the date; nothing is marked from documentation alone, and failures are recorded as found. The full record is [compatibility.md](https://github.com/prodpilotai/ProdPilot/blob/main/docs/compatibility.md).

## What each column checks

| Column | What it records |
| --- | --- |
| Discovery | The client reads its configuration and starts the server |
| Tool listing | All five tools appear in the client |
| Content form | A STATIC or DYNAMIC-PARAMETRIC fix instruction comes back correct |
| Constraint form | A DYNAMIC-DELEGATED fix instruction comes back correct |
| Per-call approval | Whether each tool call needs your confirmation by default |
| Response size | Whether the largest response, 11,988 bytes, reaches the agent whole |

## The matrix

| Client | Discovery | Tool listing | Content form | Constraint form | Per-call approval | Response size |
| --- | --- | --- | --- | --- | --- | --- |
| **VS Code 1.137.0**, Copilot agent | Pass. The agent's first connection is refused once with `-32022` and connects on retry | Pass, 5 of 5 | Pass, SEC-002 | Pass, STR-003 | Asks before a tool's first call; allowing it for the session covers later calls | Whole, but not inline: over the agent's limit, saved to a file the agent read back |
| **Cursor 3.20.17**, Agent | Pass, after switching the server on | Pass, 5 of 5 | Pass, SEC-002 and BLD-001 | Pass, STR-003 | No prompt on any of 3 calls, on the fresh-install default | Pass, 28 of 28 items |
| **Windsurf, now Devin 3.10.23**, agent | Fails from the shared configs, which use `${workspaceFolder}`; passes from Devin's own `.devin/mcp_config.local.json` | Pass, 5 of 5 | Pass, SEC-002 and BLD-001 | Pass, STR-003 | Asks on every call | Pass, all 28 items |

## What differs between clients

Once each client could start the server, every tool was listed and both contract forms came back intact. What differs is everything around the protocol:

- **Launch configuration.** VS Code and Cursor resolve `${workspaceFolder}`. Devin does not, and it imports the other clients' files anyway, so a configuration that works in two IDEs breaks the third. `prodpilot connect devin --project PATH` writes Devin its own file. See [Windsurf (now Devin)](/docs/getting-started/windsurf/).
- **Approval.** VS Code asks before a tool's first call. Devin asks before every call. Cursor, on its fresh-install default, asks before none, so nothing in the client stops the agent calling `prodpilot_deploy` by itself; the tool's own description tells the agent to confirm with you first. See [Cursor](/docs/getting-started/cursor/).
- **Response size.** The largest result arrived whole and inline in Cursor and Devin. In VS Code it went over the Copilot agent's inline limit and reached the model through a saved file, at the cost of an extra step and an extra approval. Every other ProdPilot response is 3 KB or less.
- **Protocol version.** Copilot's agent in VS Code opens on the 2026-07-28 protocol and then sends the older handshake on the same connection, which the MCP SDK refuses by design. The client's own retry connects. See [Troubleshooting](/docs/help/troubleshooting/#vs-code-refuses-the-first-connection-with--32022).

## What these results do not cover

- These runs checked that each agent receives the contracts intact. The agents were told not to apply the delegated contract, so how often a live agent's change passes verification is [not measured](/docs/results/metrics/#the-delegated-rate-is-not-measured).
- The matrix was recorded from a development checkout. `prodpilot connect`, added afterwards, has not yet been observed inside Cursor and Devin.
- A deploy started by an IDE agent has not yet been observed on a real service.
- Other MCP clients were not tested and are not claimed.
