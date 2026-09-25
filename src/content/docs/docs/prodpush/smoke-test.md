---
title: 7. Post-deploy smoke test
description: Stage 7 checks the live service over real traffic, with five checks that must all pass. Includes a real run against the live demo.
---

Stage 7 reads the live service. It changes nothing. A deployment is confirmed only when all five checks pass.

| Check | Passes when |
| --- | --- |
| Health probe | The health path answers 200, retried with backoff for up to 90 seconds |
| API response | The API route answers with neither 404 nor 500 |
| Security headers | Every response carries all four: `content-security-policy`, `x-frame-options`, `x-content-type-options`, `referrer-policy` |
| CORS headers | Every response carries `access-control-allow-origin` |
| Stack traces | No response body contains a stack trace |

## Why 90 seconds

A free tier service that has gone to sleep can take most of a minute to wake. The probe waits 1, 2, 4, 8 and then 15 seconds between attempts, within a 90 second window, so a service that is merely asleep is not failed.

## Which paths are asked for

An Express service is probed on `/health`, which the audit's OBS-001 requires. For the API route, a project that versions its routes, as the audit's API-002 asks, correctly answers `/api` with 404. So the smoke test asks for the project's first versioned route, read from the same route mounts the audit checks. A React project is a static site with no API, and is asked for its root.

## Why check headers the audit already checked

SEC-002 proves in the source that helmet is registered before any route. A proxy or a platform can still strip a header the application sets, and only live traffic shows that. The header names are the audit's own list, so the two cannot disagree. Every response must carry them: `/health` with the headers and the API route without them is a real gap.

## Real output, against the live demo

Run on 25 September 2026 against [prodpilot-demo.onrender.com](https://prodpilot-demo.onrender.com/), the demo project, with the versioned route `/api/v1`:

```json
{
  "url": "https://prodpilot-demo.onrender.com",
  "confirmed": true,
  "attempts": 1,
  "waited": 0.5,
  "checks": [
    { "check": "health probe", "ok": true, "detail": "answered 200 after 1 attempt(s)" },
    { "check": "api response", "ok": true, "detail": "/api/v1 returned 200" },
    { "check": "security headers", "ok": true, "detail": "all 4 security headers on every response" },
    { "check": "cors headers", "ok": true, "detail": "access-control-allow-origin is * on every response" },
    { "check": "stack traces", "ok": true, "detail": "no stack trace in 2 response body(ies)" }
  ],
  "failed": []
}
```

Any one failed check leaves the deployment unconfirmed, and the report names which check and why. A service that answers `/health` but leaks a stack trace is not partly deployed: it should not be trusted.
