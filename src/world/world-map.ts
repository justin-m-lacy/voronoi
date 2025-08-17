import { BiomeData, MatchBiome } from '@/world/biomes';
import { buildRandoms, getRain, getTemp, placePoints, TPoint } from '@/world/mapgen';
import alea from 'alea';
import { Delaunay, Voronoi } from 'd3-delaunay';
import { createNoise2D } from 'simplex-noise';

export type MapPoint = TPoint & { biome: BiomeData };
type Rands = ReturnType<typeof buildRandoms>;

export class WorldMap {

	readonly points: MapPoint[];

	width: number;
	height: number;
	tileSize: number;

	seed: string;

	rands: Rands;

	delaunay: Delaunay<MapPoint>;

	get voronoi() {
		return this._voronoi ??= this.delaunay.voronoi()
	}

	private _voronoi: Voronoi<MapPoint> | null = null;

	constructor({ seed, width, height, tileSize = 1 }: { seed: string, tileSize?: number, width: number, height: number }) {

		this.width = width;
		this.height = height;
		this.tileSize = tileSize;
		this.seed = seed;

		this.rands = this.initRandoms(seed);
		this.points = this.buildPoints(this.rands, width, height, tileSize);

		const arr = new Int32Array(2 * this.points.length);
		this.fillCoords(this.points, arr);
		this.delaunay = new Delaunay(arr);

	}

	rebuild() {

		const pts = this.points;

		this.buildPoints(this.rands, this.width, this.height, this.tileSize, pts);

		if (this.delaunay.points.length != 2 * this.points.length) {
			this.delaunay.points = new Int32Array(2 * this.points.length);
		}
		this.fillCoords(this.points, this.delaunay.points as Int32Array);

		this.voronoi.update();

		return this;
	}

	randomize() {

		this.seed = btoa(
			String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(64))));
		this.rands = buildRandoms(this.seed);
		this.rebuild();


	}

	/**
	 * Fill coordinates of Delaunay point-array
	 */
	private fillCoords<T extends TPoint>(pts: T[], arr: Int32Array) {

		let ind: number = 0;
		for (let i = 0; i < pts.length; i++) {
			// update delaunay points.
			arr[ind++] = pts[i].x;
			arr[ind++] = pts[i].y;

		}

	}

	private initRandoms(seed: string | Uint8Array) {
		return {
			temps: createNoise2D(alea(seed + 'temp')),
			rains: createNoise2D(alea(seed + 'rain')),
			points: alea(seed + 'pts')
		}

	}

	private buildPoints(rands: Rands, width: number, height: number,
		size: number, points: MapPoint[] = []) {

		placePoints<MapPoint>(rands.points, width, height, size, points);

		for (let i = 0; i < points.length; i++) {

			const temp = getTemp(points[i], rands.temps);
			const rain = getRain(points[i], rands.rains);
			points[i].biome = MatchBiome(temp, rain);

		}

		return points;

	}

}