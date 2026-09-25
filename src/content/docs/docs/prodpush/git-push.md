---
title: 4. Git push
description: Stage 4 commits only the files ProdPilot generated and pushes them over token HTTPS, without writing the token anywhere.
---

Stage 4 stages the files ProdPilot generated, commits them as `chore: prodpilot production setup`, and pushes to `origin main` over HTTPS with your GitHub token.

## Only the generated files

The list is built from the templates and fix shapes that create files, so it grows with them and is never written out by hand. In 1.0.0 it is:

```text
.dockerignore
.env.example
.github/workflows/deploy.yml
.gitignore
Dockerfile
nginx.conf
package.json
```

Each candidate is checked against Git's ignore rules before it is staged. `.env.production` is not in the list, is refused by [sealing](/docs/prodpush/sealing/) unless it is ignored, and a test asserts it is never staged.

## Your own changes stop the run

Changes to your own source are yours to commit. If the working tree holds uncommitted changes outside the generated set, the stage stops and names up to eight of the files, rather than deploying code that is not in the repository Render builds from. Commit your work, then deploy.

## The token is never stored

The token goes into the push URL for one command, never into the repository's configuration. Git can echo a URL inside an error message, so every string this stage returns is scrubbed of the token first. Prompts are disabled, so a missing credential fails at once instead of waiting on a terminal that is not there.

## Failures, by kind

| Failure | Meaning |
| --- | --- |
| `no usable remote` | No `origin`, or one that is not GitHub |
| `no GitHub token` | Run `prodpilot setup` |
| `authentication failed` | GitHub rejected the token |
| `insufficient permissions` | The token cannot push to this repository |
| `push rejected` | The remote refused the push, for example because it has commits you do not |
| `unclassified git failure` | Anything else, with Git's own message |

Real output, a repository with no remote:

```json
{
  "project": "push-none",
  "ok": false,
  "staged": [],
  "commit": "",
  "fail": "no usable remote",
  "detail": "no remote named origin is configured"
}
```
