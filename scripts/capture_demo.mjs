// Capture what the live demo answers, for the pages that show it.
//
//     node scripts/capture_demo.mjs
//
// Writes src/data/demo.json: each endpoint's status, body and the security
// headers the demo sends, with the date of the capture. A visitor's browser can
// check the endpoints again live, but it cannot read these headers across
// origins, so the page shows them from this capture and says when it was made.

import { writeFile } from 'node:fs/promises';

const base = 'https://prodpilot-demo.onrender.com';
const paths = ['/', '/health', '/api/v1', '/metrics'];
const headers = [
	'content-security-policy',
	'strict-transport-security',
	'x-content-type-options',
	'x-frame-options',
	'referrer-policy',
	'cross-origin-opener-policy',
	'cross-origin-resource-policy',
	'access-control-allow-origin',
];

const endpoints = [];
let seen = {};
for (const path of paths) {
	// The first request after a quiet spell wakes a free Render service.
	const response = await fetch(base + path, { signal: AbortSignal.timeout(90_000) });
	const text = await response.text();
	const type = response.headers.get('content-type') ?? '';
	endpoints.push({
		path,
		status: response.status,
		type: type.split(';')[0],
		body: type.includes('json') ? JSON.parse(text) : text.split('\n').slice(0, 3).join('\n'),
	});
	if (path === '/health') {
		seen = Object.fromEntries(headers.map((h) => [h, response.headers.get(h)]));
	}
}

const out = {
	base,
	captured: new Date().toISOString().slice(0, 10),
	endpoints,
	headers: seen,
};
await writeFile(new URL('../src/data/demo.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`captured ${endpoints.length} endpoints from ${base} on ${out.captured}`);
