"""Turn a recorded ProdPilot run into the landing page's hero animation.

    python scripts/gen_hero.py TRACE.json

TRACE.json is the output of `python tests/pipeline.py TRACE.json SAMPLE` in a
ProdPilot checkout: the whole chain run on one sample project, with the rules
failing before the fix loop, every fix contract in the order it was sent and
whether the verifier confirmed it, and the rules still failing afterwards.

The hero replays that run. The rules that end it passing light up in the order
the verifier confirmed their fixes; a rule that passes without a verified fix of
its own, because another fix created the file it checks, comes last and is
marked as such, so the page never counts it as a verified fix. The score at
every step is computed with the audit's own formula and weights, and the script
refuses to write anything unless its first and last scores equal the ones the
run recorded, so the animation cannot drift from what happened.
"""

from __future__ import annotations

import importlib.metadata
import json
import logging
import sys
from pathlib import Path

logging.disable(logging.CRITICAL)

from prodpilot import audit, rules  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "hero.json"


def score(passing: set[str], counted: set[str], stack_rules) -> int:
    """The audit's own formula: skipped rules count for nothing either way."""
    available = sum(audit.WEIGHTS[r.priority] for r in stack_rules if r.rule_id in counted)
    earned = sum(audit.WEIGHTS[r.priority] for r in stack_rules
                 if r.rule_id in counted and r.rule_id in passing)
    return round(100 * earned / available)


def main(path: Path) -> None:
    run = json.loads(path.read_text(encoding="utf-8"))
    run = run[0] if isinstance(run, list) else run
    stack = run["start"]["stack"]
    stack_rules = sorted((r for r in rules.ALL_RULES if r.stack.value == stack),
                         key=lambda r: (r.priority.value, r.rule_id))

    # Every rule's status at the start and end. A run recorded by the plain
    # harness carries failing rules only, which cannot say which rules were
    # skipped as not applicable, so statuses are required.
    try:
        was, now = run["start"]["statuses"], run["end"]["statuses"]
    except KeyError:
        sys.exit("refusing to write: the trace has no per-rule statuses")

    def having(side: dict, status: str) -> set[str]:
        return {rid for rid, s in side.items() if s == status}

    before, after = having(was, "fail"), having(now, "fail")
    skipped = having(was, "skipped")
    passing = having(was, "pass")
    counted = set(was) - skipped
    # Rules that pass by the end, having failed or not applied at the start.
    rising = having(now, "pass") - passing

    order: list[str] = []
    verified: set[str] = set()
    for step in run["applied"]:
        rid = step["rule_id"]
        if step["verified"]:
            verified.add(rid)
            if rid in rising and rid not in order:
                order.append(rid)
    # A rule can pass by the end without its own contract verifying, for example
    # when a later fix created the file it checks, or when a fix made it apply.
    # It turns green last.
    order += sorted(rising - set(order))

    first = score(passing, counted, stack_rules)
    steps = []
    for rid in order:
        passing.add(rid)
        counted.add(rid)
        steps.append({"rule": rid, "score": score(passing, counted, stack_rules),
                      "verified": rid in verified})
    last = steps[-1]["score"] if steps else first
    if first != run["start"]["score"] or last != run["gate"]["score"]:
        sys.exit(f"refusing to write: computed {first} to {last}, the run recorded "
                 f"{run['start']['score']} to {run['gate']['score']}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "sample": run["sample"],
        "stack": stack,
        "prodpilot": importlib.metadata.version("prodpilot"),
        "command": f"python tests/pipeline.py TRACE.json {run['sample']}",
        "rules": [{"id": r.rule_id, "priority": r.priority.value,
                   "weight": audit.WEIGHTS[r.priority], "fix": r.fix_type.value,
                   "text": r.description} for r in stack_rules],
        "start": {"score": first, "failing": sorted(before), "skipped": sorted(skipped),
                  "critical": run["start"]["blockers"]},
        "verified": len(verified),
        "steps": steps,
        "end": {"score": last, "failing": sorted(after),
                "skipped": sorted(having(now, "skipped")), "gate": run["gate"]["reason"]},
    }, indent=2) + "\n", encoding="utf-8")
    print(f"wrote hero.json: {run['sample']}, {len(stack_rules)} rules, {first} to {last}: "
          f"{len(verified)} fixes verified, {len(steps)} rules passing that were not")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
