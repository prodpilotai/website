---
title: Troubleshooting
description: Fixes for the problems that have actually been observed, each with the exact message ProdPilot or the client prints.
---

Start with `prodpilot doctor`. It names anything missing, and with `--project PATH` it checks the project too. See [CLI commands](/docs/reference/cli/#prodpilot-doctor).

## Connecting

### VS Code refuses the first connection with -32022

```text
MCP server 'prodpilot' failed (error): failed to initialize MCP client:
JSON-RPC error: -32022: connection is serving the 2026-07-28 protocol;
the initialize handshake is not accepted
```

Copilot's agent opens the connection on the newer protocol, then sends the older handshake on the same connection, which the MCP SDK ProdPilot is built on refuses by design. The client's automatic retry normally connects a second later. If it does not, restart `prodpilot` from **MCP: List Servers**.

### Devin: "cannot find binary path"

```text
[MCP] environment variable 'workspaceFolder' is not set; substituting empty string
MCP server 'prodpilot' connection failed: cannot find binary path
```

Devin imports other clients' configuration files and blanks the `${workspaceFolder}` they use. Run `prodpilot connect devin --project PATH` and reconnect in Devin's MCP panel. See [Windsurf (now Devin)](/docs/getting-started/windsurf/).

### Cursor lists the server but it is not connected

Cursor holds a newly added server off until you switch it on in **Settings**, **MCP**.

### Cursor shows ProdPilot's log lines as errors

ProdPilot writes its log to stderr, because stdout carries the protocol. Cursor labels every stderr line as an error. Nothing failed.

### VS Code: "Output too large to read at once"

The stack blueprint for an Express project is 10.9 KB, over the Copilot agent's inline limit. The agent receives it through a saved file and reads it back, which needs one extra file read approval. Allow it.

### The version says 1.0.0rc1

In 1.0.0 the server reports `1.0.0rc1` in its ping response and handshake, because the version string inside the package was not raised at release. The package is 1.0.0, which `pip show prodpilot` confirms.

## Credentials

### doctor reports the credential file is readable by other accounts

Run `prodpilot setup` again; it restricts the file and checks. On Windows, since 1.0.0, the machine's own `SYSTEM` and `Administrators` entries are expected and named in the report rather than flagged. Any other account on the file is a real fault.

### .env.prodpilot is not excluded by .gitignore

```text
.env.prodpilot: .env.prodpilot is not excluded by .gitignore
```

Add `.env.prodpilot` to `.gitignore`. A `.prodpilot` entry does not cover it.

## The fix loop

### A rule went to manual review

Every entry says why. The kinds you will see:

| Message | What to do |
| --- | --- |
| `unresolved after 3 attempt(s): the rule still fails after the change` | Read the rule's finding and fix it by hand; the three attempts are spent |
| `fixing SEC-003 broke ENV-001, which passed before it, so the change was reverted` | Make the change so it keeps the other rule passing |
| `2 database drivers are declared, so the pool to configure is unclear. Candidates: mysql, postgres` | Remove the ambiguity, here one driver, and run the loop again |
| `... It passes by the end of the run.` | Nothing: a later fix created the file it needed |

## The gate

The refusal always names the condition that failed. See [The scoring gate](/docs/concepts/scoring-gate/#what-the-gate-says).

### A React project scoring 99 is refused

```text
score 99 meets the threshold, but the model estimates a 5% chance of deploying, below its operating point of 37%
```

The project most likely cannot build. A React project with no `index.html` is the usual cause: Vite cannot build it, and the gate's own build check sees that.

### The stack is not recognised

```text
ambiguous project, express and react with vite are both declared. Split the frontend and backend into separate project roots so each can be matched to its own blueprint
no package.json found at the project root
vite is present but react is not. Only React with Vite is supported in v1
```

Only Node.js with Express and React with Vite are supported, one stack per project root.

## Deploying

### .env.production was not written

```text
.env.production is not covered by .gitignore, so it was not written
```

Add `.env.production` to `.gitignore`. Placeholders such as `CHANGEME` are left out of the file and reported; supply real values in `.env`.

### The Docker build test fails

- **Docker Desktop is in Windows containers mode.** ProdPilot says so; its images are Linux. Switch to Linux containers.
- **`npm ci` without a lockfile.** `npm ci` refuses to run without a `package-lock.json`. Commit a lockfile, or install with `npm install` in your Dockerfile.
- **The container exited on start.** The stage prints the application's own error, for example `Error: Cannot find module '../controllers/orderController'`. The code requires a file the project does not contain.

### Uncommitted changes stop the push

ProdPush commits only the files it generated. Commit your own changes first, then deploy again.

### The push fails

The stage says which of `no usable remote`, `no GitHub token`, `authentication failed`, `insufficient permissions`, `push rejected` or `unclassified git failure` it hit. For permissions, the token needs the `repo` and `workflow` scopes, or on a fine grained token read and write access to contents, secrets and workflows. See [Git push](/docs/prodpush/git-push/).

## Still stuck

Open an [issue](https://github.com/prodpilotai/ProdPilot/issues) with what you ran, what it printed, and the version `pip show prodpilot` reports. Report a security problem privately through the [Security tab](https://github.com/prodpilotai/ProdPilot/security).
