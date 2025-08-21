import { useBiomeStore } from '@/store/biome-store';
import { BiomeData, BiomeSampler, buildSamplers } from '@/world/biomes';
import { TPoint } from '@/world/mapgen';
import { Delaunay, Voronoi } from 'd3-delaunay';

export type MapPoint = TPoint & { biome: BiomeData, elev: number, temp: number, rain: number };

export interface TBounds { left: number, right: number, top: number, bottom: number };

type TileRange = {
	rstart: number, rend: number,
	cstart: number, cend: number
}

export class WorldMap {

	/**
	 * Maps "x,y" coordinates to a cell-point near x,y.
	 * Uses a record to allow negative coordinates.
	 */
	readonly points: Map<string, MapPoint> = new Map();

	tileSize: number;

	seed: string;

	rands: BiomeSampler;

	bounds: TBounds;

	private delaunay?: Delaunay<MapPoint>;

	/**
	 * for each tile position, the maximum percent jitter
	 * from normal tile position.
	 */
	jitter: number = 0.5;

	private _voronoi: Voronoi<MapPoint> | null = null;
	get voronoi() {
		return this._voronoi ??= this.delaunay!.voronoi()
	}
	updateVoronoi() {
		return (this._voronoi?.update() ?? (this._voronoi = this.delaunay!.voronoi()));
	}

	/**
	 * Compute map tile range, rowstart, rowend, colstart,colend
	 * from absolute size range.
	 */
	private getTileRange(): TileRange {

		return {
			rstart: Math.floor(this.bounds.top / this.tileSize),
			rend: Math.floor(this.bounds.bottom / this.tileSize),
			cstart: Math.floor(this.bounds.left / this.tileSize),
			cend: Math.floor(this.bounds.right / this.tileSize),
		}


	}

	constructor({ seed, range, tileSize = 1 }: { seed: string, tileSize?: number, range: TBounds }) {

		this.tileSize = tileSize;
		this.seed = seed;

		this.bounds = range;

		this.rands = buildSamplers(seed);

		this.fillPoints();
		this.updatePointData();

	}

	/**
	 * Expand map data to fill at least this area.
	 * Map will not be shrunk if region is new region is smaller.
	 * @param rect 
	 */
	grow(rect: TBounds) {

		const prev = this.bounds;
		this.bounds = rect;
		if (rect.left == prev.left && rect.right == prev.right
			&& rect.top == prev.top && rect.bottom == prev.bottom
		) return;

		this.fillPoints();
		this.updatePointData();

	}

	/**
	 * Fill any points missing from the current map.
	 * Existing points are NOT updated with new properties
	 * if random maps have changed.
	 * @returns 
	 */
	private fillPoints() {

		const rand = this.rands.points;
		const pts = this.points;
		const tileSize = this.tileSize;
		const jitter = this.jitter;

		const { rstart, rend, cstart, cend } = this.getTileRange();

		// stores points in consecutive x,y coods.
		for (let row = rstart; row <= rend; row++) {

			for (let col = cstart; col <= cend; col++) {

				const x = tileSize * (col + jitter * (rand() - rand()));
				const y = tileSize * (row + jitter * (rand() - rand()));
				if (pts.has(row + ',' + col)) continue;
				pts.set(row + ',' + col, {
					x, y,
					elev: 0, temp: 0, rain: 0,
				} as MapPoint);
			}

		}

		if (!this.delaunay || this.delaunay.points.length != 2 * pts.size) {
			this._voronoi = null;
			this.delaunay = new Delaunay(new Int32Array(2 * pts.size));
		}
		this.fillCoords(pts.values(), this.delaunay.points as Int32Array);
		this.delaunay.update()

		return pts;

	}

	/**
	 * compute data for all map points.
	 */
	private updatePointData() {

		const rands = this.rands;
		// todo: use builder object instead.
		const biomes = useBiomeStore();

		for (const p of this.points.values()) {

			p.elev = rands.elev(p.x, p.y);
			p.temp = rands.temp(p.x, p.y) / (0.2 * p.elev);
			p.rain = rands.rain(p.x, p.y) / p.elev;

			p.biome = biomes.matchBiome(p.temp, p.rain, p.elev);

		}

	}

	randomize() {

		this.seed = btoa(
			String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(64))));
		this.rands = buildSamplers(this.seed);
		this.updatePointData();

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


}