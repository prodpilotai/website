---
title: Metrics
description: The determinism ratio, fix reliability by fix type, what the delegated rate does and does not measure, and one recorded run from 13 to 96.
---

Every number here is measured, from the code or from the full chain run on 23 sample projects. The source is the project's own [metrics.md](https://github.com/prodpilotai/ProdPilot/blob/main/docs/metrics.md) and [pipeline.md](https://github.com/prodpilotai/ProdPilot/blob/main/docs/pipeline.md), and each figure below can be traced there.

## Determinism ratio

| Fix type | Rules | Share of 50 |
| --- | --- | --- |
| STATIC | 28 | 56.0% |
| DYNAMIC-PARAMETRIC | 16 | 32.0% |
| DYNAMIC-DELEGATED | 6 | 12.0% |
| Deterministic, STATIC or DYNAMIC-PARAMETRIC | **44** | **88.0%** |

Computed by `determinism_ratio()` in `rules.py` from each rule's own fix type. The test that covers it checks the function against a fresh count and deliberately does not fix the value, so a change to the ruleset changes the number rather than breaking a test. The six delegated rules are GIT-003, GIT-007, STR-001, STR-002, STR-003 and STR-004. See [Fix types](/docs/concepts/fix-types/).

## How a fix is measured

Every contract the loop sent was recorded with what the executor did and what the verifier found.

- **First attempt verified:** the first contract for a rule passed its checker.
- **Verified within budget:** one of the first three did.
- **Passing at the end of the run:** the rule passes in an audit taken as the loop left the project. A rule whose file a later fix created passes here without a second attempt.
- **Applied as written, verified:** of the contracts actually carried out, how many the verifier confirmed. This is the direct test of "deterministic by construction".
- A fix the verifier confirmed and the regression guard then reverted is counted as reverted, never as a success.

## Fix reliability by type

The first full-chain run, 23 samples:

| Fix type | Instances | First attempt verified | Passing at the end | Applied as written, verified |
| --- | --- | --- | --- | --- |
| STATIC | 201 | 155 of 201 (77.1%) | 187 of 201 (93.0%) | 155 of 177 (87.6%) |
| DYNAMIC-PARAMETRIC | 59 | 57 of 59 (96.6%) | 57 of 59 (96.6%) | 57 of 60 (95.0%) |
| DYNAMIC-DELEGATED | 9 | 0 of 9 (0.0%) | 0 of 9 (0.0%) | none applied |

Why a rule was not verified within its budget:

| Fix type | Reason | Instances |
| --- | --- | --- |
| STATIC | The file it edits was not created yet | 35 |
| STATIC | Applied, and the rule still failed | 6 |
| STATIC | Verified, then reverted by the regression guard | 4 |
| STATIC | The executor could not place the anchor | 1 |
| DYNAMIC-PARAMETRIC | Applied, and the rule still failed | 1 |
| DYNAMIC-PARAMETRIC | The executor could not place the anchor | 1 |
| DYNAMIC-DELEGATED | No author for a constraint contract | 9 |

Every applied STATIC contract that did not verify is accounted for, and none wrote the wrong content into the file it named: 15 are in a sample where three files each build an Express app, 4 are the SEC-003 reverts, and 3 are API-003 where an existing error handler has to be moved, which an insert cannot do.

**Ambiguity rate.** 15 of 74 DYNAMIC-PARAMETRIC rule instances, 20.3%, were refused by extraction before any contract was sent, each naming the candidates it would not choose between:

| Refused because | Instances |
| --- | --- |
| The Dockerfile declares no base image to build from | 3 |
| The application mounts no paths to version | 3 |
| 3 candidate entry points exist and package.json names none | 2 |
| 2 lockfiles are present, so the package manager is unclear | 2 |
| No entry point is declared and none of the conventional names exist | 2 |
| 2 database drivers are declared, so the pool to configure is unclear | 1 |
| Routes are mounted under 2 different roots, so one versioned prefix cannot be derived | 1 |
| The value is not bound to a named identifier, so no environment variable name can be derived from it | 1 |

## After Phase 7

Content contracts now declare the environment keys they read, so SEC-003's CORS fix no longer breaks ENV-001. The whole chain was run again on the same 23 samples on 15 September 2026:

| STATIC | First run | After |
| --- | --- | --- |
| First attempt verified | 155 of 201 (77.1%) | 159 of 201 (79.1%) |
| Passing at the end of the run | 187 of 201 (93.0%) | 191 of 201 (95.0%) |
| Applied as written, verified | 155 of 177 (87.6%) | 159 of 177 (89.8%) |
| Reverted by the regression guard | 4 | 0 |

| Whole chain | First run | After |
| --- | --- | --- |
| Cleared the scoring gate | 8 | 11 |
| Completed all nine stages | 6 | 7 |
| Unhandled failures | 0 | 0 |

