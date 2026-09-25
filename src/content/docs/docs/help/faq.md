---
title: FAQ
description: Short answers to common questions about what ProdPilot does, what it supports, and what it sends where.
---

## Does ProdPilot use an AI model?

Not to write or judge fixes. It calls no AI service. The agent already in your editor does the writing; ProdPilot tells it what to change and checks the result with the rule's own checker. The only model inside ProdPilot is the gate's deployability estimate, a small classifier that ships in the package and runs locally.

## Which stacks does it support?

Two: Node.js with Express, and React with Vite. Anything else is detected as unrecognised and refused at the gate, with the reason. See [Known limitations](/docs/help/limitations/).

## Where can it deploy?

Render only. Express projects go out as web services on the free plan, React projects as static sites. See [Render deployment](/docs/prodpush/render-deploy/).

## Which editors does it work with?

VS Code with GitHub Copilot, Cursor, and Windsurf, now Devin. These are the three clients it was tested in. See the [compatibility matrix](/docs/results/compatibility/).

## Will the agent deploy without asking me?

That depends on the client. VS Code asks before each tool's first call, Devin asks before every call, and Cursor on its fresh-install default asks before none. The deploy tool's description tells the agent to confirm with you first, but a server cannot force a client to ask. In Cursor, turn on approval for tool calls if you want to confirm every deploy.

## Does it commit my code?

No. It commits only the files it generated, and stops if you have uncommitted changes of your own, rather than deploying code that is not in your repository. See [Git push](/docs/prodpush/git-push/).

## What leaves my machine?

Pushes of the generated files, repository secrets encrypted on your machine, and workflow status go to GitHub. The service, your sealed environment values, deploy status and logs go to Render. Docker Hub and the npm registry are used while your project builds. There is no telemetry. See [Security model](/docs/concepts/security/#what-leaves-your-machine).

## What happens when a fix does not work?

Each rule gets three attempts. After that it goes to manual review with the reason, and the loop moves on. A change that breaks a rule which passed before is undone. See [The bounded loop](/docs/concepts/bounded-loop/).

## Why was a project that scores 99 refused?

The score is one of three conditions. The model also has to estimate that the project will really deploy, and a project that cannot build, such as a React project with no `index.html`, gets a very low estimate. See [The scoring gate](/docs/concepts/scoring-gate/).

## Do I need Docker?

Yes, running, for the gate and the deploy: both build your project in a container first. See [Installation](/docs/getting-started/installation/).

## Which operating systems and Python versions?

Python 3.11 to 3.14. ProdPilot is developed on Windows 11, and its test suite runs on Linux, macOS and Windows for every supported Python version.

## Is it free?

ProdPilot is open source under the [MIT license](https://github.com/prodpilotai/ProdPilot/blob/main/LICENSE). It creates Render services on the free plan.

## Who built it?

Muhammad Sudais Khalid, Muhammad Farooq Khan and Muhammad Talha Khan, as their final year project.
