import { useBiomeStore } from '@/store/biome-store';
import { BiomeSampler } from '@/world/biomes';
import { MapPoint } from '@/world/point';


export type TileRange = {
	rowStart: number, rowEnd: number,
	colStart: number, colEnd: number
}

export class Block {

	tileSize: number;

	/**
	 * for each tile position, the maximum percent jitter
	 * from normal tile position.
	 */
	jitter: number = 0.5;

	/**
	 * actual tile rows,cols covered by block.
	 * end row,col NOT inclusive.
	 */
	readonly range: TileRange;

	/**
	 * Flat map of points arranged by row,col offset in this block.
	 */
	readonly points: MapPoint[];

	/**
	 * true if points have their links set.
	 */
	hasLinks: boolean = false;

	readonly rows: number;
	readonly cols: number;

	constructor(opts: {
		range: TileRange,
		tileSize: number,

	}) {

		this.tileSize = opts.tileSize;
		this.range = opts.range;

		this.rows = this.range.rowEnd - this.range.rowStart;
		this.cols = this.range.colEnd - this.range.colStart;

		this.points = new Array(this.rows * this.cols);

	}

	/**
	 * Get point within block. [row,col] is global map row,col
	 * row,col must be within the block or an error results.
	 * @param row 
	 * @param col 
	 * @returns 
	 */
	getPoint(row: number, col: number) {
		return this.points[
			(row - this.range.rowStart) * this.cols +
			(col - this.range.colStart)];
	}

	/**
	 * Fill any points missing from the current map.
	 * Existing points NOT updated with new properties or positions.
	 * @returns 
	 */
	fillBlock(rands: BiomeSampler) {

		const rand = rands.points;
		const pts = this.points;
		const tileSize = this.tileSize;
		const jitter = this.jitter;

		let colStart = this.range.colStart;
		let colEnd = this.range.colEnd;

		let row = this.range.rowStart;
		let col = this.range.colStart;

		// stores points in consecutive x,y coods.
		for (let i = 0; i < this.points.length; i++) {

			pts[i] = {
				x: tileSize * (col + jitter * (rand() - rand())),
				y: tileSize * (row + jitter * (rand() - rand())),
				elev: 0, temp: 0, rain: 0,
			} as MapPoint;
			if (col++ > colEnd) {
				col = colStart;
				row++;
			}

		}

		return pts;

	}

	/**
	 * compute data for all map points.
	 */
	updateRands(rands: BiomeSampler) {

		// todo: use builder object instead.
		const biomes = useBiomeStore();

		for (let i = 0; i < this.points.length; i++) {

			const p = this.points[i];
			p.elev = rands.elev(p.x, p.y);
			p.temp = rands.temp(p.x, p.y) / (0.2 * p.elev);
			p.rain = rands.rain(p.x, p.y) / p.elev;

			p.biome = biomes.matchBiome(p.temp, p.rain, p.elev);

		}

	}


}