---
title: CLI commands
description: The four prodpilot commands, their flags, and real output from each, captured from ProdPilot 1.0.0.
---

ProdPilot has four commands. Their names and flags are part of what [1.x keeps stable](https://github.com/prodpilotai/ProdPilot/blob/main/docs/stability.md). Everything on this page was captured from ProdPilot 1.0.0 installed from PyPI. The credential file is shown at its default `~/.prodpilot` location and the doctor run's project path is shortened to its folder name; everything else is as printed.

```text wrap=false
 Usage: prodpilot [OPTIONS] COMMAND [ARGS]...

 ProdPilot MCP server.

+- Options ---------------------------------------------------------------------------+
| --help          Show this message and exit.                                         |
+-------------------------------------------------------------------------------------+
+- Commands --------------------------------------------------------------------------+
| serve    Serve the ProdPilot MCP server over stdio.                                 |
| setup    Store the GitHub token and Render API key for this developer.              |
| doctor   Report whether ProdPilot's prerequisites are in place.                     |
| connect  Connect an IDE's agent to ProdPilot, naming this machine's prodpilot       |
|          command.                                                                   |
+-------------------------------------------------------------------------------------+
```

## prodpilot setup

Stores the GitHub token and the Render API key in `~/.prodpilot/config.toml`, never inside a project. Nothing you type is printed back. Run it again to change a value; pressing Enter keeps the existing one.

```text
ProdPilot credential setup
Credentials are stored in ~/.prodpilot/config.toml
They are never written into a project directory.

GitHub token: Render API key:
Saved to ~/.prodpilot/config.toml
Permissions: access is limited to the current user
```

The file is restricted to your account, and the permissions are read back rather than assumed. If they could not be restricted, `setup` says so and exits non-zero. See [Security model](/docs/concepts/security/#restricted-then-verified).

What the GitHub token needs: a classic token with the `repo` and `workflow` scopes, or a fine grained token with read and write access to contents, secrets and workflows, and read access to actions.

## prodpilot doctor

Reports whether everything ProdPilot needs is in place, and exits non-zero when something required is missing, so a script can see the failure. Credential values are never shown, only whether they are stored.

| Flag | What it adds |
| --- | --- |
| `--project PATH` | Checks that the project's `.env.prodpilot` is excluded by `.gitignore`, and counts the state keys stored |

A real run with `--project`, on a project whose `.gitignore` does not exclude `.env.prodpilot`. It exits with code 1:

```text
ProdPilot doctor

Config file: ~/.prodpilot/config.toml
  found
  github_token: stored
  render_api_key: stored
  permissions: access is limited to the current user

Project: payments-api
  .env.prodpilot: .env.prodpilot is not excluded by .gitignore
  stored state keys: 0

Tools ProdPilot runs:
  git: git version 2.54.0.windows.1
  Node.js: v26.3.0
  Docker: daemon 29.7.2
```

With `.env.prodpilot` added to `.gitignore`, the project line reads `.env.prodpilot is listed in .gitignore`, the run ends with `All checks passed.` and the exit code is 0.

## prodpilot connect

Connects an IDE's agent to ProdPilot, naming this machine's `prodpilot` command by its absolute path. Any other server already in the file is kept.

| Argument or flag | Meaning |
| --- | --- |
| `vscode`, `cursor` or `devin` | The IDE to connect. Required |
| `--project PATH` | Devin only: the project folder you open in Devin. Defaults to the current directory |

VS Code and Cursor are connected once for every project. Devin blanks the `${workspaceFolder}` variable other configurations use, so it is connected once per project. A real run:

```text
Added prodpilot to E:\tmp\payments-api\.devin\mcp_config.local.json
It starts: E:/ProdPilot/Website/.venv/Scripts/prodpilot.exe serve
.devin/mcp_config.local.json names a path valid on this machine only and Git does not ignore it. Add it to .gitignore.
Reconnect prodpilot in Devin's MCP panel, or restart Devin, so it reads the file.
```

Where each IDE is written to, and what to do next in it: [VS Code](/docs/getting-started/vscode/), [Cursor](/docs/getting-started/cursor/), [Windsurf (now Devin)](/docs/getting-started/windsurf/).

## prodpilot serve

Starts the MCP server over stdio. You do not run it yourself: your IDE runs it from the configuration `connect` wrote. It takes no flags. ProdPilot writes its log to stderr, because stdout carries the protocol; some clients, Cursor among them, label every stderr line as an error even when nothing failed.

The tools the server offers are on [MCP tools](/docs/reference/mcp-tools/).
