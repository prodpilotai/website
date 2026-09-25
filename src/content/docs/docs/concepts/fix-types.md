---
title: Fix types
description: STATIC, DYNAMIC-PARAMETRIC and DYNAMIC-DELEGATED, the two contract forms they produce, and why 44 of 50 rules need no model to write anything.
---

Every rule has a fix type, fixed in the ruleset. The type decides who writes the change: ProdPilot, in advance or from values read out of your project, or your editor's agent, inside limits ProdPilot sets.

| Fix type | Rules | Who writes the change |
| --- | --- | --- |
| STATIC | 28 | ProdPilot, a fixed change written before your project was seen |
| DYNAMIC-PARAMETRIC | 16 | ProdPilot, a change computed from values read out of your project |
| DYNAMIC-DELEGATED | 6 | Your editor's agent, within a boundary ProdPilot sets |

44 of the 50 rules, 88 percent, are STATIC or DYNAMIC-PARAMETRIC, so no model writes anything for them. The six delegated rules are GIT-003, GIT-007, STR-001, STR-002, STR-003 and STR-004: moving database calls into a service layer, keeping route handlers thin, adding an error boundary, adding a catch-all route, and removing a secret from Git history. Each needs judgement about how a particular codebase is organised. The figure is computed by `rules.determinism_ratio()` from each rule's own fix type; see [Metrics](/docs/results/metrics/#determinism-ratio).

## The two contract forms

A fix type produces one of two forms of contract, returned by `prodpilot_fix_instruction`.

### Content: the exact change

STATIC and DYNAMIC-PARAMETRIC rules produce a **content contract**: the file, where in it, and the exact content, to be applied as given with no other edit. It also lists any package or environment key the content needs.

A STATIC contract, real output for SEC-002 on the `node_express_insecure` sample:

```json
{
  "rule_id": "SEC-002",
  "action": "insert_after",
  "file_path": "src/server.js",
  "anchor": "express:before-routes",
  "content": "{\n  const helmet = require(\"helmet\");\n  app.use(helmet());\n}\n",
  "rationale": "Registers security headers before any route so every response carries them.",
  "packages": { "helmet": "^8.1.0" },
  "env": []
}
```

A DYNAMIC-PARAMETRIC contract, real output for BLD-001 on the same sample. The entry point, `src/server.js`, and the install command were read from the project: it has no lockfile, so the Dockerfile uses `npm install` rather than `npm ci`, which refuses to run without one.

```json
{
  "rule_id": "BLD-001",
  "action": "create_file",
  "file_path": "Dockerfile",
  "content": "FROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\n\nFROM node:20-alpine AS runtime\nWORKDIR /app\nCOPY --from=build /app ./\nUSER node\nCMD [\"node\", \"src/server.js\"]\n",
  "rationale": "Builds the image from the project's own entry point and pinned runtime."
}
```

Every content contract carries the same instruction: "Apply exactly this change. If the content is already in place, leave the file as it is. Add any listed package that package.json does not already declare to its dependencies, and any listed environment key that an existing .env.example does not declare to that file as KEY=. Make no other modifications."

### Constraint: a requirement and a boundary

DYNAMIC-DELEGATED rules produce a **constraint contract**. It carries no content. It states the violation, a requirement written as a condition that is either true or false, a boundary naming the files that may change, and a list of things that must not change. The agent, which already holds the context of your codebase, writes the smallest change that satisfies it.

Real output for STR-003 on the `react_vite_ready` sample:

```json
{
  "rule_id": "STR-003",
  "action": "author_within_constraint",
  "file_path": "src/main.jsx",
  "violation": "no error boundary is defined, so a render error blanks the page (src/main.jsx line 8)",
  "requirement": "An error boundary wraps the root of the component tree. After the change, a class component defining componentDidCatch or getDerivedStateFromError exists in the project, and that component appears as a JSX element enclosing the application root in the file that calls createRoot or ReactDOM.render.",
  "boundary": "The file that mounts the React root, and one error boundary component module it may create. No other file.",
  "forbidden": "the root component that is rendered, which must still be rendered inside the boundary; the DOM container id passed to createRoot or ReactDOM.render; the props any existing component receives; the exports of any existing component module; any provider or router already wrapping the root, whose nesting order must hold",
  "constraint": "Author the minimal change that satisfies the requirement within the boundary. Nothing outside the boundary may be touched."
}
```

The requirement is phrased in the same terms the rule's checker evaluates, because that checker decides the outcome afterwards. See [Independent verification](/docs/concepts/verification/).

## When a value cannot be read

A DYNAMIC-PARAMETRIC rule needs a value from your project: the entry point, the package manager, the database driver, the route prefix. When the project is ambiguous, extraction names the candidates and refuses rather than guessing, and the rule goes to manual review with that reason. In the recorded run, 15 of 74 parametric rule instances, 20.3 percent, were refused this way, for reasons such as:

- 3 candidate entry points exist and package.json names none
- 2 lockfiles are present, so the package manager is unclear
- 2 database drivers are declared, so the pool to configure is unclear
- routes are mounted under 2 different roots, so one versioned prefix cannot be derived

The full list is in [Metrics](/docs/results/metrics/#fix-reliability-by-type).

## How reliable each type is

Deterministic does not mean always successful. In the recorded run over 23 sample projects, 159 of 177 STATIC contracts applied as written were verified, 89.8 percent, and 57 of 60 DYNAMIC-PARAMETRIC ones, 95.0 percent. Every unverified one is accounted for in [Metrics](/docs/results/metrics/). How often a live agent's delegated change passes on the first try has not been measured.
