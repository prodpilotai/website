// Draw the social preview images and the touch icon.
//
//     node scripts/og.mjs
//
// The cards are plain HTML rendered by Edge at 1200 by 630, in the site's own
// fonts and colours. Every number on them is read from the generated data, so a
// card cannot say something the site does not.

import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const hero = read('src/data/hero.json');
const reference = read('src/data/reference.json');
const mark = readFileSync(join(root, 'public/favicon.svg'), 'utf8');

// Inlined, since a page set from a string may not load local files.
const font = (pkg, file) =>
	`data:font/woff2;base64,${readFileSync(join(root, 'node_modules/@fontsource', pkg, 'files', file)).toString('base64')}`;

// The hero's gauge, same geometry and bands.
const R = 88;
const C = { x: 110, y: 104 };
const point = (v, r = R) => {
	const t = Math.PI * (1 - v / 100);
	return { x: C.x + r * Math.cos(t), y: C.y - r * Math.sin(t) };
};
const arc = (from, to, r = R) => {
	const p = point(from, r);
	const q = point(to, r);
	return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} A ${r} ${r} 0 0 1 ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
};
const end = hero.end.score;
const tip = point(end, R - 20);
const gauge = `
<svg viewBox="0 0 220 126" width="380" height="218" aria-hidden="true">
	${[[0, 39], [40, 69], [70, 89], [90, 100]].map(([a, b]) => `<path d="${arc(a + 0.8, b - 0.8)}" fill="none" stroke="#2c3b58" stroke-width="7"/>`).join('')}
	<path d="${arc(0.01, end)}" fill="none" stroke="#45d483" stroke-width="7" stroke-linecap="round"/>
	${[0, 40, 70, 90, 100].map((v) => { const p = point(v, R + 12); return `<text x="${p.x}" y="${p.y + 3}" text-anchor="middle" font-family="B612 Mono" font-size="8.5" fill="#7d8aa3">${v}</text>`; }).join('')}
	<line x1="${C.x}" y1="${C.y}" x2="${tip.x.toFixed(1)}" y2="${tip.y.toFixed(1)}" stroke="#e9edf4" stroke-width="2.5" stroke-linecap="round"/>
	<circle cx="${C.x}" cy="${C.y}" r="4" fill="#e9edf4"/>
</svg>`;

const css = `
@font-face { font-family: 'B612'; font-weight: 700; src: url(${font('b612', 'b612-latin-700-normal.woff2')}); }
@font-face { font-family: 'B612 Mono'; font-weight: 400; src: url(${font('b612-mono', 'b612-mono-latin-400-normal.woff2')}); }
@font-face { font-family: 'IBM Plex Sans'; font-weight: 400; src: url(${font('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2')}); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #0b1322; color: #e9edf4; font-family: 'IBM Plex Sans', sans-serif; }
.card { position: relative; width: 100%; height: 100%; padding: 64px 72px; display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center;
	background: radial-gradient(900px 500px at 85% 20%, #182440 0%, transparent 70%), #0b1322; }
.card::after { content: ''; position: absolute; inset: 18px; border: 1px solid #22304a; border-radius: 22px; pointer-events: none; }
.brand { display: flex; align-items: center; gap: 14px; font-family: 'B612'; font-weight: 700; font-size: 30px; margin-bottom: 40px; }
.brand svg { width: 52px; height: 52px; }
h1 { font-family: 'B612'; font-weight: 700; font-size: 50px; line-height: 1.12; letter-spacing: -0.5px; }
h1 span { display: block; color: #a3b0c6; }
.sub { margin-top: 26px; font-size: 25px; line-height: 1.45; color: #a3b0c6; max-width: 640px; }
.cmd { margin-top: 34px; display: inline-block; font-family: 'B612 Mono'; font-size: 22px; padding: 12px 18px; border: 1px solid #2c3b58; border-radius: 10px; background: #121c30; }
.cmd b { color: #f2b544; font-weight: 400; }
.panel { width: 380px; padding: 28px 0 22px; border: 1px solid #2c3b58; border-radius: 18px; background: #121c30; text-align: center; }
.score { font-family: 'B612'; font-weight: 700; font-size: 64px; margin-top: -8px; }
.score small { font-size: 26px; color: #7d8aa3; }
.band { font-family: 'B612 Mono'; font-size: 20px; color: #45d483; letter-spacing: 1px; text-transform: uppercase; }
.note { margin-top: 10px; font-family: 'B612 Mono'; font-size: 15px; color: #7d8aa3; }
.rows { list-style: none; padding: 0; width: 440px; display: grid; gap: 14px; }
.rows li { display: flex; align-items: center; gap: 16px; padding: 18px 22px; border: 1px solid #2c3b58; border-radius: 14px; background: #121c30; font-family: 'B612 Mono'; font-size: 22px; }
.rows i { width: 14px; height: 14px; border-radius: 50%; background: #45d483; box-shadow: 0 0 12px #45d48399; }
`;

const card = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="card">${body}</div></body></html>`;
const brand = `<p class="brand">${mark.replace(/<svg /, '<svg aria-hidden="true" ')}ProdPilot</p>`;

const pages = {
	home: card(`
<div>
	${brand}
	<h1>It works on localhost.<span>That was never the question.</span></h1>
	<p class="sub">${reference.rules} production rules. Every fix re-verified. Deployed to Render only when it clears the gate.</p>
	<p class="cmd"><b>$</b> pip install prodpilot</p>
</div>
<div class="panel">
	${gauge}
	<p class="score">${end}<small>/100</small></p>
	<p class="band">Production Ready</p>
	<p class="note">${hero.sample}: ${hero.start.score} to ${end}</p>
</div>`),
	docs: card(`
<div>
	${brand}
	<h1>Documentation</h1>
	<p class="sub">Install ProdPilot, connect your editor, and see how the audit, the fix loop, the gate and the deploy work.</p>
	<p class="cmd"><b>$</b> pip install prodpilot</p>
</div>
<ul class="rows">
	<li><i></i>Getting started</li>
	<li><i></i>Concepts</li>
	<li><i></i>ProdPush</li>
	<li><i></i>Reference</li>
	<li><i></i>Results</li>
</ul>`),
};

const out = join(root, 'public/og');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [name, html] of Object.entries(pages)) {
	await page.setContent(html, { waitUntil: 'load' });
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({ path: join(out, `${name}.png`) });
	console.log(`wrote public/og/${name}.png`);
}
await browser.close();

await sharp(Buffer.from(mark), { density: 400 }).resize(180, 180).flatten({ background: '#0b1322' }).png().toFile(join(root, 'public/apple-touch-icon.png'));
console.log('wrote public/apple-touch-icon.png');
