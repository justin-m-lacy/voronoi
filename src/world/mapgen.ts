import { BiomeData, MaxRain, MaxTemp, MinRain, MinTemp, ParseBiomes } from '@/world/biomes';
import { TRange } from '@/world/world-map';
import alea from 'alea';
import { Delaunay } from 'd3-delaunay';
import { createNoise2D } from 'simplex-noise';

// delauney mapgen modified from redblobgames
export type TMap = ReturnType<typeof BuildMap>;
export type TPoint = { x: number, y: number }

export type MapPoint = TPoint & { biome: BiomeData };

export type Rands = ReturnType<typeof buildRandoms>;

ParseBiomes();

const TempScale = 1200;
const RainScale = 1500;

export const getTemp = (pt: TPoint, map: (x: number, y: number) => number) => {
	return MinTemp + (MaxTemp - MinTemp) * (map(pt.x / TempScale, pt.y / TempScale) + 1) / 2;
}
export const getRain = (pt: TPoint, map: (x: number, y: number) => number) => {
	return MinRain + (MaxRain - MinRain) * (map(pt.x / RainScale, pt.y / RainScale) + 1) / 2;
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

	console.log(`row: ${rstart}->${rend}  col: ${cstart}->${cend}`)
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
