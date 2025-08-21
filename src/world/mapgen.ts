import { buildSamplers } from '@/world/biomes';
import { MapPoint, TRange } from '@/world/world-map';
import { Delaunay } from 'd3-delaunay';

// delauney mapgen modified from redblobgames
export type TMap = ReturnType<typeof BuildMap>;
export type TPoint = { x: number, y: number }

export function BuildMap({ seed, width, height, tileSize = 1 }: { seed: string, tileSize?: number, width: number, height: number }) {

	const coords = new Int32Array();
	const d = new Delaunay(coords);

	return {
		coords: d.points as number[],
		width,
		height,
		tileSize,
		seed,
		rands: buildSamplers(seed),
		points: new Array<MapPoint>(),
		rebuild() {
		},
		randomize() {

			this.seed = btoa(
				String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(64))));
			this.rands = buildSamplers(this.seed);
			this.rebuild();

		}
	};

}

export function genPoints<T extends TPoint>(
	rand: () => number, range: TRange, tileSize: number,
	pts: Map<string, T>) {

	const jitter = 0.5;

	// generate on tileSize boundaries so the map generates
	// deterministically from any position.
	const rstart = Math.floor(range.ymin / tileSize);
	const rend = Math.floor(range.ymax / tileSize);

	const cstart = Math.floor(range.xmin / tileSize);
	const cend = Math.floor(range.xmax / tileSize);

	// stores points in consecutive x,y coods.
	for (let row = rstart; row <= rend; row++) {

		for (let col = cstart; col <= cend; col++) {

			pts.set(row + ',' + col, {
				x: tileSize * (col + jitter * (rand() - rand())),
				y: tileSize * (row + jitter * (rand() - rand()))
			} as T);

		}

	}

	return pts;

}
