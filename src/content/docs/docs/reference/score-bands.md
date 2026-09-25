---
title: Score bands and gate policy
description: How the 0 to 100 readiness score is computed, the four bands, and the exact thresholds the scoring gate applies.
---

## The score

The audit gives one verdict per rule, then weights each rule by its priority. The weight halves at each tier:

| Priority | Weight |
| --- | --- |
| P0, critical | 32 |
| P1 | 16 |
| P2 | 8 |
| P3 | 4 |
| P4 | 2 |
| P5 | 1 |

```text
score = round(100 * weight of rules passed / weight of rules assessed)
```

- **One verdict per rule, not per file.** A rule fails if any file fails it, so a project with four route files does not count the rule four times.
- **Rules that do not apply are left out of both sides.** A skipped rule neither earns nor costs anything, since scoring a project against, for example, a rule for the other stack would be meaningless.
- **A file that cannot be parsed counts against the score,** since leaving it out would make an unreadable file the cheapest way to raise a score.

Halving keeps one P0 rule worth more than every P5 rule in the ruleset combined. The weights are a recorded choice; no source document specified them.

## The bands

| Score | Band |
| --- | --- |
| 90 to 100 | Production Ready |
| 70 to 89 | Nearly Ready |
| 40 to 69 | Needs Work |
| 0 to 39 | Not Ready |

## The gate policy

| Condition | Value |
| --- | --- |
| Minimum score | 90 |
| Critical (P0) rules failing | 0 |
| Model estimate | At or above the operating point stored with the model, 0.369 in 1.0.0 |
| Retry budget | 3 attempts per issue, across the whole run |
| Cycle ceiling | 5 |

All three conditions must hold. Why each exists is on [The scoring gate](/docs/concepts/scoring-gate/).

The operating point is read from the model file, not written in the code, so the model and the point it is judged against cannot drift apart. A model that fails to load, or was trained on a different feature list, gives no estimate, and the gate stays shut.

## What 1.x keeps stable

The gate's three conditions are promised for every 1.x release. The score a given project receives is not: rules get sharper, so a project may score differently between releases. The model may be retrained, which changes its estimates and its operating point. See [stability.md](https://github.com/prodpilotai/ProdPilot/blob/main/docs/stability.md).
