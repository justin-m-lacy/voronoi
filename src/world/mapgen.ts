import { VoronoiMap } from '@/world/delaunay';
import alea from 'alea';
import { createNoise2D } from 'simplex-noise';

// delauney mapgen modified from redblobgames

export function MapGen({ seed, width, height, tileSize = 1 }: { seed: string, tileSize?: number, width: number, height: number }) {

	const temps = createNoise2D(alea(seed + 'temp'));
	const rains = createNoise2D(alea(seed + 'rain'));

	const ptrand = alea(seed + 'pts');

	return {
		...VoronoiMap({ rand: ptrand, width, height, tileSize }),
	}

}
