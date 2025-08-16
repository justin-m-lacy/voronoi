import { Delaunay } from 'd3-delaunay';
/**
 * 
 * @param rand - random number generator.
 * @param tileSize - size of map tile. 
 */
export function VoronoiMap({ rand, width, height, tileSize = 1 }: { rand: () => number, width: number, height: number, tileSize: number }) {

	const points = genPoints(rand, width, height, tileSize);
	const delaunay = new Delaunay<number>(points);

	return {
		points,
		delaunay,
		voronoi: delaunay.voronoi()
	}

}

function genPoints(rand: () => number, width: number, height: number, tileSize: number) {

	const jitter = 0.2 * tileSize;

	// stores points in consecutive x,y coods.
	const pts: number[] = [];

	for (let x = 0; x < width; x++) {

		for (let y = 0; y < height; y++) {

			pts.push(
				tileSize * (x + jitter * (rand() - rand())),
				tileSize * (y + jitter * (rand() - rand()))
			);
		}


	}

	return pts;

}