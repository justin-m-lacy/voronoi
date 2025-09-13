import { BiomeSampler, buildSamplers } from '@/world/biomes';
import { Block, TileRange } from '@/world/block';
import { MapPoint } from '@/world/point';
import { Delaunay, Voronoi } from 'd3-delaunay';

export interface TBounds { left: number, right: number, top: number, bottom: number };

const BlockRows = 10;
const BlockCols = 10;

export class WorldMap {

	readonly blocks: Map<string, Block> = new Map();

	/**
	 * Maps "x,y" coordinates to a cell-point near x,y.
	 * Uses a record to allow negative coordinates.
	 */
	readonly points: Map<string, MapPoint> = new Map();

	tileSize: number;

	seed: string;

	rands: BiomeSampler;

	/**
	 * bounds of current view.
	 */
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
			rowStart: Math.floor(this.bounds.top / this.tileSize),
			rowEnd: Math.floor(this.bounds.bottom / this.tileSize),
			colStart: Math.floor(this.bounds.left / this.tileSize),
			colEnd: Math.floor(this.bounds.right / this.tileSize),
		}


	}

	constructor({ seed, bounds, tileSize = 24 }: { seed: string, tileSize?: number, bounds: TBounds }) {

		this.tileSize = tileSize;
		this.seed = seed;

		this.bounds = bounds;

		this.rands = buildSamplers(seed);

		this.fillDelaunay();
		this.updatePointData();

	}

	/**
	 * Expand map data to fill at least this area.
	 * Map will not be shrunk if region is new region is smaller.
	 * @param rect 
	 */
	grow(rect: TBounds) {

		const cur = this.bounds;
		if (rect.left == cur.left && rect.right == cur.right
			&& rect.top == cur.top && rect.bottom == cur.bottom
		) return;

		cur.left = rect.left;
		cur.right = rect.right;
		cur.top = rect.top;
		cur.bottom = rect.bottom;

		this.fillDelaunay();
		this.updatePointData();

	}

	/**
	 * Rebuild entire map with new points and points data.
	 * Seed is not changed.
	 */
	rebuild() {

		this.fillDelaunay();
		this.updatePointData();

	}

	fillBlocks(r0: number, r1: number, c0: number, c1: number) {

		// block row,col
		const lowRow = Math.floor(r0 / BlockRows);
		const lowCol = Math.floor(c0 / BlockCols);

		const highRow = Math.floor(r1 / BlockRows);
		const highCol = Math.floor(c1 / BlockRows);

		for (let r = lowRow; r <= highRow; r++) {

			for (let c = lowCol; c <= highCol; c++) {

				if (!this.blocks.has(r + '_' + c)) {

					const b = new Block({
						tileSize: this.tileSize,
						range: {
							rowStart: r * BlockRows,
							rowEnd: (r + 1) * BlockRows,
							colStart: c * BlockRows,
							colEnd: (c + 1) * BlockRows,
						}
					});
					this.blocks.set(r + '_' + c, b);
					b.fillBlock(this.rands)

				} else {
					this.blocks.get(r + '_' + c)?.fillBlock(this.rands);
				}

			}

		}

	}

	/**
	 * Fill any points missing from the current map.
	 * Existing points NOT updated with new properties or positions.
	 * @returns 
	 */
	private fillDelaunay() {

		const range = this.getTileRange();

		const bRange = {
			rowStart: Math.floor(range.rowEnd / BlockRows),
			colStart: Math.floor(range.colStart / BlockCols),

			rowEnd: Math.floor(range.rowEnd / BlockRows),
			colEnd: Math.floor(range.colEnd / BlockRows)
		}

		const ptCount = (bRange.rowEnd - bRange.rowStart + 1) * (bRange.colEnd - bRange.colStart + 1) * BlockRows * BlockCols;

		if (!this.delaunay || this.delaunay.points.length != 2 * ptCount) {
			this._voronoi = null;
			this.delaunay = new Delaunay(new Int32Array(2 * ptCount));
		}
		this.fillCoords(bRange, this.delaunay.points as Int32Array);
		this.delaunay.update();

	}

	/**
	 * compute data for all map points.
	 */
	private updatePointData() {

		for (const s of this.blocks.values()) {
			s.updateRands(this.rands);
		}

	}

	/**
	 * Redraw map with current bounds using new seed data.
	 */
	reseed(seed: string) {

		this.seed = seed;
		this.rands = buildSamplers(this.seed);
		this.updatePointData();

	}

	randomize() {
		this.reseed(btoa(
			String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(64)))
		));
	}

	/**
	 * Fill coordinates of Delaunay point-array
	 */
	private fillCoords(bRange: TileRange, arr: Int32Array) {

		let ind: number = 0;

		for (let r = bRange.rowStart; r <= bRange.rowEnd; r++) {
			for (let c = bRange.colStart; c <= bRange.colEnd; c++) {

				const block = this.blocks.get(r + '_' + c);
				if (!block) continue;
				for (const p of block.points.values()) {
					// update delaunay points.
					arr[ind++] = p.x;
					arr[ind++] = p.y;
				}
			}
		}

	}


}