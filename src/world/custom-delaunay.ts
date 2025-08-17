import { Delaunay } from 'd3-delaunay';

type DPoint = {
	x: number,
	y: number,
	color?: string
}

export type CustomVoronoi = ReturnType<typeof VoronoiMap>;

/**
 * 
 * @param rand - random number generator.
 * @param tileSize - size of map tile. 
 */
export function VoronoiMap({ rand, width, height, tileSize = 1 }: { rand: () => number, width: number, height: number, tileSize: number }) {

	const points = genPoints(rand, width, height, tileSize);
	const delaunay = Delaunay.from(points, p => p.x, p => p.y);

	console.time('calc');
	const centers = calcCenters(delaunay);
	console.timeEnd('calc');

	console.log(`points: ${points.length}`);
	console.log(`centers: ${centers.length}`);

	return {
		randomize() {
			update(rand, width, height, tileSize, this.points);
			//this.delaunay.update();
			//this.voronoi.update()
		},
		points,
		delaunay,
		numEdges: delaunay.halfedges.length,
		numTriangles: delaunay.halfedges.length / 3,
		flipEdges: delaunay.halfedges,
		tileSize,
		// edges of voronoi graph
		centers,
	}

}


/**
 * Centroids are edges of the voronoi graph.
 * @param delaunay 
 * @returns 
 */
function calcCenters(delaunay: Delaunay<DPoint>) {

	const triplets = delaunay.halfedges.length / 3;
	const centers: { x: number, y: number }[] = new Array(triplets);

	// all points in graph.
	//[ x0, y0, x1, y1, x2, y2, x3, y3, ...]
	const coords = delaunay.points;

	// triangles is a flat map of triangle vertex indices.
	// [v1a,v2a,v3a, v1b,v2b,v2c,...] where vi are indices of original points.
	// for every three vertex indices in delaunay triangles,
	// sum the coordinates of the indexed points.
	let tIndex = 0;
	for (let t = 0; t < triplets; t++) {
		let sumX = 0, sumY = 0;
		for (let i = 0; i < 3; i++) {
			// index of triangle vertex. (ptIndex * 2 for flat map point array.)
			const ptInd = 2 * delaunay.triangles[tIndex++];

			sumX += coords[ptInd];
			sumY += coords[ptInd + 1]

		}
		centers[t] = { x: sumX / 3, y: sumY / 3 };
	}
	return centers;

}

function update(rand: () => number, width: number, height: number, tileSize: number,
	pts: DPoint[]) {

	const jitter = 0.2 * tileSize;

	// stores points in consecutive x,y coods.
	let ind: number = 0;
	for (let x = 0; x < width; x++) {

		for (let y = 0; y < height; y++) {

			pts[ind].x = tileSize * (x + jitter * (rand() - rand()));
			pts[ind++].y = tileSize * (y + jitter * (rand() - rand()));

		}

	}

	return pts;

}

function genPoints(rand: () => number, width: number, height: number, tileSize: number) {

	const pts: DPoint[] = [];
	const jitter = 0.2;

	// stores points in consecutive x,y coods.
	for (let x = 0; x < width; x++) {

		for (let y = 0; y < height; y++) {

			pts.push(
				{
					x: tileSize * (x + jitter * (rand() - rand())),
					y: tileSize * (y + jitter * (rand() - rand()))
				}
			);
		}


	}

	return pts;

}