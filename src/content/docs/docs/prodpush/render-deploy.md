---
title: 5. Render deployment
description: Stage 5 creates the Render service from your GitHub repository, passes your sealed values through the API, and stores the identifiers it gets back.
---

Stage 5 creates a service on Render from the repository stage 4 pushed to, and starts its first deploy. Render is the only deployment target in version 1.

## How each stack is deployed

| Stack | Render service | Build command | Start command | Answers on |
| --- | --- | --- | --- | --- |
| Node.js with Express | Web service, Node runtime, free plan | `npm install` | `npm start` | `/health` |
| React with Vite | Static site, publishing `dist` | `npm install && npm run build` | none | `/` |

This mapping is the one used to deploy the 684 projects the gate's model was trained on, so the deploy and the data behind the gate agree on how a stack runs. A built front end has no process to start, and deploying one as a web service failed every time, so React projects go out as static sites.

## The request

`POST https://api.render.com/v1/services`, with the shape taken from Render's published API reference. For an Express project:

```json
{
  "type": "web_service",
  "name": "<repository name>",
  "ownerId": "<your workspace id>",
  "repo": "https://github.com/<owner>/<repository>",
  "branch": "main",
  "envVars": [{ "key": "PORT", "value": "..." }],
  "serviceDetails": {
    "runtime": "node",
    "plan": "free",
    "envSpecificDetails": { "buildCommand": "npm install", "startCommand": "npm start" }
  }
}
```

The workspace id is looked up once from `/owners`, since the credential store holds only the API key.

## Secrets travel one way

The sealed values go in `envVars` in this request and nowhere else. The sealed file was never staged, so by this point the values exist only on your machine and in the request body.

## What is stored

Render answers with the service and the first deploy. Three identifiers are written to the project's gitignored `.env.prodpilot`, so later stages, and later runs, do not have to ask again:

| Key | Holds |
| --- | --- |
| `PRODPILOT_SERVICE_ID` | The Render service |
| `PRODPILOT_DEPLOY_ID` | The most recent deploy |
| `PRODPILOT_SERVICE_URL` | The live URL |

The live URL is read from the service details, where Render puts it. See [Configuration files](/docs/reference/configuration/).

An error from Render stops the stage with the method, the path, the HTTP status and Render's own message.
