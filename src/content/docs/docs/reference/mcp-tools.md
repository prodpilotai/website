---
title: MCP tools
description: The 5 tools the ProdPilot 1.0.0 MCP server registers, with their arguments, hints and real example responses.
---

<p class="pp-stamp">Generated from prodpilot 1.0.0 on 2026-09-25 by <code>scripts/gen_reference.py</code>. Do not edit this page by hand; run the script again when the package changes.</p>

The server registers **5 tools**. Your editor's agent sees exactly these names and descriptions. The descriptions below are the ones the agent reads, copied from the registration rather than paraphrased.

:::note
In 1.0.0 the server reports its own version as `1.0.0rc1`, in the ping response and the protocol handshake: the version string inside the package was not raised when the release was cut. The package itself is 1.0.0, which is what `pip show prodpilot` reports.
:::

The hints tell a client what a tool does to its environment. The protocol makes them hints, not a guard: a client may ignore them, which is why the deploy tool's description also asks the agent to confirm with you first.

## `prodpilot_ping`

**ProdPilot connectivity check**

> Confirm that the ProdPilot MCP server is running and reachable. Returns a fixed status payload. Reads no files and analyses no project.

Takes no arguments.

Hints: read only: yes, reaches outside this machine: no.

### Example: No arguments.

```json
{
  "status": "ok",
  "server": "prodpilot",
  "version": "1.0.0rc1",
  "transport": "stdio",
  "detail": "ProdPilot MCP server is running. Stack detection, the fix loop, and deployment are available."
}
```

## `prodpilot_detect_stack`

**Detect project stack and load blueprint**

> Identify whether a project directory is Node.js with Express or React with Vite, and return the production blueprint for the detected stack. The blueprint lists every file, config, and code pattern a deployment-ready project must have. Reads package.json and the project file structure only. Runs no audit and changes nothing on disk.

| Argument | Type | Required | Default |
| --- | --- | --- | --- |
| `project_path` | string | yes |  |

Hints: read only: yes, reaches outside this machine: no.

### Example: On the node_express_insecure sample.

Abridged for this page: each blueprint list shows its first item. The full response lists required_files 5, required_configs 6, required_code_patterns 17.

```json
{
  "ok": true,
  "error": null,
  "detection": {
    "project_path": "/path/to\\node_express_insecure",
    "stack": "node_express",
    "is_supported": true,
    "reason": "express is declared as a project dependency",
    "evidence": {
      "manifest_found": true,
      "manifest_readable": true,
      "declared_dependency_count": 4,
      "matched_packages": [
        "express"
      ],
      "config_files_found": []
    }
  },
  "blueprint": {
    "stack": "node_express",
    "display_name": "Node.js with Express",
    "runtime": "Node.js 20 LTS",
    "item_count": 28,
    "required_files": [
      {
        "item_id": "node.file.dockerfile",
        "requirement": "Dockerfile present at project root",
        "domain": "build",
        "priority": "P1"
      }
    ],
    "required_configs": [
      {
        "item_id": "node.config.gitignore_node_modules",
        "requirement": ".gitignore excludes node_modules",
        "domain": "git_hygiene",
        "priority": "P5"
      }
    ],
    "required_code_patterns": [
      {
        "item_id": "node.code.helmet_registered",
        "requirement": "helmet is registered before any route definition",
        "domain": "security",
        "priority": "P0"
      }
    ],
    "not_applicable_domains": []
  }
}
```

## `prodpilot_fix_instruction`

**Get the fix instruction for one failing rule**

> Return the fix contract for one rule that the audit reports as failing. The form depends on the rule. A content contract carries the exact change to make, with the file, the anchor, and the content, and must be applied exactly as given with no other edit. A constraint contract carries a requirement, a boundary, and a list of things that must not change, and you author the minimal change yourself within that boundary. Reads the project and changes nothing on disk. After applying the change, report it with prodpilot_fix_applied.

| Argument | Type | Required | Default |
| --- | --- | --- | --- |
| `project_path` | string | yes |  |
| `rule_id` | string | yes |  |

Hints: read only: yes, reaches outside this machine: no.

### Example: A content contract: SEC-002 on node_express_insecure.

```json
{
  "ok": true,
  "error": null,
  "fix": {
    "rule_id": "SEC-002",
    "fix_type": "STATIC",
    "form": "content",
    "contract": {
      "rule_id": "SEC-002",
      "action": "insert_after",
      "file_path": "src/server.js",
      "anchor": "express:before-routes",
      "content": "{\n  const helmet = require(\"helmet\");\n  app.use(helmet());\n}\n",
      "rationale": "Registers security headers before any route so every response carries them.",
      "constraint": "Apply exactly this change. If the content is already in place, leave the file as it is. Add any listed package that package.json does not already declare to its dependencies, and any listed environment key that an existing .env.example does not declare to that file as KEY=. Make no other modifications.",
      "packages": {
        "helmet": "^8.1.0"
      },
      "env": []
    }
  }
}
```

### Example: A constraint contract: STR-003 on react_vite_ready.

