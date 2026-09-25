---
title: The five layers
description: How ProdPilot goes from a project on your disk to a live deployment, one layer at a time, and why the order is fixed.
---

ProdPilot is five layers, always run in this order. Each layer consumes what the one before it produced, and nothing moves on until the layer before it holds: nothing can be audited before the stack is known, nothing repaired before it is audited, nothing gated before it is repaired, and nothing deployed before it clears the gate.

| Layer | Name | Question it answers |
| --- | --- | --- |
| 0 | Detect | What stack is this, and what must a deployable version of it contain? |
| 1 | Audit | Which production rules does it fail, and how ready is it, from 0 to 100? |
| 2 | Fix | What exact change fixes each failing rule, and did the change work? |
| 3 | Gate | Is the repaired project ready to deploy? |
| 4 | ProdPush | Can it be built, deployed, proven live and wired to a pipeline? |

## Layer 0: Detect

Detection reads the project's file structure and `package.json`. It is deterministic, involves no model and makes no network call.

| Stack | Matched when |
| --- | --- |
| `node_express` | `express` is a declared dependency |
| `react_vite` | `react` and `react-dom` are declared, and Vite is present |
| `unrecognized` | anything else |

Vite counts as present if the `vite` package is declared or a `vite.config` file exists at the project root, in any of the `.js`, `.mjs`, `.cjs`, `.ts`, `.mts` or `.cts` forms, because Vite is often only a transitive install.

Detection fails closed. A project declaring both Express and React with Vite is reported as `unrecognized`, with an explanation, rather than matched to one of them, because the two production shapes differ and picking the wrong one would be worse than picking none. A missing or unreadable `package.json` is also `unrecognized`.

For the detected stack it loads a **production blueprint**: every file, configuration and code pattern a deployment-ready project of that stack must have. The Node.js with Express blueprint has 28 requirements and the React with Vite blueprint 22. A static single page application opens no database connection and serves no API of its own, so the React blueprint declares the connectivity and API domains not applicable rather than leaving them silently absent.

## Layer 1: Audit

The audit checks every rule of the project's stack. Each rule belongs to one of nine domains (security, secrets, environment, build, connectivity, API, structure, observability, Git hygiene) and has one priority from P0 to P5. Rules are checked three ways: a syntax tree of your JavaScript for code patterns, a check of the files that exist and what they contain, and an entropy scan for credential-shaped strings. Every finding carries its file and line.

The result is a score from 0 to 100 and one of four bands. See [Score bands and gate policy](/docs/reference/score-bands/) and the [Rule catalog](/docs/reference/rules/).

## Layer 2: Fix

The failing rules become a queue, most critical first. For each one, your editor's agent asks for a fix contract, applies it and reports back, and ProdPilot runs the rule's own checker again to decide whether the fix worked. See [Fix types](/docs/concepts/fix-types/), [Independent verification](/docs/concepts/verification/) and [The bounded loop](/docs/concepts/bounded-loop/).

## Layer 3: Gate

The project is audited again and may deploy only when three conditions hold: a score of at least 90, no critical rule failing, and a model's estimate that it will really deploy at or above its operating point. While the gate stays shut, the fix loop runs again, up to five cycles. See [The scoring gate](/docs/concepts/scoring-gate/).

## Layer 4: ProdPush

The deployment pipeline: [pre-flight checks](/docs/prodpush/preflight/), [environment sealing](/docs/prodpush/sealing/), a [local Docker build test](/docs/prodpush/docker-build/), a [push](/docs/prodpush/git-push/) of the files ProdPilot generated, the [Render deployment](/docs/prodpush/render-deploy/), [deploy monitoring](/docs/prodpush/monitoring/), a [post-deploy smoke test](/docs/prodpush/smoke-test/) and [CI/CD wiring](/docs/prodpush/cicd/). `prodpilot_deploy` runs the gate first and then these eight stages, nine in all, and stops at the first that fails.
