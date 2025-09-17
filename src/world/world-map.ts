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
	//bounds: TBounds;

	/**
	 * Block in range in current view. row,col bounds are inclusive.
	 */
	readonly viewBlock: TileRange;
	/**
	 * bounds of viewed blocks.
	 */
	readonly viewBounds: TBounds;

	private delaunay?: Delaunay<MapPoint>;

	/**
	 * for each tile position, the maximum percent jitter
	 * from normal tile position.
	 */
	jitter: number = 0.5;

	private _voronoi: Voronoi<MapPoint> | null = null;
	get voronoi() {
		const vor = this._voronoi ??= this.delaunay!.voronoi();
		vor.xmin = this.viewBounds.left;
		vor.xmax = this.viewBounds.right
		vor.ymin = this.viewBounds.top;
		vor.ymax = this.viewBounds.bottom;
		return vor;
	}

	/**
	 * Compute map tile range, [rowstart, rowend, colstart,colend]
	 * from absolute size range.
	 */
	private getTileRange(bnds: TBounds): TileRange {

		return {
			rowStart: Math.floor(bnds.top / this.tileSize),
			rowEnd: Math.floor(bnds.bottom / this.tileSize),
			colStart: Math.floor(bnds.left / this.tileSize),
			colEnd: Math.floor(bnds.right / this.tileSize),
		}


	}

	constructor({ seed, bounds, tileSize = 42 }: { seed: string, tileSize?: number, bounds: TBounds }) {

		this.tileSize = tileSize;
		this.seed = seed;

		this.viewBlock = {
			rowStart: -999,
			rowEnd: -999,
			colStart: -999,
			colEnd: -999
		}

		this.viewBounds = {
			left: bounds.left,
			right: bounds.right,
			top: bounds.top,
			bottom: bounds.bottom
		}
		this.rands = buildSamplers(seed);

		this.rebuild(bounds);

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
		)?.getPoint(row, col);

	}


	/**
	 * Expand map data to fill at least this area.
	 * Map will not be shrunk if region is new region is smaller.
	 * @param rect 
	 */
	grow(rect: TBounds) {
		// TODO: don't need to rebuild all rands here.
		this.rebuild(rect);
	}

	/**
	 * Rebuild entire map with new points and points data.
	 * Seed is not changed.
	 */
	rebuild(bounds: TBounds) {

		this.fillDelaunay(bounds);

	}

	private fillBlocks(blockRange: TileRange) {

		const highCol = blockRange.colEnd;

		for (let r = blockRange.rowStart; r <= blockRange.rowEnd; r++) {

			for (let c = blockRange.colStart; c <= highCol; c++) {

				if (!this.blocks.has(r + '_' + c)) {

					const b = new Block({
						tileSize: this.tileSize,
						range: {
							rowStart: r * BlockRows,
							rowEnd: (r + 1) * BlockRows,
							colStart: c * BlockCols,
							colEnd: (c + 1) * BlockCols,
						}
					});
					this.blocks.set(r + '_' + c, b);
					b.fillBlock(this.rands);
					b.updateRands(this.rands);

				}/* else {
					this.blocks.get(r + '_' + c)?.fillBlock(this.rands);
				}*/

			}

		}

	}

	/**
	 * Fill any points missing from the current map.
	 * Existing points NOT updated with new properties or positions.
	 * @returns 
	 */
	private fillDelaunay(bounds: TBounds) {

		const range = this.getTileRange(bounds);

		const bRange = {
			rowStart: Math.floor(range.rowStart / BlockRows),
			rowEnd: Math.floor(range.rowEnd / BlockRows),
			colStart: Math.floor(range.colStart / BlockCols),
			colEnd: Math.floor(range.colEnd / BlockCols)
		}

		this.fillBlocks(bRange);

		const ptCount = (bRange.rowEnd - bRange.rowStart + 1) *
			(bRange.colEnd - bRange.colStart + 1) * BlockRows * BlockCols;

		if (!this.delaunay || this.delaunay.points.length != 2 * ptCount) {

			this._voronoi = null;
			this.delaunay = new Delaunay(new Int32Array(2 * ptCount));
		}

		if (bRange.rowStart != this.viewBlock.rowStart ||
			bRange.rowEnd != this.viewBlock.rowEnd ||
			bRange.colStart != this.viewBlock.colStart ||
			bRange.colEnd != this.viewBlock.colEnd
		) {

			this.viewBounds.left = bRange.colStart * BlockCols * this.tileSize;
			this.viewBounds.top = bRange.rowStart * BlockRows * this.tileSize;
			// end block bounds inclusive - use end+1 for bounds.
			this.viewBounds.right = (bRange.colEnd + 1) * BlockCols * this.tileSize;
			this.viewBounds.bottom = (bRange.rowEnd + 1) * BlockRows * this.tileSize;

			this.viewBlock.rowStart = bRange.rowStart;
			this.viewBlock.rowEnd = bRange.rowEnd;
			this.viewBlock.colStart = bRange.colStart;
			this.viewBlock.colEnd = bRange.colEnd;

			this._voronoi = null;
			this.fillCoords(bRange, this.delaunay);
			this.delaunay.update();

		}

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

		for (let r = bRange.rowStart; r <= bRange.rowEnd; r++) {
			for (let c = bRange.colStart; c <= bRange.colEnd; c++) {

				const block = this.blocks.get(r + '_' + c);
				if (!block) {
					console.warn(`missing block: ${r},${c}`);
					continue;
				}
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