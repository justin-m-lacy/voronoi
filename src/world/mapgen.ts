import { TBounds } from '@/world/world-map';

// delauney mapgen modified from redblobgames
export type TPoint = { x: number, y: number }

export function genPoints<T extends TPoint>(
	rand: () => number, range: TBounds, tileSize: number,
	pts: Map<string, T>) {

	const jitter = 0.5;

	// generate on tileSize boundaries so the map generates
	// deterministically from any position.
	const rstart = Math.floor(range.top / tileSize);
	const rend = Math.floor(range.bottom / tileSize);

	const cstart = Math.floor(range.left / tileSize);
	const cend = Math.floor(range.right / tileSize);

	// stores points in consecutive x,y coods.
	for (let row = rstart; row <= rend; row++) {

		for (let col = cstart; col <= cend; col++) {

			pts.set(row + ',' + col, {
				x: tileSize * (col + jitter * (rand() - rand())),
				y: tileSize * (row + jitter * (rand() - rand()))
			} as T);

		}

	}

	return pts;

}
