---
title: The bounded loop
description: How the fix loop orders its work, how many attempts a rule gets, when the loop stops, and what happens to a rule it cannot fix.
---

The fix loop always ends. It takes one issue at a time, gives each a fixed budget of attempts, and has a hard ceiling on how many times the whole queue may be run.

## The mechanics

1. The audit's failing rules become a queue ordered by priority, P0 first, one issue at a time.
2. A fix that verifies moves the loop to the next issue.
3. A fix that does not verify is retried, up to **3 attempts per issue**.
4. An issue whose budget runs out goes to **manual review** with its location and the reason, and the loop continues with the next one.
5. When the queue is drained, the [scoring gate](/docs/concepts/scoring-gate/) audits the project again. If the gate stays shut, the loop runs again on what is still failing, up to a hard **ceiling of 5 cycles**.

## What counts as an attempt

One pass of the resolve step over one issue: the fix instruction, the agent's edit, and the verification. The budget of three is counted across the whole run, not reset each cycle, and an issue sent to manual review is never attempted again, even if a later audit raises it. That is the strictest reading of "3 per issue", and it means the run ends on the retry budget alone, usually well before the ceiling.

## What a cycle is

One full drain of the queue, followed by the gate's re-audit, which may hand back a fresh queue. A cycle is not one issue and not one attempt. The ceiling of 5 bounds how many times the queue may be refilled.

## Why the order matters

Critical rules go first, but a critical rule can edit a file that a lower priority rule creates. SCR-001, for example, adds `.env` to a `.gitignore` that GIT-001 creates. Taken first, it fails with "no file at .gitignore", and then passes by the end of the run once GIT-001 has created the file. The gate's second cycle is what catches that where it can. In the recorded run, 35 STATIC instances failed their first cycle this way and passed by the end wherever the rule creating their file had run.

## What manual review looks like

Every rule the loop could not fix leaves a record with its fix type and the exact reason. Real entries from the recorded run:

```text
SEC-003 (STATIC): fixing SEC-003 broke ENV-001, which passed before it, so the change was reverted
CON-002 (DYNAMIC-PARAMETRIC): 2 database drivers are declared, so the pool to configure is unclear. Candidates: mysql, postgres
API-003 (STATIC): unresolved after 3 attempt(s): the rule still fails after the change
STR-001 (DYNAMIC-DELEGATED): unresolved after 3 attempt(s): the rule still fails after the agent's change
```

The first line comes from the [regression guard](/docs/concepts/verification/#the-regression-guard), the second from a [refused extraction](/docs/concepts/fix-types/#when-a-value-cannot-be-read), and the last two from a spent retry budget.

## A known limit

The budget counts attempts, not progress. The `node_express_secrets` sample holds four credentials in one file. Each SCR-002 attempt moved one into the environment, but the rule passes only when all four are gone, so after three attempts one remained and the rule went to review. Changing what the budget counts would be a change to the loop, and it is recorded rather than changed.
