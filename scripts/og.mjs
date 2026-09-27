// Draw the social preview images and the touch icon.
//
//     node scripts/og.mjs
//
// The cards are plain HTML rendered by Edge at 1200 by 630, in the site's own
// fonts and colours. Every number on them is read from the generated data, so a
// card cannot say something the site does not. The home card follows the
// landing page's hero, headline and recorded run; the docs card follows the docs.

import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const hero = read('src/data/hero.json');
const mark = readFileSync(join(root, 'public/favicon.svg'), 'utf8');

// Inlined, since a page set from a string may not load local files.
const font = (pkg, file) =>
	`data:font/woff2;base64,${readFileSync(join(root, 'node_modules', pkg, 'files', file)).toString('base64')}`;

const end = hero.end.score;

// ---- Home: the landing page's hero, headline first, the recorded run beside --

// The gauge, same geometry as the hero's.
const R = 80;
const C = { x: 100, y: 96 };
const point = (v, r = R) => {
	const t = Math.PI * (1 - v / 100);
	return { x: C.x + r * Math.cos(t), y: C.y - r * Math.sin(t) };
};
const arc = (from, to, r = R) => {
	const p = point(from, r);
	const q = point(to, r);
	return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} A ${r} ${r} 0 0 1 ${q.x.toFixed(2)} ${q.y.toFixed(2)}`;
};
const gauge = `
<svg viewBox="0 0 200 108" width="220" height="119" aria-hidden="true">
	${[[0, 39], [40, 69], [70, 89], [90, 100]].map(([a, b]) => `<path d="${arc(a + 0.8, b - 0.8)}" fill="none" stroke="rgba(239,232,222,0.12)" stroke-width="9"/>`).join('')}
	<path d="${arc(0.01, end)}" fill="none" stroke="#45d483" stroke-width="9" stroke-linecap="round"/>
