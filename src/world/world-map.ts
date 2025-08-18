import { BiomeData, MatchBiome } from '@/world/biomes';
import { buildRandoms, getRain, getTemp, placePoints, TPoint } from '@/world/mapgen';
import alea from 'alea';
import { Delaunay, Voronoi } from 'd3-delaunay';
import { createNoise2D } from 'simplex-noise';

export type MapPoint = TPoint & { biome: BiomeData };
type Rands = ReturnType<typeof buildRandoms>;

export class WorldMap {

	readonly points: MapPoint[];

	cols: number;
	rows: number;
	tileSize: number;

	seed: string;

	rands: Rands;

	delaunay: Delaunay<MapPoint>;

	get maxWidth() { return (this.cols) * this.tileSize }
	get maxHeight() { return (this.rows) * this.tileSize }

	get voronoi() {
		return this._voronoi ??= this.delaunay.voronoi()
	}

	private _voronoi: Voronoi<MapPoint> | null = null;

	constructor({ seed, cols, rows, tileSize = 1 }: { seed: string, tileSize?: number, cols: number, rows: number }) {

		this.cols = cols;
		this.rows = rows;
		this.tileSize = tileSize;
		this.seed = seed;

		this.rands = this.initRandoms(seed);
		this.points = this.buildPoints(this.rands, cols, rows, tileSize);

		const arr = new Int32Array(2 * this.points.length);
		this.fillCoords(this.points, arr);
		this.delaunay = new Delaunay(arr);

	}

	rebuild() {

		const pts = this.points;

		this.buildPoints(this.rands, this.cols, this.rows, this.tileSize, pts);

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

	private buildPoints(rands: Rands, cols: number, rows: number,
		size: number, points: MapPoint[] = []) {

		placePoints<MapPoint>(rands.points, cols, rows, size, points);

		for (let i = 0; i < points.length; i++) {

			const temp = getTemp(points[i], rands.temps);
			const rain = getRain(points[i], rands.rains);
			points[i].biome = MatchBiome(temp, rain);

		}

		return points;

	}

}