import { BiomeData, MatchBiome } from '@/world/biomes';
import { buildRandoms, genPoints, getRain, getTemp, TPoint } from '@/world/mapgen';
import alea from 'alea';
import { Delaunay, Voronoi } from 'd3-delaunay';
import { createNoise2D } from 'simplex-noise';

export type MapPoint = TPoint & { biome: BiomeData };
type Rands = ReturnType<typeof buildRandoms>;

export type TRange = { xmin: number, xmax: number, ymin: number, ymax: number };

export class WorldMap {

	/**
	 * Maps "x,y" coordinates to a cell-point near x,y.
	 * Uses a record to allow negative coordinates.
	 */
	readonly points: Map<string, MapPoint> = new Map();

	tileSize: number;

	seed: string;

	rands: Rands;

	range: TRange;

	delaunay: Delaunay<MapPoint>;

	get maxWidth() { return this.range.xmax - this.range.xmin }
	get maxHeight() { return this.range.ymax - this.range.ymin }

	get voronoi() {
		return this._voronoi ??= this.delaunay.voronoi()
	}

	private _voronoi: Voronoi<MapPoint> | null = null;

	constructor({ seed, range, tileSize = 1 }: { seed: string, tileSize?: number, range: TRange }) {

		this.tileSize = tileSize;
		this.seed = seed;

		this.range = range;

		this.rands = this.initRandoms(seed);
		this.buildPoints(this.rands, range, tileSize);

		const arr = new Int32Array(2 * this.points.size);
		this.fillCoords(this.points.values(), arr);
		this.delaunay = new Delaunay(arr);

	}

	rebuild() {

		this.buildPoints(this.rands, this.range, this.tileSize);

		if (this.delaunay.points.length != 2 * this.points.size) {
			this.delaunay.points = new Int32Array(2 * this.points.size);
		}
		this.fillCoords(this.points.values(), this.delaunay.points as Int32Array);

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
	private fillCoords<T extends TPoint>(pts: Iterable<T>, arr: Int32Array) {

		let ind: number = 0;
		for (const p of pts) {
			// update delaunay points.
			arr[ind++] = p.x;
			arr[ind++] = p.y;
		}

	}

	private initRandoms(seed: string | Uint8Array) {
		return {
			temps: createNoise2D(alea(seed + 'temp')),
			rains: createNoise2D(alea(seed + 'rain')),
			points: alea(seed + 'pts')
		}

	}

	private buildPoints(rands: Rands, range: TRange, tileSize: number) {

		genPoints<MapPoint>(rands.points, range, tileSize, this.points);

		for (const p of this.points.values()) {

			const temp = getTemp(p, rands.temps);
			const rain = getRain(p, rands.rains);
			p.biome = MatchBiome(temp, rain);

		}

	}

}