</svg>`;

// Four rows that between them show every way a rule ended the run.
const text = Object.fromEntries(hero.rules.map((r) => [r.id, r.text]));
const verified = hero.steps.filter((s) => s.verified);
const carried = hero.steps.filter((s) => !s.verified);
const sample = [
	{ id: verified[0].rule, said: 'verified', ok: true },
	{ id: verified[1].rule, said: 'verified', ok: true },
	{ id: carried[0].rule, said: 'passes, file exists', ok: true },
	{ id: hero.end.failing[0], said: 'manual review', ok: false },
];
const rows = sample
	.map((r) => `<li class="${r.ok ? 'ok' : 'bad'}"><i></i><b>${r.id}</b><span>${text[r.id]}</span><em>${r.said}</em></li>`)
	.join('');
const gateLine = `Gate clear: ${hero.end.gate.split(',')[0]}.`;

const homeCss = `
@font-face { font-family: 'Newsreader'; font-weight: 200 800; src: url(${font('@fontsource-variable/newsreader', 'newsreader-latin-opsz-normal.woff2')}); }
@font-face { font-family: 'Newsreader'; font-style: italic; font-weight: 200 800; src: url(${font('@fontsource-variable/newsreader', 'newsreader-latin-opsz-italic.woff2')}); }
@font-face { font-family: 'IBM Plex Mono'; font-weight: 400; src: url(${font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')}); }
@font-face { font-family: 'IBM Plex Sans'; font-weight: 400; src: url(${font('@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2')}); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #0a0908; padding: 14px; display: grid; grid-template-columns: 640px 1fr; gap: 14px; font-family: 'IBM Plex Sans', sans-serif; }
.side { background: #d8cec2; color: #1c1814; border-radius: 16px; padding: 38px 44px; display: flex; flex-direction: column; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 12px; font-family: 'Newsreader'; font-size: 30px; }
.brand svg { width: 40px; height: 40px; }
h1 { font-family: 'Newsreader'; font-weight: 340; font-size: 74px; line-height: 0.96; letter-spacing: -2.4px; }
h1 em { display: block; font-style: italic; font-weight: 320; color: #574d43; margin-top: 6px; }
.cmd { font-family: 'IBM Plex Mono'; font-size: 20px; padding: 13px 16px; border: 1px solid rgba(28,24,20,0.2); border-radius: 8px; background: rgba(28,24,20,0.05); align-self: flex-start; }
.stage { background: radial-gradient(70% 55% at 40% 40%, rgba(226,189,121,0.07), transparent 70%), #0f0e0c; border-radius: 16px; padding: 30px 30px 26px; display: flex; flex-direction: column; gap: 18px; color: #efe8de; }
.head { font-family: 'IBM Plex Mono'; font-size: 13px; letter-spacing: 1.5px; color: #aaa196; }
.head b { font-weight: 400; color: #efe8de; letter-spacing: 0; margin-left: 8px; }
.dial { display: flex; align-items: center; gap: 22px; }
.score { font-family: 'Newsreader'; font-weight: 300; font-size: 70px; line-height: 1; letter-spacing: -2px; }
.score small { font-size: 22px; color: #aaa196; letter-spacing: 0; }
.band { font-family: 'IBM Plex Mono'; font-size: 14px; letter-spacing: 1.5px; color: #45d483; margin-top: 6px; }
ul { list-style: none; padding: 0; border-top: 1px solid rgba(239,232,222,0.12); }
li { display: grid; grid-template-columns: 10px 76px 1fr auto; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid rgba(239,232,222,0.08); font-size: 14px; }
li i { width: 8px; height: 8px; border-radius: 50%; }
li.ok i { background: #45d483; box-shadow: 0 0 8px #45d483aa; }
li.bad i { background: #ff6b61; box-shadow: 0 0 8px #ff6b61aa; }
li b { font-family: 'IBM Plex Mono'; font-weight: 400; font-size: 13px; }
li span { color: #aaa196; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
li em { font-style: normal; font-family: 'IBM Plex Mono'; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
li.ok em { color: #45d483; }
li.bad em { color: #ff6b61; }
.gate { margin-top: auto; font-family: 'IBM Plex Mono'; font-size: 14px; color: #45d483; line-height: 1.45; }
`;

const home = `<!doctype html><html><head><meta charset="utf-8"><style>${homeCss}</style></head><body>
<div class="side">
	<p class="brand"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="19" fill="none" stroke="#1c1814" stroke-width="3.5"/><path d="M22.5 32.5l6.5 6.5 12.5-13.5" fill="none" stroke="#1c1814" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="47.5" cy="16.5" r="3.6" fill="#b86e12"/></svg>ProdPilot</p>
	<h1>It works on localhost. <em>That was never the question.</em></h1>
	<p class="cmd">$ pip install prodpilot</p>
</div>
<div class="stage">
	<p class="head">RECORDED RUN<b>${hero.sample}</b></p>
	<div class="dial">${gauge}<div><p class="score">${end}<small>/100</small></p><p class="band">PRODUCTION READY</p></div></div>
	<ul>${rows}</ul>
	<p class="gate">${gateLine}<br><span style="color:#aaa196">${hero.verified} verified, ${hero.steps.length - hero.verified} pass once their file exists, ${hero.end.failing.length} left for review</span></p>
</div>
</body></html>`;

// ---- Docs: the night stage, with the sections as a ledger ------------------

const docsCss = `
@font-face { font-family: 'Newsreader'; font-weight: 200 800; src: url(${font('@fontsource-variable/newsreader', 'newsreader-latin-opsz-normal.woff2')}); }
@font-face { font-family: 'IBM Plex Mono'; font-weight: 400; src: url(${font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')}); }
@font-face { font-family: 'IBM Plex Sans'; font-weight: 400; src: url(${font('@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2')}); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #0a0908; padding: 14px; color: #efe8de; font-family: 'IBM Plex Sans', sans-serif; }
.card { height: 100%; border-radius: 16px; padding: 56px 64px; display: grid; grid-template-columns: 1fr 400px; gap: 56px; align-items: center;
	background: radial-gradient(60% 70% at 80% 40%, rgba(226,189,121,0.09), transparent 70%), #0f0e0c; }
.brand { display: flex; align-items: center; gap: 12px; font-family: 'Newsreader'; font-size: 32px; margin-bottom: 40px; }
.brand svg { width: 44px; height: 44px; }
.label { font-family: 'IBM Plex Mono'; font-size: 15px; letter-spacing: 3px; color: #aaa196; margin-bottom: 14px; }
h1 { font-family: 'Newsreader'; font-weight: 340; font-size: 70px; line-height: 1; letter-spacing: -2px; }
.sub { margin-top: 24px; font-size: 22px; line-height: 1.45; color: #aaa196; max-width: 560px; }
.rows { list-style: none; padding: 0; border-top: 1px solid rgba(239,232,222,0.14); }
.rows li { display: flex; align-items: center; gap: 18px; padding: 19px 4px; border-bottom: 1px solid rgba(239,232,222,0.14); font-family: 'IBM Plex Mono'; font-size: 20px; letter-spacing: 1px; }
.rows i { width: 9px; height: 9px; border-radius: 50%; background: #45d483; box-shadow: 0 0 12px #45d483aa; }
`;

const docs = `<!doctype html><html><head><meta charset="utf-8"><style>${docsCss}</style></head><body><div class="card">
<div>
	<p class="brand">${mark.replace(/<svg /, '<svg aria-hidden="true" ')}ProdPilot</p>
	<p class="label">DOCUMENTATION</p>
	<h1>How it works, and how to use it</h1>
	<p class="sub">Install ProdPilot, connect your editor, and read how the audit, the fix loop, the gate and the deploy work.</p>
</div>
<ul class="rows">
	<li><i></i>Getting started</li>
	<li><i></i>Concepts</li>
	<li><i></i>ProdPush</li>
	<li><i></i>Reference</li>
	<li><i></i>Results</li>
</ul>
</div></body></html>`;

const out = join(root, 'public/og');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [name, html] of Object.entries({ home, docs })) {
	await page.setContent(html, { waitUntil: 'load' });
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({ path: join(out, `${name}.png`) });
	console.log(`wrote public/og/${name}.png`);
}
await browser.close();

await sharp(Buffer.from(mark), { density: 400 }).resize(180, 180).flatten({ background: '#0f0e0c' }).png().toFile(join(root, 'public/apple-touch-icon.png'));
console.log('wrote public/apple-touch-icon.png');
