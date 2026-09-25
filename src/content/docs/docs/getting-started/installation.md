---
title: Installation
description: What ProdPilot needs on your machine, how to install it with pipx, uv or pip, and how to check the install.
---

## What you need

| Requirement | Why |
| --- | --- |
| Python 3.11, 3.12, 3.13 or 3.14 | ProdPilot itself |
| Node.js 20 or later | The audit parses your JavaScript with Node |
| Docker, running | The gate and the deploy build your project in a container first |
| git, and a GitHub repository set as the project's `origin` | Deploys push the files ProdPilot generated |
| A GitHub token | A classic token with the `repo` and `workflow` scopes, or a fine grained one with read and write access to contents, secrets and workflows, and read access to actions |
| A Render account and API key | Render is where the project is deployed |
| VS Code with GitHub Copilot, Cursor, or Windsurf (now Devin) | The editor whose agent calls ProdPilot's tools |

Auditing and fixing need Python, Node.js and your editor. Docker is needed from the scoring gate onwards, because the gate builds the project to estimate whether it will deploy. git and the two credentials are needed for the deploy itself.

## Install

The package is [`prodpilot` on PyPI](https://pypi.org/project/prodpilot/).

| Method | Command |
| --- | --- |
| pipx, recommended | `pipx install prodpilot` |
| uv | `uv tool install prodpilot` |
| pip | `pip install prodpilot` |
| From source | `git clone https://github.com/prodpilotai/ProdPilot && cd ProdPilot && pip install .` |

pipx and uv are recommended because ProdPilot is a command line tool: they keep it and its dependencies in their own environment, so it cannot clash with the packages of the project you are working on. That matters here because ProdPilot pins scikit-learn to 1.9.0, the version that saved the model it ships, and only that version is guaranteed to read the model.

To pin the release this site describes, ask for `prodpilot==1.0.0`.

## Check the install

```text
$ prodpilot --help

 Usage: prodpilot [OPTIONS] COMMAND [ARGS]...

 ProdPilot MCP server.

+- Options ---------------------------------------------------------------------------+
| --help          Show this message and exit.                                         |
+-------------------------------------------------------------------------------------+
+- Commands --------------------------------------------------------------------------+
| serve    Serve the ProdPilot MCP server over stdio.                                 |
| setup    Store the GitHub token and Render API key for this developer.              |
| doctor   Report whether ProdPilot's prerequisites are in place.                     |
| connect  Connect an IDE's agent to ProdPilot, naming this machine's prodpilot       |
|          command.                                                                   |
+-------------------------------------------------------------------------------------+
```

That is the real output of version 1.0.0. `pip show prodpilot` reports the installed version.

## Upgrade

Use the same tool you installed with: `pipx upgrade prodpilot`, `uv tool upgrade prodpilot`, or `pip install --upgrade prodpilot`.

## Supported platforms

The test suite runs on Linux, macOS and Windows for Python 3.11 to 3.14, and the built package is installed and its model loaded on all three. ProdPilot is developed on Windows 11. See [Contributing](/docs/help/contributing/#tests) for the suite.

Next: the [Quickstart](/docs/getting-started/quickstart/).
