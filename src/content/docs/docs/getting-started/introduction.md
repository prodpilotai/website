---
title: Introduction
description: What ProdPilot is, who it is for, what it checks, and how it decides a project is ready to deploy.
---

ProdPilot is a local MCP server that gives the coding agent already inside your editor a set of deployment tools. It audits a Node.js with Express or React with Vite project against 50 production rules, hands your agent one exact fix at a time, verifies every fix itself, and deploys to Render only a project that clears its scoring gate.

It is for developers who build web apps quickly with an AI coding assistant and want them deployed properly, not just deployed.

## The problem it solves

A project that runs on your laptop is not yet a project that can run on a server. Your machine quietly supplies what the code never declared: an interpreter of the right version, environment variables typed into a terminal, an open port, and nobody else on the network. A production host supplies none of that. It starts the app from a container image, injects configuration from its own settings, exposes it to the public internet, and restarts it when a health path stops answering.

Projects built quickly with an assistant often carry credentials in source files, no container definition, no health endpoint, no security headers and no pipeline. So the first deploy fails, or it succeeds insecurely.

An assistant asked to fix these gaps can do so, but it also reports its own work as done, and that report is not evidence. ProdPilot is built around that fact.

## What it does

1. **Detects the stack.** It reads `package.json` and the file tree and names the project `node_express`, `react_vite` or `unrecognized`. An ambiguous project is refused rather than guessed.
2. **Audits it.** 28 rules for Express or 22 for React, across nine domains, each with a priority from P0, critical, to P5. The result is a score from 0 to 100 and a band.
3. **Fixes it through your agent.** For each failing rule it hands the agent a contract: either the exact change to make, or a requirement and a boundary to author within.
4. **Verifies every fix.** When the agent reports a fix, ProdPilot runs that rule's own checker again on the files on disk and answers from what it finds.
5. **Gates the deploy.** A project may deploy only with a score of at least 90, no critical rule failing, and a deployability estimate from a model trained on 684 real Render deployments at or above its operating point.
6. **Deploys it.** ProdPush builds the project in Docker on your machine, pushes the files ProdPilot generated, creates the Render service, waits for it to go live, smoke tests it and wires a GitHub Actions pipeline. It stops at the first stage that fails and says which one and why.

These are [the five layers](/docs/concepts/five-layers/).

## What it does not do

ProdPilot runs no model of its own and calls no AI service. The agent in your editor writes the changes; ProdPilot decides what they must be and whether they worked. It supports two stacks and one deployment provider in version 1, and it repairs the operational layer of a project, not its application logic. [Known limitations](/docs/help/limitations/) lists everything that is not supported or not yet measured.

## See it running

The demo at [prodpilot-demo.onrender.com](https://prodpilot-demo.onrender.com/) is a small Express API that describes itself as audited, fixed and deployed end to end by ProdPilot. This is what it answered on 25 September 2026:

```text
GET /          200  {"name":"prodpilot-demo","description":"A small Express API audited, fixed and deployed end to end by ProdPilot.","endpoints":{"health":"/health","api":"/api/v1","metrics":"/metrics"}}
GET /health    200  {"status":"ok"}
GET /api/v1    200  {"name":"prodpilot-demo","version":"1.0.0"}
GET /metrics   200  process metrics in the Prometheus text format
```

Every response carried `content-security-policy`, `strict-transport-security`, `x-content-type-options`, `x-frame-options` and `referrer-policy`. It runs on Render's free plan, so the first request after a quiet spell is slow while the service wakes. The [landing page](/#proof) checks it again from your browser.

## Where to go next

- [Installation](/docs/getting-started/installation/) lists what you need and how to install.
- [Quickstart](/docs/getting-started/quickstart/) takes you from install to a first audit.
- [Metrics](/docs/results/metrics/) and [Evaluation](/docs/results/evaluation/) show what has been measured, including what has not.