```json
{
  "ok": true,
  "error": null,
  "fix": {
    "rule_id": "STR-003",
    "fix_type": "DYNAMIC-DELEGATED",
    "form": "constraint",
    "contract": {
      "rule_id": "STR-003",
      "action": "author_within_constraint",
      "file_path": "src/main.jsx",
      "violation": "no error boundary is defined, so a render error blanks the page (src/main.jsx line 8)",
      "requirement": "An error boundary wraps the root of the component tree. After the change, a class component defining componentDidCatch or getDerivedStateFromError exists in the project, and that component appears as a JSX element enclosing the application root in the file that calls createRoot or ReactDOM.render.",
      "boundary": "The file that mounts the React root, and one error boundary component module it may create. No other file.",
      "forbidden": "the root component that is rendered, which must still be rendered inside the boundary; the DOM container id passed to createRoot or ReactDOM.render; the props any existing component receives; the exports of any existing component module; any provider or router already wrapping the root, whose nesting order must hold",
      "constraint": "Author the minimal change that satisfies the requirement within the boundary. Nothing outside the boundary may be touched."
    }
  }
}
```

## `prodpilot_fix_applied`

**Report an applied fix and get the verified outcome**

> Report that you have applied the fix for one rule, and receive the outcome. Your report is recorded but is never the outcome: ProdPilot re-runs that rule's own checker against the project and answers from what the checker finds. Returns resolved when the rule now passes, unresolved when it still fails and the fix should be attempted again, or blocked when the rule cannot be attempted and needs a person.

| Argument | Type | Required | Default |
| --- | --- | --- | --- |
| `project_path` | string | yes |  |
| `rule_id` | string | yes |  |
| `applied` | boolean | yes |  |
| `summary` | string | no | `""` |
| `attempt` | integer | no | `1` |

Hints: read only: yes, reaches outside this machine: no.

### Example: The agent claims STR-003 is applied on react_vite_ready without changing anything. The checker decides, not the claim.

```json
{
  "ok": true,
  "error": null,
  "rule_id": "STR-003",
  "attempt": 1,
  "outcome": "unresolved",
  "detail": "no error boundary is defined, so a render error blanks the page (src/main.jsx line 8)",
  "verified": false,
  "regressed": [],
  "verdict": {
    "rule_id": "STR-003",
    "status": "fail",
    "passed": false,
    "reason": "no error boundary is defined, so a render error blanks the page (src/main.jsx line 8)",
    "locations": [
      {
        "rule_id": "STR-003",
        "status": "fail",
        "file": "src/main.jsx",
        "line": 8,
        "detail": "no error boundary is defined, so a render error blanks the page"
      }
    ]
  },
  "claim": {
    "rule_id": "STR-003",
    "applied": true,
    "summary": "Wrapped the root in an error boundary."
  }
}
```

## `prodpilot_deploy`

**Deploy a project that passes the scoring gate**

> Run the ProdPush pipeline on a project: the scoring gate, pre-flight checks, environment sealing, a local Docker build test, a push of the generated files, a Render deployment, deploy monitoring, a post-deploy smoke test, and CI/CD wiring. Stops at the first stage that fails and says which one and why. This creates a real Render service and pushes to the project's GitHub repository, so confirm with the developer before calling it. Commit your own changes first: a working tree holding uncommitted changes outside ProdPilot's generated files is not deployed.

| Argument | Type | Required | Default |
| --- | --- | --- | --- |
| `project_path` | string | yes |  |
| `branch` | string | no | `"main"` |

Hints: read only: no, destructive: yes, idempotent: no, reaches outside this machine: yes.

### Example: On node_express_insecure, which the scoring gate refuses, so no later stage runs and nothing reaches GitHub or Render.

```json
{
  "project": "node_express_insecure",
  "ok": false,
  "url": "",
  "service_id": "",
  "failed_stage": "scoring gate",
  "steps": [
    {
      "stage": "scoring gate",
      "ok": false,
      "ran": true,
      "detail": "score 13 but 6 critical rule(s) still fail: ENV-002, SCR-001, SEC-001, SEC-002, SEC-003, SEC-004"
    },
    {
      "stage": "pre-flight",
      "ok": false,
      "ran": false,
      "detail": "not reached"
    },
    {
      "stage": "environment sealing",
      "ok": false,
      "ran": false,
      "detail": "not reached"
    },
    {
      "stage": "docker build test",
      "ok": false,
      "ran": false,
      "detail": "not reached"
    },
    {
      "stage": "git push",
      "ok": false,
      "ran": false,
      "detail": "not reached"
    },
    {
      "stage": "render deployment",
      "ok": false,
      "ran": false,
      "detail": "not reached"
    },
    {
      "stage": "deploy monitoring",
      "ok": false,
      "ran": false,
      "detail": "not reached"
    },
    {
      "stage": "post-deploy smoke test",
      "ok": false,
      "ran": false,
      "detail": "not reached"
    },
    {
      "stage": "ci/cd wiring",
      "ok": false,
      "ran": false,
      "detail": "not reached"
    }
  ],
  "summary": "node_express_insecure: stopped at scoring gate, score 13 but 6 critical rule(s) still fail: ENV-002, SCR-001, SEC-001, SEC-002, SEC-003, SEC-004"
}
```
