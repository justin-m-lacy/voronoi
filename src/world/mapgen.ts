import { BiomeData, MatchBiome, MaxRain, MaxTemp, MinRain, MinTemp, ParseBiomes } from '@/world/biomes';
import { VoronoiMap } from '@/world/d3-delaunay';
import alea from 'alea';
import { createNoise2D } from 'simplex-noise';

// delauney mapgen modified from redblobgames
export type TMap = ReturnType<typeof MapGen>;
export type TPoint = { x: number, y: number }

export type MapPoint = TPoint & { biome: BiomeData };

type Rands = ReturnType<typeof buildRandoms>;

ParseBiomes();


const getTemp = (pt: TPoint, map: (x: number, y: number) => number) => {
	return MinTemp + (MaxTemp - MinTemp) * (map(pt.x, pt.y) + 1) / 2;
}
const getRain = (pt: TPoint, map: (x: number, y: number) => number) => {
	return MinRain + (MaxRain - MinRain) * (map(pt.x, pt.y) + 1) / 2;
}

export function MapGen({ seed, width, height, tileSize = 1 }: { seed: string, tileSize?: number, width: number, height: number }) {

	const rands = buildRandoms(seed);
	const points = rebuild(width, height, tileSize, rands) as MapPoint[];

	return {
		rands,
		points: rebuild(width, height, tileSize, rands),
		voronoi: VoronoiMap({ points, width, height, tileSize }),
		randomize() {

			this.rands = buildRandoms(window.crypto.getRandomValues(new Uint8Array(64)));
			const pts = rebuild(width, height, tileSize, this.rands, this.points);

			// to avoid knowledge of delaunay point structure, provide initial array
			// in delaunay constructor.
			const dpoints = this.voronoi.delaunay.points as any as Int32Array | Float64Array;

			for (let i = 0; i < pts.length; i++) {
				// update delaunay points.
				dpoints[2 * i] = pts[i].x;
				dpoints[2 * i + 1] = pts[i].y;

			}

			this.voronoi.update();

		}
	}

}

function buildRandoms(seed: string | Uint8Array) {
	return {
		temps: createNoise2D(alea(seed + 'temp')),
		rains: createNoise2D(alea(seed + 'rain')),
		points: alea(seed + 'pts')
	}

}

function rebuild(width: number, height: number, tileSize: number, rands: Rands,
	points: MapPoint[] = []) {

	randPoints<MapPoint>(rands.points, width, height, tileSize, points);

	for (let i = 0; i < points.length; i++) {

		const temp = getTemp(points[i], rands.temps);
		const rain = getRain(points[i], rands.rains);
		points[i].biome = MatchBiome(temp, rain);

	}

	return points;

}


function randPoints<T extends TPoint>(
	rand: () => number, width: number, height: number, tileSize: number,
	pts: T[]) {

	const jitter = 0.5;

	pts.length = width * height;

	// stores points in consecutive x,y coods.
	let ind: number = 0;
	for (let x = 0; x < width; x++) {

		for (let y = 0; y < height; y++) {

			pts[ind++] = {
				x: tileSize * (x + jitter * (rand() - rand())),
				y: tileSize * (y + jitter * (rand() - rand()))
			} as T;

		}


	}

	return pts;

}
