import { Delaunay } from 'd3-delaunay';

function expect(p: boolean) {
	if (!p) throw new Error('Expect failed');
}

/**
 * 
 * @param rand - random number generator.
 * @param tileSize - size of map tile. 
 */
export function VoronoiMap<T extends { x: number, y: number }>({ points, width, height, tileSize = 1 }: {
	points: T[],
	width: number,
	height: number,
	tileSize: number
}) {

	const delaunay = Delaunay.from(points, p => p.x, p => p.y);

	expect(delaunay.points.length == 2 * points.length);

	return delaunay.voronoi();

}