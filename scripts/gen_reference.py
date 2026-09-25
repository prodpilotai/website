"""Write the Rule catalog and MCP tools pages from the installed prodpilot.

    python scripts/gen_reference.py --samples PATH/TO/ProdPilot/tests/samples

Nothing in either page is typed by hand. The rules come from the package's own
rule store, the tools from the server's own registrations, and the example
responses from calling each tool through the server on copies of the sample
projects that ship in the ProdPilot repository. The version the pages were
generated against is written onto both, so a reader can tell when they drift
from the package.

The samples are copied to a temporary folder first, so a run never touches the
repository they came from. The deploy example uses a sample the scoring gate
refuses, so it stops before anything reaches GitHub or Render.
"""

from __future__ import annotations

import argparse
import asyncio
import datetime as dt
import importlib.metadata
import json
import logging
import shutil
import tempfile
from collections import Counter
from pathlib import Path

logging.disable(logging.CRITICAL)

from prodpilot import rules, server  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "src" / "content" / "docs" / "docs" / "reference"
DATA = ROOT / "src" / "data" / "reference.json"

VERSION = importlib.metadata.version("prodpilot")

DOMAINS = {
    "security": "Security",
    "secrets": "Secrets",
    "environment": "Environment",
    "build": "Build",
    "connectivity": "Connectivity",
    "api": "API",
    "structure": "Structure",
    "observability": "Observability",
    "git_hygiene": "Git hygiene",
}
STACKS = {"node_express": "Node.js with Express", "react_vite": "React with Vite"}
CHECKS = {"ast": "Syntax tree", "file_existence": "File check", "entropy_scan": "Entropy scan"}
SCOPES = {"file": "One file", "cross_file": "Across files"}


def stamp(today: str) -> str:
    return (
        f'<p class="pp-stamp">Generated from prodpilot {VERSION} on {today} by '
        f"<code>scripts/gen_reference.py</code>. Do not edit this page by hand; "
        f"run the script again when the package changes.</p>\n"
    )


def cell(text: str) -> str:
    return text.replace("|", "\\|").replace("\n", " ")


def rule_page(today: str) -> str:
    every = sorted(rules.ALL_RULES, key=lambda r: r.rule_id)
    by_stack = Counter(r.stack.value for r in every)
    by_type = Counter(r.fix_type.value for r in every)
    ratio = rules.determinism_ratio()
    lines = [
        "---",
        "title: Rule catalog",
        f"description: All {len(every)} rules in the frozen ProdPilot {VERSION} ruleset, "
        "grouped by domain, with each rule's stack, priority, check and fix type.",
        "---",
        "",
        stamp(today),
        f"ProdPilot {VERSION} checks **{len(every)} rules**: "
        f"{by_stack['node_express']} for {STACKS['node_express']} and "
        f"{by_stack['react_vite']} for {STACKS['react_vite']}. A project is audited "
        "against the rules for its own stack only.",
        "",
        "| Fix type | Rules |",
        "| --- | --- |",
    ]
    for fix in ("STATIC", "DYNAMIC-PARAMETRIC", "DYNAMIC-DELEGATED"):
        lines.append(f"| {fix} | {by_type[fix]} |")
    lines += [
        "",
        f"`rules.determinism_ratio()` returns **{ratio:.2f}**: {by_type['STATIC'] + by_type['DYNAMIC-PARAMETRIC']} "
        f"of {len(every)} rules are fixed with no model writing anything. See "
        "[Fix types](/docs/concepts/fix-types/) for what each type means, and "
        "[Score bands and gate policy](/docs/reference/score-bands/) for how priority "
        "weighs in the score.",
        "",
        "How to read a row: the priority runs from P0, critical, to P5. **Checked by** "
        "is how the audit decides the rule: a syntax tree of your JavaScript, a check "
        "of the files present, or an entropy scan for credential-shaped strings. "
        "**Scope** says whether the rule looks at one file at a time or across files.",
        "",
    ]
    for domain, label in DOMAINS.items():
        group = [r for r in every if r.domain.value == domain]
        if not group:
            continue
        lines += [
            f"## {label}",
            "",
            "| Rule | Stack | Priority | Checked by | Scope | Fix type | Requirement |",
            "| --- | --- | --- | --- | --- | --- | --- |",
        ]
        for r in group:
            lines.append(
                f"| `{r.rule_id}` | {STACKS[r.stack.value]} | {r.priority.value} | "
                f"{CHECKS[r.check_type.value]} | {SCOPES[r.scope.value]} | "
                f"{r.fix_type.value} | {cell(r.description)} |"
            )
        lines.append("")
    return "\n".join(lines)


def schema_rows(schema: dict) -> list[str]:
    props = schema.get("properties") or {}
    required = set(schema.get("required") or [])
    if not props:
        return ["Takes no arguments.", ""]
    rows = ["| Argument | Type | Required | Default |", "| --- | --- | --- | --- |"]
    for name, spec in props.items():
        default = f"`{json.dumps(spec['default'])}`" if "default" in spec else ""
        rows.append(
            f"| `{name}` | {spec.get('type', '')} | {'yes' if name in required else 'no'} | {default} |"
        )
    return rows + [""]


def hints(annotations: dict | None) -> str:
    if not annotations:
        return "none"
    names = {
        "readOnlyHint": "read only",
        "destructiveHint": "destructive",
        "idempotentHint": "idempotent",
        "openWorldHint": "reaches outside this machine",
    }
    return ", ".join(f"{names.get(k, k)}: {'yes' if v else 'no'}" for k, v in annotations.items())


