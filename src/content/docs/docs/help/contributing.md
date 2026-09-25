---
title: Contributing
description: How to set up ProdPilot from source, run its test suite, and send a change.
---

ProdPilot is developed in the open at [prodpilotai/ProdPilot](https://github.com/prodpilotai/ProdPilot), under the MIT license.

## Set up from source

```bash
git clone https://github.com/prodpilotai/ProdPilot
cd ProdPilot
python -m venv .venv
.venv/bin/pip install -e . --group dev     # on Windows: .venv\Scripts\pip; needs pip 25.1 or later
.venv/bin/python -m pytest
```

You need the same things a user does: Python 3.11 to 3.14, Node.js 20 or later, git, and Docker if you want the tests that build real images to run.

## Tests

At the v1.0.0 tag, commit `7b7693f`, the suite collects **1,799 tests**:

```bash
python -m pytest --collect-only -q
```

- **No live service.** Every Render and GitHub call is scripted, and the build check's tests script Docker too.
- **Docker when available.** Tests that build a real image with the local daemon are skipped when no daemon is running.
- **Real samples.** The sample projects under `tests/samples/` are minimal but genuine, each with a real `package.json` and entry point. Several are broken on purpose.
- **Launch commands.** `tests/test_clients.py` starts the server with the exact command the committed IDE configurations name, so a configuration that drifts from what works fails the suite.

The Tests workflow runs the suite on Linux, macOS and Windows for Python 3.11, 3.12, 3.13 and 3.14, and builds the wheel on all three systems, installs it outside the repository and loads the shipped model. That is 15 jobs; all 15 passed on the v1.0.0 commit.

## The whole chain

`tests/pipeline.py` runs the audit, the fix loop, the gate and all nine deploy stages on the sample projects, with Render and GitHub scripted, and records a trace:

```bash
python tests/pipeline.py OUT.json                 # every sample
python tests/pipeline.py OUT.json node_express_insecure
python tests/pipeline.py --markdown OUT.json      # the tables in pipeline.md
python tests/pipeline.py --metrics OUT.json       # the tables in metrics.md
```

## Sending a change

- Open an issue before a large change.
- Run the suite before sending a pull request.
- Architecture, the model and the data are described in [architecture.md](https://github.com/prodpilotai/ProdPilot/blob/main/docs/architecture.md).

Questions and bug reports go to [GitHub Issues](https://github.com/prodpilotai/ProdPilot/issues). Report a vulnerability privately through the [Security tab](https://github.com/prodpilotai/ProdPilot/security).
