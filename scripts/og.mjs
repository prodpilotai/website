// Draw the social preview images and the touch icon.
//
//     node scripts/og.mjs
//
// The cards are plain HTML rendered by Edge at 1200 by 630, in the site's own
// fonts and colours. Every number on them is read from the generated data, so a
// card cannot say something the site does not. The home card follows the
// landing page; the docs card follows the docs.

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

// ---- Home: the landing page's stone panel and night stage -----------------

// The stage's pyramid, projected with the same camera as the canvas.
const HEIGHT = 1.35;
const project = ([x, y, z], yaw = 0.6, pitch = 0.12, dist = 6, focal = 760, cx = 360, cy = 250) => {
	const x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
	const z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
	const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
	const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
	const k = focal / (z2 + dist);
	return [cx + x1 * k, cy - y2 * k];
};
const square = (y, s) => [[-s, y, -s], [s, y, -s], [s, y, s], [-s, y, s]];
const poly = (pts, closed) => pts.map((p) => project(p)).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + (closed ? ' Z' : '');
const lines = [
	...[0, 1, 2, 3, 4].map((k) => {
		const y = (k / 5) * HEIGHT;
		return poly(square(y, 1 - y / HEIGHT), true);
	}),
	...square(0, 1).map((c) => poly([c, [0, HEIGHT, 0]], false)),
];
const slab = [poly(square(-0.04, 1.14), true), poly(square(-0.2, 1.14), true)];
const [bx, by] = project([0, -0.2, 0]);
const [fx, fy] = project([0, -1.05, 0]);
const pyramid = `
<svg viewBox="0 0 700 520" width="700" height="520" aria-hidden="true">
	<defs>
		<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#fff0d2" stop-opacity="0.55"/>
			<stop offset="1" stop-color="#ffd696" stop-opacity="0.08"/>
		</linearGradient>
		<radialGradient id="pool">
			<stop offset="0" stop-color="#fff0d6" stop-opacity="0.85"/>
			<stop offset="0.3" stop-color="#ecbe78" stop-opacity="0.3"/>
			<stop offset="1" stop-color="#ecbe78" stop-opacity="0"/>
		</radialGradient>
		<filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>
	</defs>
	<path d="M${bx - 40} ${by} L${bx + 40} ${by} L${fx + 70} ${fy} L${fx - 70} ${fy} Z" fill="url(#beam)"/>
	<ellipse cx="${fx}" cy="${fy}" rx="260" ry="70" fill="url(#pool)"/>
	${slab.map((d) => `<path d="${d}" fill="#0c0b0a" stroke="rgba(255,238,205,0.2)"/>`).join('')}
	<g fill="none" stroke-linecap="round" stroke-linejoin="round">
		<g stroke="#d6a052" stroke-opacity="0.55" stroke-width="5" filter="url(#glow)">${lines.map((d) => `<path d="${d}"/>`).join('')}</g>
		<g stroke="#ffeecd" stroke-width="1.4">${lines.map((d) => `<path d="${d}"/>`).join('')}</g>
	</g>
</svg>`;

