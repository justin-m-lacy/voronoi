import { Delaunay } from 'd3-delaunay';

function expect(p: boolean) {
	if (!p) throw new Error('Expect failed');
}

/**
 * 
 * @param rand - random number generator.
 * @param tileSize - size of map tile. 
 */
export function VoronoiMap<T extends { x: number, y: number }>({ points, rand, width, height, tileSize = 1 }: {
	rand: () => number,
	points: T[],
	width: number,
	height: number,
	tileSize: number
}) {

	const delaunay = Delaunay.from(points, p => p.x, p => p.y);

	expect(delaunay.points.length == 2 * points.length);

	return {
		randomize() {
			randomize(rand, width, height, tileSize, points);
			this.voronoi.update()
		},
		delaunay,
		voronoi: delaunay.voronoi()
	}

}


function randomize(rand: () => number, width: number, height: number, tileSize: number,
	pts: { x: number, y: number }[]) {

	const jitter = 0.2;

	// stores points in consecutive x,y coods.
	let ind: number = 0;
	for (let x = 0; x < width; x++) {

		for (let y = 0; y < height; y++) {

			pts[ind].x = tileSize * (x + jitter * (rand() - rand()));
			pts[ind++].y = tileSize * (y + jitter * (rand() - rand()))

		}


	}

	return pts;

}