The DYNAMIC-PARAMETRIC figures, the ambiguity rate and the DYNAMIC-DELEGATED figures are unchanged.

## The delegated rate is not measured

In these runs the IDE agent is played by a test executor, `tests/apply.py`. It applies a content contract literally, which is all an agent can correctly do with one. It cannot write code, so every constraint contract comes back unapplied, and the 0 of 9 above measures the executor, not an agent.

The contract itself has been checked in real clients: the agents of VS Code with Copilot, Cursor and Windsurf each received the STR-003 constraint contract intact. They were told not to apply it. **How often a live agent's delegated change passes verification has not been measured by any run in this project.**

## One run in detail

The run the landing page replays. The `node_express_insecure` sample, taken through the whole chain by ProdPilot 1.0.0 with `python tests/pipeline.py TRACE.json node_express_insecure`. Its 28 Express rules at the start: 22 failing, 3 skipped, and 6 critical failures, **score 13**.

The loop sent 33 fix contracts over two cycles, and the verifier confirmed 18 of them, one for each of 18 rules. Each row below is a rule that ended the run passing, with the score after it, computed with the audit's own weights: first the 18 whose own fix was verified, in the order it was, then the two that pass without one.

| Rule | Priority | Fix type | What it requires | How it passed | Score |
| --- | --- | --- | --- | --- | --- |
| ENV-002 | P0 | STATIC | The listening port is read from the environment | Fix verified | 22 |
| SEC-002 | P0 | STATIC | helmet is registered before any route | Fix verified | 31 |
| SEC-003 | P0 | STATIC | The CORS origin comes from an environment variable | Fix verified | 40 |
| SEC-004 | P0 | STATIC | Content Security Policy and HTTPS redirect are set | Fix verified | 49 |
| BLD-001 | P1 | DYNAMIC-PARAMETRIC | A Dockerfile at the project root | Fix verified | 53 |
| BLD-002 | P1 | STATIC | A `.dockerignore` | Fix verified | 58 |
| BLD-003 | P1 | DYNAMIC-PARAMETRIC | A GitHub Actions workflow | Fix verified | 62 |
| BLD-005 | P1 | STATIC | The Node engine pinned to 20 LTS | Fix verified | 66 |
| BLD-006 | P1 | DYNAMIC-PARAMETRIC | A multi-stage Docker build | Fix verified | 71 |
| API-001 | P2 | STATIC | Public routes are rate limited | Fix verified | 73 |
| API-002 | P2 | DYNAMIC-PARAMETRIC | Routes under a versioned prefix | Fix verified | 75 |
| OBS-001 | P4 | STATIC | A health check endpoint | Fix verified | 76 |
| OBS-002 | P4 | STATIC | Structured logging | Fix verified | 76 |
| OBS-003 | P4 | STATIC | Monitoring hooks the platform can scrape | Fix verified | 77 |
| OBS-004 | P4 | STATIC | SIGTERM drains connections before exit | Fix verified | 77 |
| GIT-001 | P5 | STATIC | A `.gitignore` | Fix verified | 78 |
| GIT-002 | P5 | STATIC | `.gitignore` excludes `node_modules` | Fix verified | 78 |
| ENV-001 | P0 | DYNAMIC-PARAMETRIC | `.env.example` covers every key the code reads | Fix verified | 80 |
| SCR-001 | P0 | STATIC | `.gitignore` excludes `.env` and `.env.production` | Not by its own fix: passes once GIT-001 created `.gitignore` | 88 |
| SEC-001 | P0 | STATIC | The container runs as a non-root user | Not by its own fix: passes once BLD-001 created the Dockerfile | 96 |

ENV-001 was skipped at the start because the code read no environment variables; once ENV-002's fix made it read `PORT`, the rule applied and counted. SCR-001 and SEC-001 edit files that GIT-001 and BLD-001 create. Their own contracts ran before those files existed, failed three times and sent both rules to manual review, which is final; they pass by the end because the files were then created, [as described here](/docs/concepts/bounded-loop/#why-the-order-matters). The run's manual review list names them as unresolved after 3 attempts.

Left for manual review, and still failing at **96**:

- API-003, P2, STATIC: an existing error handler has to be moved, which an insert cannot do.
- STR-001 and STR-002, P3, DYNAMIC-DELEGATED: no agent authored them in this run.

The gate then opened:

```text
score 96 meets the threshold of 90 with no critical failures, and the model estimates a 82% chance of deploying, at or above its operating point of 37%
```

In the recorded chain run this sample went on to complete all nine stages, with Render and GitHub replaced by scripted answers, as every test run does. The live demo is a separate project; see [See it running](/docs/getting-started/introduction/#see-it-running).
