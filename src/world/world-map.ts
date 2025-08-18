import { BiomeData, BiomeSampler, buildSamplers, MatchBiome } from '@/world/biomes';
import { genPoints, TPoint } from '@/world/mapgen';
import { Delaunay, Voronoi } from 'd3-delaunay';

export type MapPoint = TPoint & { biome: BiomeData };

export type TRange = { xmin: number, xmax: number, ymin: number, ymax: number };

export class WorldMap {

	/**
	 * Maps "x,y" coordinates to a cell-point near x,y.
	 * Uses a record to allow negative coordinates.
	 */
	readonly points: Map<string, MapPoint> = new Map();

	tileSize: number;

	seed: string;

	rands: BiomeSampler;

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

		this.rands = buildSamplers(seed);
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
		this.rands = buildSamplers(this.seed);
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

	private buildPoints(rands: BiomeSampler, range: TRange, tileSize: number) {

		genPoints<MapPoint>(rands.points, range, tileSize, this.points);

		for (const p of this.points.values()) {

			const elev = rands.elev(p.x, p.y);
			const temp = rands.temp(p.x, p.y);
			const rain = rands.rain(p.x, p.y);
			p.biome = MatchBiome(temp, rain, elev);

		}

	}

}