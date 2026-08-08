export type OutlinePoint = {
	readonly x: number;
	readonly y: number;
};

export type SelectedOutline = {
	readonly key: string;
	readonly dimensions: {
		readonly width: number;
		readonly height: number;
	} | null;
	readonly uncroppedPoints:
		| readonly [OutlinePoint, OutlinePoint, OutlinePoint, OutlinePoint]
		| null;
	readonly points: readonly [
		OutlinePoint,
		OutlinePoint,
		OutlinePoint,
		OutlinePoint,
	];
};

export const clamp = (value: number, min: number, max: number): number => {
	return Math.min(max, Math.max(min, value));
};

export const mix = (from: number, to: number, progress: number): number => {
	return from + (to - from) * progress;
};

export const mixPoint = (
	from: OutlinePoint,
	to: OutlinePoint,
	progress: number,
): OutlinePoint => {
	return {
		x: mix(from.x, to.x, progress),
		y: mix(from.y, to.y, progress),
	};
};

export const getSelectedOutlineHandleSize = (
	points: SelectedOutline['points'],
): number => {
	const [tl, tr, br] = points;
	const width = Math.hypot(tr.x - tl.x, tr.y - tl.y);
	const height = Math.hypot(br.x - tr.x, br.y - tr.y);
	return clamp(Math.min(width, height) / 10, 4, 12);
};
