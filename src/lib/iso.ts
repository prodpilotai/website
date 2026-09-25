// Isometric geometry for the hero's pillar field. One pillar per rule, laid out
// on a grid, drawn back to front so nearer pillars cover farther ones. Shared by
// the server render and the browser animation so both draw the same picture.

export type State = 'failed' | 'checking' | 'verified' | 'idle';

export interface Rule {
	id: string;
	priority: string;
	weight: number;
	fix: string;
	text: string;
}

export const COLS = 7;
export const TILE = { a: 30, b: 17 }; // half width and half height of a floor tile
export const GAP = 5; // space between neighbouring pillars
export const FLAT = 8; // height of a failing rule: it sits low
export const IDLE = 3; // height of a rule that does not apply

// A verified pillar's height grows with the weight the audit gives its
// priority, so the finished field is the score drawn in three dimensions.
export function tall(weight: number): number {
	return 24 + Math.log2(weight) * 16;
}

export function origin(index: number, rows: number) {
	const col = index % COLS;
	const row = Math.floor(index / COLS);
	return {
		x: (col - row) * TILE.a + rows * TILE.a,
		y: (col + row) * TILE.b + 120,
		depth: col + row,
	};
}

const f = (n: number) => n.toFixed(1);

export function faces(x: number, y: number, h: number) {
	const a = TILE.a - GAP;
	const b = TILE.b - (GAP * TILE.b) / TILE.a;
	const top = [
		[x, y - b - h],
		[x + a, y - h],
		[x, y + b - h],
		[x - a, y - h],
	];
	const left = [
		[x - a, y - h],
		[x, y + b - h],
		[x, y + b],
		[x - a, y],
	];
	const right = [
		[x + a, y - h],
		[x, y + b - h],
		[x, y + b],
		[x + a, y],
	];
	const pts = (p: number[][]) => p.map(([px, py]) => `${f(px)},${f(py)}`).join(' ');
	return { top: pts(top), left: pts(left), right: pts(right) };
}

export function box(count: number) {
	const rows = Math.ceil(count / COLS);
	return {
		rows,
		width: (COLS + rows) * TILE.a,
		height: (COLS + rows) * TILE.b + 140,
	};
}
