import { Delaunay } from 'd3-delaunay';
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


	console.log(`points: ${points.length}`);
	console.log(`halfedges: ${delaunay.halfedges.length}`);

	return {
		randomize() {
			randomize(rand, width, height, tileSize, this.points);
			this.voronoi.update()
		},
		points,
		delaunay,
		voronoi: delaunay.voronoi()
	}

}


function randomize(rand: () => number, width: number, height: number, tileSize: number,
	pts: { x: number, y: number }[]) {

	const jitter = 0.2 * tileSize;

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
