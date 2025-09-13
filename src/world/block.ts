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

	readonly range: TileRange;

	/**
	 * Maps "row,col" coordinates to a cell-point near row,col.
	 * Uses a record to allow negative coordinates.
	 */
	readonly points: Map<string, MapPoint> = new Map();

	constructor(opts: {
		range: TileRange,
		tileSize: number,

	}) {

		this.tileSize = opts.tileSize;

		this.range = opts.range;

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

		const { rowStart: rstart, rowEnd: rend, colStart: cstart, colEnd: cend } = this.range;

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

		return pts;

	}

	/**
	 * compute data for all map points.
	 */
	updateRands(rands: BiomeSampler) {

		// todo: use builder object instead.
		const biomes = useBiomeStore();

		for (const p of this.points.values()) {

			p.elev = rands.elev(p.x, p.y);
			p.temp = rands.temp(p.x, p.y) / (0.2 * p.elev);
			p.rain = rands.rain(p.x, p.y) / p.elev;

			p.biome = biomes.matchBiome(p.temp, p.rain, p.elev);

		}

	}


}