def trimmed(payload: dict, tool: str) -> tuple[dict, str]:
    """Shorten the one response too long to show whole, saying so."""
    if tool != "prodpilot_detect_stack" or not payload.get("blueprint"):
        return payload, ""
    shown = json.loads(json.dumps(payload))
    blueprint = shown["blueprint"]
    note = []
    for key in ("required_files", "required_configs", "required_code_patterns"):
        items = blueprint.get(key)
        if isinstance(items, list) and len(items) > 1:
            note.append(f"{key} {len(items)}")
            blueprint[key] = items[:1]
    text = ("Abridged for this page: each blueprint list shows its first item. The full "
            "response lists " + ", ".join(note) + ".") if note else ""
    return shown, text


async def examples(samples: Path) -> dict[str, list[tuple[str, dict, str]]]:
    work = Path(tempfile.mkdtemp(prefix="prodpilot-site-"))
    try:
        for name in ("node_express_insecure", "react_vite_ready"):
            shutil.copytree(samples / name, work / name)
        insecure = str(work / "node_express_insecure")
        react = str(work / "react_vite_ready")
        calls = {
            "prodpilot_ping": [("No arguments.", {})],
            "prodpilot_detect_stack": [
                ("On the node_express_insecure sample.", {"project_path": insecure}),
            ],
            "prodpilot_fix_instruction": [
                ("A content contract: SEC-002 on node_express_insecure.",
                 {"project_path": insecure, "rule_id": "SEC-002"}),
                ("A constraint contract: STR-003 on react_vite_ready.",
                 {"project_path": react, "rule_id": "STR-003"}),
            ],
            "prodpilot_fix_applied": [
                ("The agent claims STR-003 is applied on react_vite_ready without changing "
                 "anything. The checker decides, not the claim.",
                 {"project_path": react, "rule_id": "STR-003", "applied": True,
                  "summary": "Wrapped the root in an error boundary."}),
            ],
            "prodpilot_deploy": [
                ("On node_express_insecure, which the scoring gate refuses, so no later "
                 "stage runs and nothing reaches GitHub or Render.",
                 {"project_path": insecure}),
            ],
        }
        s = server.build_server()
        out: dict[str, list[tuple[str, dict, str]]] = {}
        for tool, cases in calls.items():
            for caption, args in cases:
                result = await s.call_tool(tool, args)
                payload = result.structured_content or json.loads(result.content[0].text)
                text = json.dumps(payload, indent=2)
                payload = json.loads(text.replace(str(work).replace("\\", "\\\\"), "/path/to")
                                     .replace(str(work), "/path/to"))
                shown, note = trimmed(payload, tool)
                out.setdefault(tool, []).append((caption, shown, note))
        return out
    finally:
        shutil.rmtree(work, ignore_errors=True)


def tools_page(today: str, tools, samples: dict) -> str:
    lines = [
        "---",
        "title: MCP tools",
        f"description: The {len(tools)} tools the ProdPilot {VERSION} MCP server registers, "
        "with their arguments, hints and real example responses.",
        "---",
        "",
        stamp(today),
        f"The server registers **{len(tools)} tools**. Your editor's agent sees exactly "
        "these names and descriptions. The descriptions below are the ones the agent "
        "reads, copied from the registration rather than paraphrased.",
        "",
        ":::note",
        f"In {VERSION} the server reports its own version as `1.0.0rc1`, in the ping "
        "response and the protocol handshake: the version string inside the package "
        "was not raised when the release was cut. The package itself is "
        f"{VERSION}, which is what `pip show prodpilot` reports.",
        ":::",
        "",
        "The hints tell a client what a tool does to its environment. The protocol "
        "makes them hints, not a guard: a client may ignore them, which is why the "
        "deploy tool's description also asks the agent to confirm with you first.",
        "",
    ]
    for t in tools:
        d = t.model_dump(by_alias=True, exclude_none=True)
        lines += [
            f"## `{t.name}`",
            "",
            f"**{d.get('title', '')}**",
            "",
            f"> {cell(d.get('description', ''))}",
            "",
        ]
        lines += schema_rows(d.get("inputSchema") or {})
        lines += [f"Hints: {hints(d.get('annotations'))}.", ""]
        for caption, payload, note in samples.get(t.name, []):
            lines += [f"### Example: {caption}", ""]
            if note:
                lines += [note, ""]
            lines += ["```json", json.dumps(payload, indent=2), "```", ""]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--samples", type=Path, required=True,
                        help="tests/samples in a ProdPilot checkout at the pinned version")
    args = parser.parse_args()
    today = dt.date.today().isoformat()

    tools = asyncio.run(server.build_server().list_tools())
    samples = asyncio.run(examples(args.samples))

    DOCS.mkdir(parents=True, exist_ok=True)
    (DOCS / "rules.md").write_text(rule_page(today), encoding="utf-8")
    (DOCS / "mcp-tools.md").write_text(tools_page(today, tools, samples), encoding="utf-8")

    every = rules.ALL_RULES
    by_type = Counter(r.fix_type.value for r in every)
    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(json.dumps({
        "version": VERSION,
        "generated": today,
        "rules": len(every),
        "by_stack": dict(Counter(r.stack.value for r in every)),
        "by_fix_type": dict(by_type),
        "deterministic": by_type["STATIC"] + by_type["DYNAMIC-PARAMETRIC"],
        "determinism_ratio": rules.determinism_ratio(),
        "tools": [t.name for t in tools],
    }, indent=2) + "\n", encoding="utf-8")
    print(f"wrote rules.md, mcp-tools.md and reference.json from prodpilot {VERSION}")


if __name__ == "__main__":
    main()
