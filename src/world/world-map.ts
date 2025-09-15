import { BiomeSampler, buildSamplers } from '@/world/biomes';
import { Block, TileRange } from '@/world/block';
import { MapPoint } from '@/world/point';
import { Delaunay, Voronoi } from 'd3-delaunay';

export interface TBounds { left: number, right: number, top: number, bottom: number };

const BlockRows = 8;
const BlockCols = 8;

export class WorldMap {

	readonly blocks: Map<string, Block> = new Map();

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

		this.rebuild();

	}

	/**
	 * Get point with point data.
	 * @param x 
	 * @param y 
	 * @returns 
	 */
	getPoint(x: number, y: number) {

		const row = Math.floor(y / this.tileSize);
		const col = Math.floor(x / this.tileSize);

		// keep global point map?
		return this.blocks.get(
			Math.floor(row / BlockRows) + '_' + Math.floor(col / BlockCols)
		)?.points.get(row + "_" + col);

	}

	updateVoronoi() {
		return (this._voronoi?.update() ?? (this._voronoi = this.delaunay!.voronoi()));
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

		// TODO: don't need to rebuild all rands here.
		this.rebuild();
	}

	/**
	 * Rebuild entire map with new points and points data.
	 * Seed is not changed.
	 */
	rebuild() {

		this.fillDelaunay();
		this.updateRandData();

	}

	private fillBlocks(range: TileRange) {

		// block row,col
		const lowRow = Math.floor(range.rowStart / BlockRows);
		const lowCol = Math.floor(range.colStart / BlockCols);

		const highRow = Math.floor(range.rowEnd / BlockRows);
		const highCol = Math.floor(range.colEnd / BlockRows);

		for (let r = lowRow; r <= highRow; r++) {

			for (let c = lowCol; c <= highCol; c++) {

				const b = this.blocks.get(r + '_' + c) ?? new Block({
					tileSize: this.tileSize,
					range: {
						rowStart: r * BlockRows,
						rowEnd: (r + 1) * BlockRows,
						colStart: c * BlockRows,
						colEnd: (c + 1) * BlockRows,
					}
				});
				this.blocks.set(r + '_' + c, b);
				b.fillBlock(this.rands);

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

		this.fillBlocks(range);

		const ptCount = (bRange.rowEnd - bRange.rowStart + 1) *
			(bRange.colEnd - bRange.colStart + 1) * BlockRows * BlockCols;

		if (!this.delaunay || this.delaunay.points.length != 2 * ptCount) {
			this._voronoi = null;
			this.delaunay = new Delaunay(new Int32Array(2 * ptCount));
		}
		console.log(`ptCount: ${ptCount}`);

		this.fillCoords(bRange, this.delaunay);
		this.delaunay.update();

	}

	/**
	 * compute data for all map points.
	 */
	private updateRandData() {

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
		this.updateRandData();

	}

	randomize() {
		this.reseed(btoa(
			String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(64)))
		));
	}

	/**
	 * Points visible in bounds. These correspond in index
	 * to the delauny graph points, with same indices.
	 */
	public viewPoints: MapPoint[] = [];

	/**
	 * Fill coordinates of Delaunay point-array
	 */
	private fillCoords(bRange: TileRange, delaunay: Delaunay<MapPoint>) {

		const arr = delaunay.points as Int32Array;

		this.viewPoints.length = arr.length / 2;

		let ind: number = 0;
		let pIndex: number = 0;

		console.log(`viewPoints: ${this.viewPoints.length}`);

		for (let r = bRange.rowStart; r <= bRange.rowEnd; r++) {
			for (let c = bRange.colStart; c <= bRange.colEnd; c++) {

				const block = this.blocks.get(r + '_' + c);
				if (!block) continue;
				for (const p of block.points.values()) {

					this.viewPoints[pIndex++] = p;
					// update delaunay points.
					arr[ind++] = p.x;
					arr[ind++] = p.y;

				}
			}
		}

	}


}