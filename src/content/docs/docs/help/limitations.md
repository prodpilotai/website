---
title: Known limitations
description: What ProdPilot 1.1.0 does not do, what has not been measured, and the failure paths that are recorded rather than changed.
---

These are stated here so you do not have to find them the hard way. Each comes from the project's own records.

## Scope

- **Two stacks.** Node.js with Express, and React with Vite. A project declaring both is refused rather than guessed at. Other stacks are unrecognised by design.
- **One deployment target.** Render, with Express projects on the free plan. The [provider interface](/docs/prodpush/provider/) means another target would not need a rewrite, but none exists.
- **Three tested clients.** VS Code with Copilot, Cursor, and Windsurf, now Devin, each connected with `prodpilot connect` and checked again with 1.1.0. Claude Code, connected by hand because `prodpilot connect` does not write its configuration, was also seen working with 1.1.0. Other MCP clients were not tested.

## Not measured

- **How often a live agent's delegated fix passes.** For the six DYNAMIC-DELEGATED rules, the agent writes the change. Every run so far used a test executor that cannot write code, so the first-pass rate for a real agent has not been measured. See [Metrics](/docs/results/metrics/#the-delegated-rate-is-not-measured).

## Not yet observed on real services

The suite covers this against scripted GitHub and Render APIs, but it has not yet been seen end to end on a live service:

- a deploy started by an IDE agent.

Seen on the live demo for 1.1.0, on 10 October 2026:

- the CI/CD workflow ProdPilot writes, redeploying the service from GitHub Actions: deploy `dep-db4udenlot8c73d2915g` was live in 39 seconds, in run [38033962767](https://github.com/sudais-khalid/prodpilot-demo/actions/runs/38033962767); see [CI/CD wiring](/docs/prodpush/cicd/#observed-on-a-live-service);
- a broken redeploy rolled back to the previous version and healthy again in 16.6 seconds; see [Rollback](/docs/prodpush/rollback/).

## Recorded, not changed

- **The retry budget counts attempts, not progress.** A file holding four credentials needs four SCR-002 fixes, and the budget is three.
- **An error handler that has to move.** API-003's fix is an insert, which cannot move an existing error handler that sits in the wrong place.
- **One contract, one file.** A project where three files each build an Express app gets a content contract for the first file named, and the rule still fails on the others.
- **A missing module passes the audit.** No audit rule checks for a `require` of a file that does not exist. The [Docker build test](/docs/prodpush/docker-build/) catches it and names the module.
- **Your own Dockerfile running `npm ci` with no lockfile.** No audit rule checks for this, and the build stage reports it only as "build failed, missing dependency". ProdPilot's own generated Dockerfiles use `npm install` when there is no lockfile.
- **A second deploy.** Render's own automatic deploy stays on, so a push can start a deploy beside the workflow's; the workflow waits for the newer one.
- **The model rests mostly on the build.** On held out projects the estimate is mostly whether the project builds; the audit's failure counts add little measurable ranking. The audit keeps its role through the score and the critical rule condition. See [Evaluation](/docs/results/evaluation/#what-the-model-relies-on).
- **Node 20 pins.** Rule BLD-005 belongs to the frozen 1.x ruleset and still asks for a Node 20 pin, though Node 20 reached end of life on 30 April 2026. Generated Dockerfiles and workflows use Node 24 unless the project declares another LTS line, and an end-of-life declaration gets a notice that never changes the score.
- **Rollback needs a recent build.** Render keeps builds for a limited number of recent deploys, so an old deploy may no longer be available to roll back to. In the live test, Render refused a rollback to a deploy a month old.

## What 1.x does not promise

The score a given project receives, the number of rules, the model's estimates and operating point, and the exact wording of messages can all change within 1.x. The tool names and fields, rule identifiers, commands and flags, the credential location and the gate's three conditions will not. See [stability.md](https://github.com/prodpilotai/ProdPilot/blob/main/docs/stability.md).
