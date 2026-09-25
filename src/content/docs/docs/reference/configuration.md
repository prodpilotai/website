---
title: Configuration files
description: Every file ProdPilot reads or writes, where it lives, what it holds, and whether it may be committed.
---

ProdPilot keeps credentials in one place and per-project state in another, and generates a small, fixed set of project files.

| File | Location | Written by | Commit it |
| --- | --- | --- | --- |
| `config.toml` | `~/.prodpilot/` | `prodpilot setup` | Never. It is outside every project |
| `.env.prodpilot` | Project root | Stage 5 of ProdPush | Never. Must be gitignored |
| `.env.production` | Project root | Stage 2 of ProdPush | Never. Written only when Git ignores it |
| MCP configuration | Depends on the IDE | `prodpilot connect` | Depends on the IDE, see below |
| Generated project files | Project root | The fix loop and stage 8 | Yes, stage 4 commits them |

## ~/.prodpilot/config.toml

Your GitHub token and Render API key, under a `credentials` table:

```toml
[credentials]
github_token = "..."
render_api_key = "..."
```

Written by `prodpilot setup` and restricted to your account. Edit it only through `setup`. The environment variable `PRODPILOT_CONFIG_HOME` moves the directory that holds `.prodpilot`; it exists for the test suite.

## .env.prodpilot

Deployment identifiers for one project, written when ProdPush deploys it:

```text
# ProdPilot project state. Generated file, safe to delete.
# Holds deployment identifiers for this project only.
# Never put credentials here. Those live in ~/.prodpilot/config.toml.
PRODPILOT_SERVICE_ID=...
PRODPILOT_DEPLOY_ID=...
PRODPILOT_SERVICE_URL=...
```

A key whose name looks like a credential is refused, not stored. List `.env.prodpilot` in your `.gitignore`; `prodpilot doctor --project PATH` checks that you have. Note that `.prodpilot` in a `.gitignore` does not cover it.

## .env.production

The sealed environment, real values only, placeholders left out. Written by [environment sealing](/docs/prodpush/sealing/) only when `git check-ignore` confirms Git ignores it.

## MCP configuration, per IDE

| IDE | File | Scope |
| --- | --- | --- |
| VS Code | Your user profile, through `code --add-mcp` | Every project |
| Cursor | `~/.cursor/mcp.json` | Every project |
| Devin, formerly Windsurf | `<project>/.devin/mcp_config.local.json` | One project. It names a path valid on one machine only, so add it to `.gitignore` |

## Generated project files

The files the fix loop and the CI/CD stage may create, and the only files ProdPush ever stages:

```text
.dockerignore
.env.example
.github/workflows/deploy.yml
.gitignore
Dockerfile
nginx.conf
package.json
```

`nginx.conf` is for React with Vite projects. `.env.example` lists every key the code reads, with no values. `package.json` is edited rather than replaced, to add a package or script a fix needs.
