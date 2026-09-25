---
title: Rule catalog
description: All 50 rules in the frozen ProdPilot 1.0.0 ruleset, grouped by domain, with each rule's stack, priority, check and fix type.
---

<p class="pp-stamp">Generated from prodpilot 1.0.0 on 2026-09-25 by <code>scripts/gen_reference.py</code>. Do not edit this page by hand; run the script again when the package changes.</p>

ProdPilot 1.0.0 checks **50 rules**: 28 for Node.js with Express and 22 for React with Vite. A project is audited against the rules for its own stack only.

| Fix type | Rules |
| --- | --- |
| STATIC | 28 |
| DYNAMIC-PARAMETRIC | 16 |
| DYNAMIC-DELEGATED | 6 |

`rules.determinism_ratio()` returns **0.88**: 44 of 50 rules are fixed with no model writing anything. See [Fix types](/docs/concepts/fix-types/) for what each type means, and [Score bands and gate policy](/docs/reference/score-bands/) for how priority weighs in the score.

How to read a row: the priority runs from P0, critical, to P5. **Checked by** is how the audit decides the rule: a syntax tree of your JavaScript, a check of the files present, or an entropy scan for credential-shaped strings. **Scope** says whether the rule looks at one file at a time or across files.

## Security

| Rule | Stack | Priority | Checked by | Scope | Fix type | Requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `SEC-001` | Node.js with Express | P0 | File check | One file | STATIC | the Dockerfile must run the process as a non-root user |
| `SEC-002` | Node.js with Express | P0 | Syntax tree | One file | STATIC | helmet must be registered before any route definition |
| `SEC-003` | Node.js with Express | P0 | Syntax tree | One file | STATIC | the CORS origin must come from an environment variable, not a wildcard |
| `SEC-004` | Node.js with Express | P0 | Syntax tree | One file | STATIC | Content Security Policy and HTTPS redirect headers must be set |
| `SEC-005` | React with Vite | P0 | File check | One file | STATIC | the Dockerfile must run the server process as a non-root user |
| `SEC-006` | React with Vite | P0 | File check | One file | STATIC | the serving layer must set Content Security Policy and related security headers |

## Secrets

| Rule | Stack | Priority | Checked by | Scope | Fix type | Requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `SCR-001` | Node.js with Express | P0 | File check | One file | STATIC | .gitignore must exclude .env and .env.production |
| `SCR-002` | Node.js with Express | P0 | Entropy scan | Across files | DYNAMIC-PARAMETRIC | no API key, token or password literal may appear in source |
| `SCR-003` | React with Vite | P0 | File check | One file | STATIC | .gitignore must exclude .env and .env.production |
| `SCR-004` | React with Vite | P0 | Entropy scan | Across files | DYNAMIC-PARAMETRIC | no API key or token literal may appear in source |

## Environment

| Rule | Stack | Priority | Checked by | Scope | Fix type | Requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `ENV-001` | Node.js with Express | P0 | Syntax tree | Across files | DYNAMIC-PARAMETRIC | .env.example must cover every environment key the code reads |
| `ENV-002` | Node.js with Express | P0 | Syntax tree | One file | STATIC | the listening port must be read from the environment |
| `ENV-003` | React with Vite | P0 | Syntax tree | Across files | DYNAMIC-PARAMETRIC | .env.example must cover every VITE_ key the code reads |
| `ENV-004` | React with Vite | P0 | Syntax tree | Across files | DYNAMIC-PARAMETRIC | the API base URL must be read from import.meta.env rather than hardcoded |
| `ENV-005` | React with Vite | P0 | Syntax tree | Across files | DYNAMIC-PARAMETRIC | no backend host literal may appear in source |

## Build

