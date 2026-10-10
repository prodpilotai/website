---
title: CLI commands
description: The eight prodpilot commands, their flags, and real output from each, captured from ProdPilot 1.1.0.
---

ProdPilot has eight commands: the four that run it, and four added in 1.1.0 that audit, report, preview and deploy from a terminal or a CI job. Their names and flags are part of what [1.x keeps stable](https://github.com/prodpilotai/ProdPilot/blob/main/docs/stability.md). The help and the four new commands were captured from ProdPilot 1.1.0 installed from PyPI, run on copies of the repository's sample projects. `setup`, `doctor` and `connect` did not change in 1.1.0, and their runs were captured from 1.0.0. The credential file is shown at its default `~/.prodpilot` location and the doctor run's project path is shortened to its folder name; everything else is as printed.

```text wrap=false
 Usage: prodpilot [OPTIONS] COMMAND [ARGS]...

 ProdPilot MCP server.

+- Options --------------------------------------------------------------------------+
| --version          Print the installed version and exit.                           |
| --help             Show this message and exit.                                     |
+------------------------------------------------------------------------------------+
+- Commands -------------------------------------------------------------------------+
| serve    Serve the ProdPilot MCP server over stdio.                                |
| setup    Store the GitHub token and Render API key for this developer.             |
| doctor   Report whether ProdPilot's prerequisites are in place.                    |
| connect  Connect an IDE's agent to ProdPilot, naming this machine's prodpilot      |
|          command.                                                                  |
| audit    Audit a project read-only and check it is ready.                          |
| fix      Preview the fix loop's changes without writing anything.                  |
| deploy   Run the nine deploy stages, as the prodpilot_deploy tool does.            |
| report   Audit a project read-only and write a report.                             |
+------------------------------------------------------------------------------------+
```

`prodpilot --version` prints the installed version, `prodpilot 1.1.0`.

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

## prodpilot audit

```text
prodpilot audit [PROJECT] [--ci] [--min-score N] [--fail-on p0|p1|none] [--baseline REF]
```

Audits the project read-only and checks it is ready. It changes nothing, builds nothing and calls no network service.

| Flag | What it does |
| --- | --- |
| `--fail-on` | Fails when a rule at this priority or above fails: `p0` (the default), `p1` or `none` |
| `--min-score N` | Fails when the score is below N, 0 to 100 |
| `--baseline REF` | Also audits the project at another Git ref and fails when the score dropped or a rule that passed there now fails |
| `--ci` | Prints a JSON summary on stdout and never prompts |

Exit codes: **0** the check passed, **1** it failed, **2** a tool or usage error, such as a path that is not a project or a baseline that cannot be resolved. The baseline is audited in a temporary Git worktree that is always removed. A shallow clone does not hold the baseline commit, so in CI set `fetch-depth: 0` on `actions/checkout`.

A real run on the `node_express_insecure` sample. It exits with code 1:

```text
node_express_insecure: 13/100 Not Ready, 22 failing rule(s), 6 critical
  P0 ENV-002 the listening port must be read from the environment
  P0 SCR-001 .gitignore must exclude .env and .env.production
  P0 SEC-001 the Dockerfile must run the process as a non-root user
  P0 SEC-002 helmet must be registered before any route definition
  P0 SEC-003 the CORS origin must come from an environment variable, not a wildcard
  P0 SEC-004 Content Security Policy and HTTPS redirect headers must be set
  P1 BLD-001 Dockerfile must be present at the project root
  ...
  P5 GIT-002 .gitignore must exclude node_modules
Readiness check failed:
  6 rule(s) at P0 or above are failing: ENV-002, SCR-001, SEC-001, SEC-002, SEC-003, SEC-004
```

Abridged: the run lists all 22 failing rules. With `--ci --min-score 90` the same project gives JSON, here cut after the first failing rule:

```json
{
  "project": "node_express_insecure",
  "stack": "node_express",
  "score": 13,
  "band": "Not Ready",
  "passed": false,
  "exit_code": 1,
  "fail_on": "p0",
  "min_score": 90,
  "reasons": [
    "6 rule(s) at P0 or above are failing: ENV-002, SCR-001, SEC-001, SEC-002, SEC-003, SEC-004",
    "the score 13 is below the minimum of 90"
  ],
  "failing": [
    { "rule_id": "ENV-002", "priority": "P0", "domain": "environment", "fix_type": "STATIC" }
  ]
}
```

The summary also carries `baseline`, the comparison's result when `--baseline` is given, and `notices`, such as a declared Node version past its end of life. A notice never changes the score or the result. See [Use in CI](/docs/getting-started/ci/).

## prodpilot report

```text
prodpilot report --format sarif|md|html --out PATH [PROJECT]
```

Audits the project read-only and writes a report: a SARIF 2.1.0 log for GitHub code scanning, a Markdown report, or a self-contained HTML page that needs no network to open. It exits 0 whenever the report was written, whatever the audit found, and 2 when it could not be written. No format prints a credential: a secret the audit found is shown only by its file, its line, its first four characters and its length.

```text
Wrote sarif report for node_express_insecure to insecure.sarif: score 13/100, 22 failing rule(s).
```

## prodpilot fix --dry-run

```text
prodpilot fix --dry-run [PROJECT] [--rule RULE_ID]
```

Shows every change the fix loop would make and writes nothing, in the project or anywhere else. Content contracts appear as unified diffs, in the order the loop would reach them. A delegated rule shows the constraint contract your agent works within, and a refused parametric rule shows its reason and the candidates it found. The fixes themselves are still applied by your agent through `prodpilot_fix_instruction`, which takes the same preview with `dry_run: true`.

A real run for one rule. It exits with code 0:

```text
SEC-002 (P0, STATIC)
--- a/src/server.js
+++ b/src/server.js
@@ -6,6 +6,10 @@

 app.use(cors({ origin: "https://admin.example.com" }));

+{
+  const helmet = require("helmet");
+  app.use(helmet());
+}
 app.get("/invoices", (req, res) => {
   res.json({ invoices: [] });
 });

1 rule(s) previewed, 1 with a diff. Nothing was written.
```

## prodpilot deploy

```text
prodpilot deploy [PROJECT] [--branch main] [--no-rollback]
```

Runs the nine deploy stages, exactly as the `prodpilot_deploy` tool does. This creates or redeploys a real Render service and pushes to the project's GitHub repository. A project ProdPilot already deployed is redeployed to its existing service, and a redeploy that fails its smoke test is rolled back unless `--no-rollback` is given; see [Rollback](/docs/prodpush/rollback/). It exits 0 when every stage passed and 1 when a stage stopped the run.

A real run on a project the scoring gate refuses, so it stops before anything leaves the machine:

```text
  scoring gate             FAIL        score 13 but 6 critical rule(s) still fail: ENV-002, SCR-001, SEC-001, SEC-002, SEC-003, SEC-004
  pre-flight               not reached
  environment sealing      not reached
  docker build test        not reached
  git push                 not reached
  render deployment        not reached
  deploy monitoring        not reached
  post-deploy smoke test   not reached
  ci/cd wiring             not reached
node_express_insecure: stopped at scoring gate, score 13 but 6 critical rule(s) still fail: ENV-002, SCR-001, SEC-001, SEC-002, SEC-003, SEC-004
```
