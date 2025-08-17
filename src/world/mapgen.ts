import { BiomeData, MatchBiome, MaxRain, MaxTemp, MinRain, MinTemp, ParseBiomes } from '@/world/biomes';
import alea from 'alea';
import { Delaunay } from 'd3-delaunay';
import { createNoise2D } from 'simplex-noise';

// delauney mapgen modified from redblobgames
export type TMap = ReturnType<typeof MapGen>;
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

export function MapGen({ seed, width, height, tileSize = 1 }: { seed: string, tileSize?: number, width: number, height: number }) {

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
		voronoi: d.voronoi(),
		rebuild() {

			const pts = this.points;

			rebuildMap(this.rands, this.width, this.height, this.tileSize, pts);
			fillCoords(pts, this.coords);

			this.voronoi.update();

			return this;
		},
		randomize() {

			this.seed = btoa(
				String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(64))));
			this.rands = buildRandoms(this.seed);
			this.rebuild();


		}
	};

}

/**
 * Fill coordinates of Delaunay point-array
 */
export function fillCoords<T extends TPoint>(pts: T[], arr: number[]) {

	arr.length = 2 * pts.length;

	let ind: number = 0;
	for (let i = 0; i < pts.length; i++) {
		// update delaunay points.
		arr[ind++] = pts[i].x;
		arr[ind++] = pts[i].y;

	}

}

export function rebuildMap(rands: Rands, width: number, height: number,
	size: number, points: MapPoint[] = []) {

	placePoints<MapPoint>(rands.points, width, height, size, points);

	for (let i = 0; i < points.length; i++) {

		const temp = getTemp(points[i], rands.temps);
		const rain = getRain(points[i], rands.rains);
		points[i].biome = MatchBiome(temp, rain);

	}

	return points;

}

export function buildRandoms(seed: string | Uint8Array) {
	return {
		temps: createNoise2D(alea(seed + 'temp')),
		rains: createNoise2D(alea(seed + 'rain')),
		points: alea(seed + 'pts')
	}

}

export function placePoints<T extends TPoint>(
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
