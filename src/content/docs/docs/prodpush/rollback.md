---
title: Rollback
description: A redeploy that fails its smoke test is rolled back to the previous version.
---

New in 1.1.0. When ProdPilot deploys a project it already deployed, it deploys to the same Render service. If that deploy then fails the [smoke test](/docs/prodpush/smoke-test/), ProdPilot:

1. finds the last deploy that was live before the failed one and built a different commit, from Render's own deploy list, never guessed;
2. rolls the service back to it;
3. monitors the rollback deploy the way any deploy is [monitored](/docs/prodpush/monitoring/), for up to ten minutes;
4. checks the health path again;
5. reports the original failure and the result of the rollback together.

[CI/CD wiring](/docs/prodpush/cicd/) does not run after a failed smoke test, rolled back or not.

| Situation | What happens |
| --- | --- |
| The service's first deploy | Nothing to roll back to; the report says so |
| No earlier deploy of a different commit was live | Nothing is rolled back; the report says so |
| The rollback succeeds | The report names the deploy restored and says the health path answers |
| The rollback fails or does not go live | The run stops with both failures and the dashboard address. It is never retried |
| The rollback is live but the health path still fails | Both are reported, with the dashboard address |

## Limits

Render keeps builds only for a limited number of recent deploys, depending on the workspace plan, so an old deploy may no longer be available to roll back to. See [Render's rollback documentation](https://render.com/docs/rollbacks).

Rolling back through Render's API does not turn off the service's automatic deploy, so pushing the failed commit again deploys it again. Fix or revert it first.

## Turning it off

Rollback is on by default. `prodpilot deploy --no-rollback`, or `rollback: false` on the `prodpilot_deploy` tool, leaves a failed deploy in place, as 1.0.0 did.

## Observed on the live demo

On 10 October 2026 a deliberately broken commit was deployed to the demo service and failed its smoke test:

| Attempt | Result |
| --- | --- |
| First | Render refused the rollback to a deploy a month old, and ProdPilot reported both failures with the dashboard address. The service was then restored by deploying the revert |
| Second | The service was rolled back to the deploy from earlier that day and healthy again in 16.6 seconds |

The full record is in the repository's [1.1.0 verification notes](https://github.com/prodpilotai/ProdPilot/blob/main/docs/releases/1.1.0-verification.md).