| Rule | Stack | Priority | Checked by | Scope | Fix type | Requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `BLD-001` | Node.js with Express | P1 | File check | One file | DYNAMIC-PARAMETRIC | Dockerfile must be present at the project root |
| `BLD-002` | Node.js with Express | P1 | File check | One file | STATIC | .dockerignore must be present at the project root |
| `BLD-003` | Node.js with Express | P1 | File check | One file | DYNAMIC-PARAMETRIC | a GitHub Actions workflow must be present under .github/workflows |
| `BLD-004` | Node.js with Express | P1 | File check | One file | DYNAMIC-PARAMETRIC | package.json must declare a start script that runs without a dev watcher |
| `BLD-005` | Node.js with Express | P1 | File check | One file | STATIC | package.json must pin the Node engine to 20 LTS |
| `BLD-006` | Node.js with Express | P1 | File check | One file | DYNAMIC-PARAMETRIC | the Dockerfile must use a multi-stage build |
| `BLD-007` | React with Vite | P1 | File check | One file | DYNAMIC-PARAMETRIC | Dockerfile must be present at the project root |
| `BLD-008` | React with Vite | P1 | File check | One file | STATIC | .dockerignore must be present at the project root |
| `BLD-009` | React with Vite | P1 | File check | One file | STATIC | an nginx configuration must be present for serving the built application |
| `BLD-010` | React with Vite | P1 | File check | One file | DYNAMIC-PARAMETRIC | a GitHub Actions workflow must be present under .github/workflows |
| `BLD-011` | React with Vite | P1 | File check | One file | STATIC | package.json must declare a build script that produces the production bundle |
| `BLD-012` | React with Vite | P1 | File check | One file | DYNAMIC-PARAMETRIC | the Dockerfile must build in one stage and serve the assets from a static image |
| `BLD-013` | React with Vite | P1 | File check | One file | STATIC | nginx must fall back to index.html so client side routes resolve on refresh |

## Connectivity

| Rule | Stack | Priority | Checked by | Scope | Fix type | Requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `CON-001` | Node.js with Express | P1 | Syntax tree | One file | DYNAMIC-PARAMETRIC | database credentials must be read from the environment |
| `CON-002` | Node.js with Express | P1 | Syntax tree | One file | DYNAMIC-PARAMETRIC | database access must use a connection pool |

## API

| Rule | Stack | Priority | Checked by | Scope | Fix type | Requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `API-001` | Node.js with Express | P2 | Syntax tree | One file | STATIC | public routes must be rate limited |
| `API-002` | Node.js with Express | P2 | Syntax tree | Across files | DYNAMIC-PARAMETRIC | routes must be mounted under a versioned prefix |
| `API-003` | Node.js with Express | P2 | Syntax tree | One file | STATIC | a centralised error handler must return a consistent shape and leak no stack traces |

## Structure

| Rule | Stack | Priority | Checked by | Scope | Fix type | Requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `STR-001` | Node.js with Express | P3 | Syntax tree | Across files | DYNAMIC-DELEGATED | database calls must live in a service layer rather than inside controllers |
| `STR-002` | Node.js with Express | P3 | Syntax tree | Across files | DYNAMIC-DELEGATED | business logic must live in services rather than inline in route handlers |
| `STR-003` | React with Vite | P3 | Syntax tree | Across files | DYNAMIC-DELEGATED | an error boundary must wrap the root of the component tree |
| `STR-004` | React with Vite | P3 | Syntax tree | One file | DYNAMIC-DELEGATED | the client router must handle unmatched routes with a catch all |

## Observability

| Rule | Stack | Priority | Checked by | Scope | Fix type | Requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `OBS-001` | Node.js with Express | P4 | Syntax tree | One file | STATIC | a health check endpoint must be exposed |
| `OBS-002` | Node.js with Express | P4 | Syntax tree | One file | STATIC | structured logging must be configured rather than bare console output |
| `OBS-003` | Node.js with Express | P4 | Syntax tree | One file | STATIC | the process must expose monitoring hooks the hosting platform can scrape |
| `OBS-004` | Node.js with Express | P4 | Syntax tree | One file | STATIC | SIGTERM must be handled so the server drains connections before exit |
| `OBS-005` | React with Vite | P4 | File check | One file | STATIC | nginx must serve a health path that does not load the application bundle |
| `OBS-006` | React with Vite | P4 | File check | One file | STATIC | nginx access and error logging must write to the container log stream |

## Git hygiene

| Rule | Stack | Priority | Checked by | Scope | Fix type | Requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `GIT-001` | Node.js with Express | P5 | File check | One file | STATIC | .gitignore must be present at the project root |
| `GIT-002` | Node.js with Express | P5 | File check | One file | STATIC | .gitignore must exclude node_modules |
| `GIT-003` | Node.js with Express | P5 | Entropy scan | Across files | DYNAMIC-DELEGATED | no secret may appear anywhere in the committed Git history |
| `GIT-004` | React with Vite | P5 | File check | One file | STATIC | .gitignore must be present at the project root |
| `GIT-005` | React with Vite | P5 | File check | One file | STATIC | .gitignore must exclude node_modules |
| `GIT-006` | React with Vite | P5 | File check | One file | STATIC | .gitignore must exclude the dist build output |
| `GIT-007` | React with Vite | P5 | Entropy scan | Across files | DYNAMIC-DELEGATED | no secret may appear anywhere in the committed Git history |
