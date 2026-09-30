# ProdPilot website

The public site for [ProdPilot](https://github.com/prodpilotai/ProdPilot): the landing page at `/` and the product documentation under `/docs/`. Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build), output as static files, served by Cloudflare Workers static assets.

This repository holds the site only. The product lives in [prodpilotai/ProdPilot](https://github.com/prodpilotai/ProdPilot).

## Commands

Node.js 22.12 or later.

| Command | Does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Serve the site locally with live reload |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run og` | Redraw the social preview images and the touch icon |
| `npm run demo` | Capture what the live demo answers into `src/data/demo.json` |

## Layout

```text
public/                 favicon, touch icon, social images, _headers, _redirects
scripts/
  gen_reference.py      rule catalog and MCP tools pages, from the installed package
  gen_hero.py           the hero animation, from a recorded run
  capture_demo.mjs      the live demo capture
  og.mjs                social preview images and touch icon
  requirements.txt      the ProdPilot version the generated pages are pinned to
src/
  components/           landing page parts: Run, Command, LiveCheck, Motion, Seo
  content/docs/docs/    the documentation, one Markdown file per page
  data/                 generated data: reference.json, hero.json, demo.json, facts.ts
  layouts/Landing.astro the landing page shell
  lib/iso.ts            isometric geometry for the hero
  pages/                index.astro, 404.astro, robots.txt.ts
  styles/               tokens.css, landing.css, docs.css
  sidebar.mjs           the documentation sidebar
  site.mjs              site URL, links, contact, team
astro.config.mjs
wrangler.toml           Cloudflare deploy config: serve dist as static assets
```

## Generated pages

Two documentation pages are written by a script that imports the installed ProdPilot package, so they cannot drift from it, and both show the version they were generated from:

- `src/content/docs/docs/reference/rules.md`, all 50 rules
- `src/content/docs/docs/reference/mcp-tools.md`, the five tools with real responses

To regenerate after a ProdPilot release, bump the version in `scripts/requirements.txt`, then:

```bash
python -m venv .venv
.venv/Scripts/pip install -r scripts/requirements.txt      # .venv/bin/pip on macOS and Linux
.venv/Scripts/python scripts/gen_reference.py --samples PATH/TO/ProdPilot/tests/samples
```

`--samples` points at a ProdPilot checkout's `tests/samples`, which the tool examples run against, on temporary copies.

The hero replays a recorded run of the fix loop. `scripts/gen_hero.py TRACE.json` refuses to write unless the scores it computes match the ones the run recorded.

## Facts and sources

Every number on the landing page links to the documentation page that states it, and every documentation page takes its figures from the product repository's own records: `docs/metrics.md`, `docs/evaluation.md`, `docs/compatibility.md` and `docs/pipeline.md`. Figures that do not come from the package are in `src/data/facts.ts`, each with its source.

## Deploying to Cloudflare

The site is served by Cloudflare Workers static assets. There is no Worker script: every request is answered from `dist`, with `public/_headers`, `public/_redirects` and the 404 page applied. `wrangler.toml` says so.

### From the dashboard, recommended

1. Push this repository to GitHub.
2. In the Cloudflare dashboard, open **Workers and Pages**, choose **Create**, then **Import a repository**, and pick it.
3. Set the build:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
4. Canonical links, the sitemap and the social image URLs are built from the site address in `src/site.mjs`, which is the live Worker, `https://website.prodpilot-ai.workers.dev`. To serve the site elsewhere, add a `PRODPILOT_SITE_URL` build variable under the Worker's **Settings**, **Build**, **Variables and secrets**.
5. Save and deploy. Every push to `main` redeploys.

Workers Builds replaces the `name` in `wrangler.toml` with the connected Worker's own name, so the two do not need to match. The Node.js version comes from `.node-version`.

### From the command line

```bash
npm run build
npx wrangler deploy
```

Wrangler asks you to log in the first time. `npx wrangler dev` serves `dist` locally the way Cloudflare will, headers and redirects included.

### Attaching a custom domain

No custom domain is set yet. To attach one:

1. In the Worker, open **Settings**, **Domains and Routes**, choose **Add**, then **Custom domain**.
2. Enter the domain, for example `prodpilot.dev` or `www.prodpilot.dev`. Its DNS must be on Cloudflare; Cloudflare creates the record and issues the certificate.
3. Wait for the domain to show as active.
4. Change `PRODPILOT_SITE_URL` to the new address, for example `https://prodpilot.dev`, and redeploy, so canonical links, the sitemap and social images use it.
5. Submit `https://<domain>/sitemap-index.xml` in Google Search Console.

## Checks before a release

- `npm run build` finishes with no errors or warnings.
- A link check over `dist/` finds no broken internal links.
- No file contains an em dash or an emoji.

## Credits

Built by Muhammad Sudais Khalid, Muhammad Farooq Khan and Muhammad Talha Khan.
