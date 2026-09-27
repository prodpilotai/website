---
title: 8. CI/CD wiring
description: Stage 8 writes a GitHub Actions workflow that redeploys on every push, seals its secrets on your machine, and checks the pipeline is active.
---

Stage 8 writes `.github/workflows/deploy.yml`, sets the three repository secrets it reads, pushes the workflow, and asks GitHub's Actions API whether the pipeline is active.

## Deploy first, wire second

A workflow file does nothing until its secrets exist and the service is known. So the first deployment goes through the Render API in stage 5, and only then is the pipeline wired with what that returned.

## The secrets

| Secret | Source |
| --- | --- |
| `RENDER_API_KEY` | The key stored by `prodpilot setup` |
| `RENDER_SERVICE_ID` | What stage 5 stored in `.env.prodpilot` |
| `APP_URL` | What stage 5 stored in `.env.prodpilot` |

Each value is encrypted on your machine as a libsodium sealed box against the repository's public key, exactly as GitHub documents, before it is sent. A sealed box is one way: nothing in ProdPilot can decrypt what it sends.

## Why not a deploy hook

Render publishes a service's deploy hook only in its dashboard; its API has no way to read it. A pipeline built on the hook would need someone to copy it by hand. So the workflow calls Render's Trigger Deploy endpoint with the API key and the service id, which ProdPilot already holds.

The cost is stated rather than hidden: a Render API key is account wide, broader than a per service hook. If you want a narrower blast radius, give ProdPilot a key created for this purpose and revoke it when you like. See [Security model](/docs/concepts/security/#the-cicd-key).

## The generated workflow

Real output of ProdPilot 1.0.0 for an Express service, whose health path is `/health`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
      SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
    steps:
      - name: Trigger the Render deploy
        id: trigger
        run: |
          since=$(date -u +%s)
          code=$(curl --silent --show-error -o deploy.json -w "%{http_code}" -X POST -H "Authorization: Bearer $RENDER_API_KEY" -H "Accept: application/json" "https://api.render.com/v1/services/$SERVICE_ID/deploys")
          if [ "$code" = "201" ]; then
            deploy=$(python3 -c 'import json, sys; print(json.load(sys.stdin).get("id") or "")' < deploy.json)
          elif [ "$code" = "202" ]; then
            curl --fail --silent --show-error -H "Authorization: Bearer $RENDER_API_KEY" -H "Accept: application/json" "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=100" > deploys.json
            deploy=$(python3 -c 'import json, sys; from datetime import datetime; when = lambda d: datetime.fromisoformat(d["createdAt"].replace("Z", "+00:00")).timestamp(); made = sorted((i["deploy"] for i in json.load(sys.stdin) if when(i["deploy"]) >= int(sys.argv[1]) - 30), key=when); print(made[-1]["id"] if made else "")' "$since" < deploys.json)
          else
            echo "Render refused the deploy with HTTP $code"
            cat deploy.json
            exit 1
          fi
          if [ -z "$deploy" ]; then
            echo "Render accepted the deploy, but no deploy created since the trigger was found"
            exit 1
          fi
          echo "deploy=$deploy" >> "$GITHUB_OUTPUT"

      - name: Wait for that deploy to go live
        env:
          DEPLOY_ID: ${{ steps.trigger.outputs.deploy }}
        run: |
          for attempt in $(seq 1 40); do
            status=$(curl --fail --silent --show-error -H "Authorization: Bearer $RENDER_API_KEY" -H "Accept: application/json" "https://api.render.com/v1/services/$SERVICE_ID/deploys/$DEPLOY_ID" | python3 -c 'import json, sys; print(json.load(sys.stdin).get("status") or "")' || true)
            case "$status" in
              live)
                echo "deploy $DEPLOY_ID is live"
                exit 0
                ;;
              build_failed|canceled|deactivated|pre_deploy_failed|update_failed)
                echo "deploy $DEPLOY_ID ended as $status"
                exit 1
                ;;
            esac
            echo "deploy $DEPLOY_ID is ${status:-not known yet}, waiting"
            sleep 15
          done
          echo "deploy $DEPLOY_ID did not go live within 10 minutes"
          exit 1

      - name: Check the deployed service answers on /health
        run: |
          for attempt in 1 2 3 4 5 6 7 8; do
            if curl --fail --silent --show-error "${{ secrets.APP_URL }}/health" > /dev/null; then
              echo "the service answered on /health"
              exit 0
            fi
            echo "no answer yet, waiting"
            sleep 15
          done
          echo "the service did not answer on /health"
          exit 1
```

It waits for the very deploy it started, polled as [stage 6](/docs/prodpush/monitoring/) polls, before checking the service, because after a fixed wait the check could pass against the previous instance. For a React static site the check asks for the root instead of `/health`.

## Observed on a live service

An earlier version of this workflow redeployed the live demo from GitHub Actions. On 11 September 2026, ProdPilot deployed the demo, [sudais-khalid/prodpilot-demo](https://github.com/sudais-khalid/prodpilot-demo), and wired this stage; two later pushes to its `main` branch each ran the workflow, triggered a Render deploy and found the service answering on `/health`:

| Run | Commit | Result |
| --- | --- | --- |
| [34652839494](https://github.com/sudais-khalid/prodpilot-demo/actions/runs/34652839494) | `53b8a14`, chore: prodpilot production setup | success |
| [34654340484](https://github.com/sudais-khalid/prodpilot-demo/actions/runs/34654340484) | `3057cc4`, Describe the service at its root | success |

That version triggered the deploy, waited a fixed 90 seconds, then checked `/health`, so its check could pass against the previous instance while the new deploy was still building. On 15 September it was changed to wait for the very deploy it started, the workflow shown above, and every release from 1.0.0rc1 on writes that version.

## Not yet observed

The workflow as 1.0.0 writes it has not yet run against a live service. It and the secret sealing are covered by the test suite, which runs the workflow's own shell steps against scripted Render answers. Render's own automatic deploy also stays on, so a push can start a second deploy beside the workflow's; the workflow waits for the newer one. See [Known limitations](/docs/help/limitations/).
