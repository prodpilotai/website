---
title: The scoring gate
description: The three conditions a project must meet before ProdPilot will deploy it, why each exists, and the messages it refuses with.
---

Before anything reaches GitHub or Render, the project is audited once more and judged on three conditions. All three must hold. The gate fails closed: a project that cannot be audited, or that the model cannot estimate, does not deploy.

1. **No critical rule is failing.** No P0 rule may fail.
2. **The score is at least 90.**
3. **The model's estimate is at or above its operating point.** A model trained on real deployment outcomes estimates the chance the project will really deploy and serve its health path.

The deterministic checks run first, so a project the fix loop has not finished with never needs the model at all. While the gate stays shut, the [fix loop](/docs/concepts/bounded-loop/) runs again on what is still failing, up to five cycles.

## Why 90

The score bands are 0 to 39 Not Ready, 40 to 69 Needs Work, 70 to 89 Nearly Ready and 90 to 100 Production Ready. 90 is the lower bound of the only band that claims a project is ready for production. Deploying something the report itself labels Nearly Ready would contradict the label. The number is a recorded judgment, not a measured optimum.

## Why a score alone is not enough

A score can hide a critical failure. One failed P0 rule with everything else passing scores 93 on the Express ruleset and 91 on React, both above 90. Since P0 means critical, a gate on the score alone would deploy a project with a critical failure still open. So the gate needs both, and reports them separately.

## Why a model as well

The audit reads code; it cannot know whether the project will actually build and run. The model estimates that from 26 features: 25 counts derived from the audit, and whether the project builds, which the gate checks by running Render's own build command in a Linux container on a read only copy of the project.

- It was trained on 684 projects deployed to Render for real, 129 of which went live and served their health path.
- It is a gradient boosted classifier with sigmoid calibration and a **monotonic constraint**: clearing a failing rule, or a build starting to succeed, can never lower the estimate. Training checks this on every row and refuses a model that breaks it.
- On held out projects it scores a ROC AUC of 0.909.
- Its operating point is 0.369, shown as 37 percent in the gate's messages.

The honest reading, stated in the evaluation, is that the estimate rests mostly on whether the project builds. The audit keeps its own role through the score and the critical rule condition. The model ships inside the package, and without it the gate gives no estimate and stays shut; it never falls back to the score. See [Evaluation](/docs/results/evaluation/).

## What the gate says

The gate always names the condition that failed. These are real messages:

```text
score 13 but 6 critical rule(s) still fail: ENV-002, SCR-001, SEC-001, SEC-002, SEC-003, SEC-004
score 89 but 1 critical rule(s) still fail: SEC-003
score 99 meets the threshold, but the model estimates a 5% chance of deploying, below its operating point of 37%
score 96 meets the threshold of 90 with no critical failures, and the model estimates a 82% chance of deploying, at or above its operating point of 37%
```

The third is a React project with no `index.html`, which Vite cannot build: every rule the audit knows about is fixed, but it would not deploy, and the model sees that. The last is the gate opening.

The exact thresholds and weights are on [Score bands and gate policy](/docs/reference/score-bands/).
