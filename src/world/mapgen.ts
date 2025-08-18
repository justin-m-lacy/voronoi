import { BiomeData, MaxRain, MaxTemp, MinRain, MinTemp, ParseBiomes } from '@/world/biomes';
import alea from 'alea';
import { Delaunay } from 'd3-delaunay';
import { createNoise2D } from 'simplex-noise';

// delauney mapgen modified from redblobgames
export type TMap = ReturnType<typeof BuildMap>;
export type TPoint = { x: number, y: number }

export type MapPoint = TPoint & { biome: BiomeData };

export type Rands = ReturnType<typeof buildRandoms>;

ParseBiomes();


export const getTemp = (pt: TPoint, map: (x: number, y: number) => number) => {
	return MinTemp + (MaxTemp - MinTemp) * (map(pt.x, pt.y) + 1) / 2;
}
export const getRain = (pt: TPoint, map: (x: number, y: number) => number) => {
	return MinRain + (MaxRain - MinRain) * (map(pt.x, pt.y) + 1) / 2;
}

export function BuildMap({ seed, width, height, tileSize = 1 }: { seed: string, tileSize?: number, width: number, height: number }) {

	const coords = new Int32Array();
	const d = new Delaunay(coords);

	return {
		coords: d.points as number[],
		width,
		height,
		tileSize,
		seed,
		rands: buildRandoms(seed),
		points: new Array<MapPoint>(),
		rebuild() {
		},
		randomize() {

			this.seed = btoa(
				String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(64))));
			this.rands = buildRandoms(this.seed);
			this.rebuild();

		}
	};

}


export function buildRandoms(seed: string | Uint8Array) {
	return {
		temps: createNoise2D(alea(seed + 'temp')),
		rains: createNoise2D(alea(seed + 'rain')),
		points: alea(seed + 'pts')
	}

}

export function placePoints<T extends TPoint>(
	rand: () => number, cols: number, rows: number, tileSize: number,
	pts: T[]) {

	const jitter = 0.5;

	pts.length = cols * rows;

	// stores points in consecutive x,y coods.
	let ind: number = 0;
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {

			pts[ind++] = {
				x: tileSize * (col + jitter * (rand() - rand())),
				y: tileSize * (row + jitter * (rand() - rand()))
			} as T;

		}

	}

	return pts;

}
