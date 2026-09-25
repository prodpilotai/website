---
title: Evaluation
description: How the scoring gate's model was trained on 684 real Render deployments, how five candidate models compared, and why the monotonic one was chosen.
---

The gate's third condition is a model's estimate that a project will really deploy on Render and serve its health path. This page summarises how that model was measured and chosen. The full record, with every table, is [evaluation.md](https://github.com/prodpilotai/ProdPilot/blob/main/docs/evaluation.md).

## The data

- **684 projects deployed to Render for real**, 129 of which deployed and served their health path.
- Every one was also built locally with Render's own build command, a week after its deployment. 9 builds could not be determined and are excluded, with reasons: 8 React builds that ran past twenty minutes and 1 Express build that failed twice on the network. All 9 were projects that did not deploy.
- That leaves **675 labelled rows with 26 features each**, 129 positive: 25 counts derived from the audit, and whether the project builds.
- A stratified split holds out 169 rows, 32 of them deployers: 95 React rows with 27 deployers, and 74 Express rows with 5.

| Stack and outcome | Built | Failed | Undetermined |
| --- | --- | --- | --- |
| React, deployed | 108 | 1 | 0 |
| React, did not deploy | 66 | 174 | 8 |
| Express, deployed | 20 | 0 | 0 |
| Express, did not deploy | 234 | 72 | 1 |

## Five models on one split

To measure the build feature and the monotonic constraint separately, five models were trained on the same rows and scored once on the same held out rows. All are calibrated with sigmoid calibration, and each operating threshold is the F1 best cut on out of fold predictions over the training rows.

| Model | What it is | ROC AUC | PR AUC | Threshold | Recall |
| --- | --- | --- | --- | --- | --- |
| A | The previous model, 25 features | 0.772 | 0.439 | 0.218 | 0.875 |
| B | Constraint only, 25 features | 0.752 | 0.379 | 0.256 | 0.719 |
| C | Build feature only, 26 features | 0.912 | 0.587 | 0.409 | 0.844 |
| **D** | **Both, the model in use** | **0.909** | **0.565** | **0.369** | **0.875** |
| E | Build feature on the old estimator | 0.913 | 0.710 | 0.447 | 0.844 |

For comparison, guessing from the stack alone scores a PR AUC of 0.269, and always answering no scores 0.189. Within each stack, D scores a held out ROC AUC of 0.852 on React and 0.913 on Express. The Express held out rows hold only 5 deployers, so every Express figure rests on 5 positives.

## Whether each model moves the right way

The check training now runs on every model: lower each failure count by one, and turn each failed build into a successful one, on every row. A change that lowers the estimate is a violation.

| Model | Changes checked | Lowered the estimate | Largest fall |
| --- | --- | --- | --- |
| B | 7,034 | 0 | 0 |
| C | 7,281 | 2,393 | 0.264 |
| **D** | **7,281** | **0** | **0** |
| E | 7,281 | 3,234 | 0.182 |

Without the constraint, a third or more of all single fixes would have lowered a project's estimate. A gate that could close further when a rule is fixed would punish the fix loop for doing its job, so D was chosen. On the same five training folds D scores a PR AUC of 0.731 against E's 0.713, so the held out gap in E's favour comes from one split of 32 positives rather than from the constraint.

## What the model relies on

Permutation importance for D on the held out rows, the fall in PR AUC when one feature is shuffled:

| Feature | Fall | Spread |
| --- | --- | --- |
| `built` | 0.309 | 0.035 |
| `assessed_build` | 0.051 | 0.065 |
| `failed_secrets` | 0.007 | 0.034 |
| `failed_p1` | 0.005 | 0.009 |
| `failed_structure` | 0.002 | 0.005 |

Every other feature measured zero or less, within its spread.

The honest reading is that the estimate is mostly whether the project builds. The audit's failure counts still move it, and by the constraint only in the right direction, but on the held out rows they add little measurable ranking. The audit keeps its own role in the gate through the score and the critical rule condition.

## Real projects

Each built for real. D's operating threshold is 0.369.

| Project | Audit score | Critical failures | Builds | D's estimate |
| --- | --- | --- | --- | --- |
| `node_express_gated` | 100 | 0 | yes | 0.842 |
| `node_express_hardened` | 69 | 2 | yes | 0.472 |
| `node_express_insecure` | 13 | 6 | yes | 0.111 |
| `react_vite_ready` | 99 | 0 | no | 0.047 |
| `react_vite_ready` with an entry page | 99 | 0 | yes | 0.851 |

`react_vite_ready` has no `index.html`, so Vite cannot build it. It scores 99 on the audit, and the model refuses it for a reason the audit cannot see. Two broken projects with an entry page still clear the model's point; the gate refuses them on their critical failures before the model is asked.

## The decision for React

Fixed before these numbers existed: React is gated by the model on the same terms as Express only if all four criteria hold.

| Criterion | Needed | D |
| --- | --- | --- |
| Fully fixed ROC AUC, all React rows | 0.70 | 0.864 |
| Fully fixed ROC AUC, held out React rows | 0.70 | 0.830 |
| Held out ROC AUC within React | 0.70 | 0.852 |
| Fully fixed React deployers clearing | 75% | 108 of 109, 99% |

All four hold, so the gate applies to both stacks equally.

## Caveats

- The builds ran a week after the deployments, against the npm registry as it was then. At least three rows built differently here than on Render.
- 39 rows were built on Node 24 because no local image carried the version they asked for. Without them, D's held out ROC AUC is 0.898.
- For React, the build result sits close to what decides the label, because Render builds a static site in much the same way. It is still known before deployment, which is what makes it usable by the gate.
- No project reaches an estimate of 0.9, even with every failing rule cleared. That is why the estimate is a third condition beside the score, compared with its operating point, rather than the score itself.