const homeCss = `
@font-face { font-family: 'Newsreader'; font-weight: 200 800; src: url(${font('@fontsource-variable/newsreader', 'newsreader-latin-opsz-normal.woff2')}); }
@font-face { font-family: 'Newsreader'; font-style: italic; font-weight: 200 800; src: url(${font('@fontsource-variable/newsreader', 'newsreader-latin-opsz-italic.woff2')}); }
@font-face { font-family: 'B612 Mono'; font-weight: 400; src: url(${font('@fontsource/b612-mono', 'b612-mono-latin-400-normal.woff2')}); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #0a0908; padding: 14px; font-family: sans-serif; display: grid; grid-template-columns: 430px 1fr; gap: 14px; }
.side { background: #d8cec2; color: #1c1814; border-radius: 16px; padding: 38px 40px; display: flex; flex-direction: column; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 12px; font-family: 'Newsreader'; font-size: 32px; }
.brand svg { width: 44px; height: 44px; }
h1 { font-family: 'Newsreader'; font-weight: 360; font-size: 58px; line-height: 1; letter-spacing: -1.3px; }
h1 em { display: block; font-style: italic; font-weight: 330; color: #574d43; margin-top: 8px; }
.cmd { font-family: 'B612 Mono'; font-size: 19px; padding: 12px 16px; border: 1px solid rgba(28,24,20,0.2); border-radius: 8px; background: rgba(28,24,20,0.05); }
.stage { position: relative; background: radial-gradient(60% 55% at 50% 58%, rgba(226,189,121,0.08), transparent 70%), #0f0e0c; border-radius: 16px; overflow: hidden; }
.stage svg { position: absolute; left: 34px; top: 40px; }
.read { position: absolute; left: 34px; top: 34px; font-family: 'B612 Mono'; color: #aaa196; font-size: 14px; letter-spacing: 1px; }
.score { font-family: 'Newsreader'; font-weight: 300; font-size: 76px; color: #efe8de; line-height: 1; margin-top: 10px; letter-spacing: -2px; }
.score small { font-size: 24px; color: #aaa196; letter-spacing: 0; }
.band { color: #45d483; margin-top: 8px; font-size: 15px; letter-spacing: 2px; }
.foot { position: absolute; left: 34px; right: 34px; bottom: 30px; font-family: 'B612 Mono'; font-size: 16px; color: #aaa196; display: flex; justify-content: space-between; }
`;

const home = `<!doctype html><html><head><meta charset="utf-8"><style>${homeCss}</style></head><body>
<div class="side">
	<p class="brand"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="19" fill="none" stroke="#1c1814" stroke-width="3.5"/><path d="M22.5 32.5l6.5 6.5 12.5-13.5" fill="none" stroke="#1c1814" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="47.5" cy="16.5" r="3.6" fill="#b86e12"/></svg>ProdPilot</p>
	<h1>It works on localhost. <em>That was never the question.</em></h1>
	<p class="cmd">$ pip install prodpilot</p>
</div>
<div class="stage">
	${pyramid}
	<div class="read">RECORDED RUN<p class="score">${end}<small>/100</small></p><p class="band">PRODUCTION READY</p></div>
	<p class="foot"><span>${hero.sample}, ${hero.start.score} to ${end}</span></p>
</div>
</body></html>`;

// ---- Docs: the night stage, with the sections as a ledger ------------------

const docsCss = `
@font-face { font-family: 'Newsreader'; font-weight: 200 800; src: url(${font('@fontsource-variable/newsreader', 'newsreader-latin-opsz-normal.woff2')}); }
@font-face { font-family: 'B612 Mono'; font-weight: 400; src: url(${font('@fontsource/b612-mono', 'b612-mono-latin-400-normal.woff2')}); }
@font-face { font-family: 'IBM Plex Sans'; font-weight: 400; src: url(${font('@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2')}); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #0a0908; padding: 14px; color: #efe8de; font-family: 'IBM Plex Sans', sans-serif; }
.card { height: 100%; border-radius: 16px; padding: 56px 64px; display: grid; grid-template-columns: 1fr 400px; gap: 56px; align-items: center;
	background: radial-gradient(60% 70% at 80% 40%, rgba(226,189,121,0.09), transparent 70%), #0f0e0c; }
.brand { display: flex; align-items: center; gap: 12px; font-family: 'Newsreader'; font-size: 32px; margin-bottom: 40px; }
.brand svg { width: 44px; height: 44px; }
.label { font-family: 'B612 Mono'; font-size: 15px; letter-spacing: 3px; color: #aaa196; margin-bottom: 14px; }
h1 { font-family: 'Newsreader'; font-weight: 340; font-size: 70px; line-height: 1; letter-spacing: -2px; }
.sub { margin-top: 24px; font-size: 22px; line-height: 1.45; color: #aaa196; max-width: 560px; }
.rows { list-style: none; padding: 0; border-top: 1px solid rgba(239,232,222,0.14); }
.rows li { display: flex; align-items: center; gap: 18px; padding: 19px 4px; border-bottom: 1px solid rgba(239,232,222,0.14); font-family: 'B612 Mono'; font-size: 20px; letter-spacing: 1px; }
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
