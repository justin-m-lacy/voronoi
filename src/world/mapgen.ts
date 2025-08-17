import { BiomeData, MatchBiome, MaxRain, MaxTemp, MinRain, MinTemp } from '@/world/biomes';
import { VoronoiMap } from '@/world/d3-delaunay';
import alea from 'alea';
import { createNoise2D } from 'simplex-noise';

// delauney mapgen modified from redblobgames
export type TMap = ReturnType<typeof MapGen>;
export type TPoint = { x: number, y: number }

type BiomePoint = TPoint & { biome: BiomeData };




export function MapGen({ seed, width, height, tileSize = 1 }: { seed: string, tileSize?: number, width: number, height: number }) {

	const temps = createNoise2D(alea(seed + 'temp'));
	const rains = createNoise2D(alea(seed + 'rain'));

	const getTemp = (pt: TPoint) => {
		return MinTemp + (MaxTemp - MinTemp) * (temps(pt.x, pt.y) + 1) / 2;
	}
	const getRain = (pt: TPoint) => {
		return MinRain + (MaxRain - MinRain) * (rains(pt.x, pt.y) + 1) / 2;
	}

	const ptRand = alea(seed + 'pts');

	const points = genPoints(ptRand, width, height, tileSize) as BiomePoint[];
	const map = VoronoiMap({ points, rand: ptRand, width, height, tileSize });

	for (let i = 0; i < points.length; i++) {

		const temp = getTemp(points[i]);
		const rain = getRain(points[i]);
		points[i].biome = MatchBiome(temp, rain);

	}

	const colors: string[] = new Array(map.points.length / 2);
	for (let i = 0; i < colors.length; i++) {
		const red = 128 + 128 * Math.random();
		const blue = 128 + 128 * Math.random();
		const green = 128 + 128 * Math.random();
		colors[i] = rgb(red, green, blue)
	}

	return {
		colors,
		...map
	}

}

const rgb = (r: number, g: number, b: number) => {
	return `rgb(${r},${g},${b})`
}


function genPoints<T extends TPoint = TPoint>(
	rand: () => number, width: number, height: number, tileSize: number) {

	const pts: T[] = [];
	const jitter = 0.2;

	// stores points in consecutive x,y coods.
	for (let x = 0; x < width; x++) {

		for (let y = 0; y < height; y++) {

			pts.push({
				x: tileSize * (x + jitter * (rand() - rand())),
				y: tileSize * (y + jitter * (rand() - rand()))
			} as T);
		}


	}

	return pts;

}