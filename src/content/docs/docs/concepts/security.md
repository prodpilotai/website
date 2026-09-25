---
title: Security model
description: Where ProdPilot keeps your GitHub token and Render API key, why a secret never enters a project, and exactly what leaves your machine.
---

ProdPilot handles a GitHub token and a Render API key and acts on real infrastructure. The design rule is that a secret is never written to any file a project commits.

## Two kinds of state, two places

| State | Location | Holds | Committed |
| --- | --- | --- | --- |
| Credentials | `~/.prodpilot/config.toml` | GitHub token, Render API key | never |
| Project state | `<project>/.env.prodpilot` | deployment identifiers for one project | never, gitignored |

A token and an API key belong to you, not to any one repository, so they live in your home directory and never inside a project tree. Deployment state belongs to one project, so it lives beside it.

## Restricted, then verified

`prodpilot setup` restricts the credential file to your account and then reads the permissions back rather than assuming they took effect.

- **On macOS and Linux** the file is set to mode `0600`.
- **On Windows** `os.chmod` cannot express this: it only toggles the read only flag and leaves inherited entries for other accounts in place. So ProdPilot breaks inheritance and grants your account sole access through `icacls`. Since version 1.0.0, the machine's own `SYSTEM` and `Administrators` entries are expected rather than reported: they can read every file on the machine whatever a file's entries say, and on an account in the Administrators group they survive breaking inheritance. Any other account on the file is still reported.

If the file could not be restricted, setup says so and exits non-zero rather than reporting success it cannot prove. `prodpilot doctor` reports the same check every time you run it.

## A secret never enters a project

- **`.env.prodpilot` refuses secrets.** Writing a key whose name looks like a credential, containing `TOKEN`, `SECRET`, `PASSWORD`, `PASSWD`, `API_KEY`, `APIKEY`, `PRIVATE_KEY` or `CREDENTIAL` in any case, is refused, not warned about.
- **`.env.production` is written only when Git ignores it.** Sealing asks `git check-ignore` before writing anything, and a project that does not ignore the file gets no file at all. See [Environment sealing](/docs/prodpush/sealing/).
- **The token is used for one push.** It is placed in the push URL for a single `git push`, never written into the repository's configuration, and every message the push stage returns is scrubbed of it.
- **Repository secrets are sealed on your machine.** The CI/CD workflow's secrets are encrypted with the repository's public key, as libsodium sealed boxes, before they are sent to GitHub.
- **Secrets reach the container at run time.** The local build test passes your sealed values to the container when it runs, never as build arguments, which would record them in the image history.

## What leaves your machine

ProdPilot runs locally and calls no AI service. It talks to:

- **GitHub:** pushes of the files it generated, repository secrets, and workflow status.
- **Render:** creating the service with your sealed environment values, deploy status and logs.
- **Docker Hub and the npm registry,** while building your project.

It sends no telemetry.

## The CI/CD key

The generated workflow triggers each deploy through Render's API, so it needs your Render API key as a repository secret. A Render API key is account wide, which is broader than a per service deploy hook. It is sealed before it leaves your machine, stored only as an encrypted repository secret, and never written to a file, a log or the returned result. If you want a narrower blast radius, give ProdPilot a key created for this purpose and revoke it when you like. See [CI/CD wiring](/docs/prodpush/cicd/) for why a deploy hook is not used.

## Reporting a vulnerability

Report it privately through the repository's [Security tab](https://github.com/prodpilotai/ProdPilot/security), never in a public issue. Include what you did, what happened, and the version `pip show prodpilot` reports. Version 1.0.0rc1 and later 1.0 releases are supported.
