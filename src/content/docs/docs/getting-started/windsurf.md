---
title: Windsurf (now Devin)
description: Connect ProdPilot to Windsurf, now distributed as Devin, including the configuration issue it has and the per project file that works around it.
---

Verified on Devin 3.10.23, the application Windsurf is now distributed as, on 14 September 2026. It runs Windsurf's language server, keeps Windsurf's settings folder `~/.codeium/windsurf`, and its MCP documentation moved from the Windsurf site to Devin's. See the [compatibility matrix](/docs/results/compatibility/).

## The known issue

The configurations that work in VS Code and Cursor do not work here.

The Devin agent imports the MCP configurations of other editors each time it lists servers. Those use `${workspaceFolder}` in the launch command, and Devin treats it as an unset environment variable and blanks it. It then tries the imported entry, which shares the name `prodpilot`, and fails:

```text
[MCP] environment variable 'workspaceFolder' is not set; substituting empty string
Starting stdio MCP server 'prodpilot': "/.venv/Scripts/prodpilot.exe" ["serve"]
MCP server 'prodpilot' connection failed: cannot find binary path
```

The panel shows `prodpilot` in error, "Connection failed, cannot find binary path". Windsurf's own global file, `~/.codeium/windsurf/mcp_config.json`, was never the one it launched from.

## The workaround

Devin reads its own highest precedence file, `.devin/mcp_config.local.json` in the project, before anything else. `prodpilot connect devin` writes that file, naming the `prodpilot` command on this machine by its absolute path:

```sh
prodpilot connect devin --project PATH
```

`PATH` is the project folder you open in Devin; it defaults to the current directory. Real output, in a scratch project:

```text
Added prodpilot to E:\tmp\payments-api\.devin\mcp_config.local.json
It starts: E:/ProdPilot/Website/.venv/Scripts/prodpilot.exe serve
.devin/mcp_config.local.json names a path valid on this machine only and Git does not ignore it. Add it to .gitignore.
Reconnect prodpilot in Devin's MCP panel, or restart Devin, so it reads the file.
```

And the file it wrote:

```json
{
  "mcpServers": {
    "prodpilot": {
      "command": "E:/ProdPilot/Website/.venv/Scripts/prodpilot.exe",
      "args": [
        "serve"
      ]
    }
  }
}
```

The file holds a path that is only valid on your machine, so add it to `.gitignore`, as the warning says. ProdPilot asks Git itself, through `git check-ignore`, rather than reading `.gitignore` on its own. Connect once per project, because the file lives in the project.

## How Devin behaved

**Approval on every call.** Every ProdPilot call stopped for approval, and each approval covered only that one call. This matches Devin's documentation, "MCP tools default to prompting for approval". It is the strictest of the three editors: a person approves each step of the fix loop.

**Tools listed as Write.** Devin lists all five tools under "Write". The Devin record was taken before version 1.0 marked four of the five tools as read only; see the [MCP tools reference](/docs/reference/mcp-tools/) for the hints each tool now carries.

**Response size.** The largest response, 11,988 bytes, arrived whole and inline: the agent listed all 28 blueprint items by name.
