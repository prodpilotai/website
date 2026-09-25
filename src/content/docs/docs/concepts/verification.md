---
title: Independent verification
description: Why ProdPilot never takes the agent's word that a fix worked, and how it decides instead.
---

When your editor's agent reports that it applied a fix, the report is recorded and set aside. ProdPilot runs that rule's own checker again on the files on disk and answers from what the checker finds. This is the one mechanism the rest of the system depends on for correctness.

## Why the report is not enough

An agent that both writes a change and declares it correct has not shown anything. The change may be in the wrong file, present but not doing what the rule needs, or it may break something that already worked. So nothing the agent says reaches the verifier. It takes a rule and a project, finds the checker that raised the violation in the first place, and runs that same function again. The only way to influence the answer is to actually change the project.

## Which checker runs

The one the rule already belongs to. The audit's checkers are the mapping, so nothing is duplicated:

| Checkers | Rules |
| --- | --- |
| Syntax tree, one file at a time | 15 |
| Syntax tree, across files | 6 |
| File checks and entropy scan, Node.js with Express | 12 |
| File checks and entropy scan, React with Vite | 17 |

That is 50, each rule in exactly one table. A rule with no checker is an error, never a pass.

Only the one rule's checker runs, not the whole audit: it is much faster, and an unrelated rule's failure cannot confuse the answer. The verdict is collapsed exactly the way the audit collapses it, so the loop never resolves an issue the next audit raises again. Only a pass counts as passing.

## The three outcomes

`prodpilot_fix_applied` answers with one of three outcomes:

| Outcome | Meaning |
| --- | --- |
| `resolved` | The rule's checker now passes |
| `unresolved` | It still fails; the fix should be attempted again |
| `blocked` | The rule cannot be attempted, or the change broke another rule, and it needs a person |

A real example: the agent claims it wrapped the root in an error boundary for STR-003 on the `react_vite_ready` sample, but nothing changed on disk. The claim is recorded next to the verdict and the checker decides. Real output, abridged:

```json
{
  "rule_id": "STR-003",
  "outcome": "unresolved",
  "verified": false,
  "claim": {
    "rule_id": "STR-003",
    "applied": true,
    "summary": "Wrapped the root in an error boundary."
  }
}
```

The full response, including the checker's verdict and location, is on the [MCP tools](/docs/reference/mcp-tools/#prodpilot_fix_applied) page.

## The regression guard

A fix is checked against more than its own rule. When the fix instruction is handed out, ProdPilot records every rule's status. When the fix is reported, it audits again and compares. A change that breaks a rule which passed before it is not a fix: the outcome is `blocked`, the agent is told to undo it, and the rule goes to manual review:

```text
the change broke ENV-001, which passed before it. Undo the change and leave SEC-003 for manual review.
```

That exact case happened in the first full run: SEC-003's CORS fix introduced a new environment key, which broke ENV-001's coverage of `.env.example` on four projects, and the guard reverted all four. The contract format was changed so a content fix now declares the environment keys it reads, and in the rerun the guard reverted nothing. See [Metrics](/docs/results/metrics/#after-phase-7).
