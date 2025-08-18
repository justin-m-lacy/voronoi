import { sampler } from '@/world/sampler';
import alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import RawBiomeData from '../data/biomes.json';

type RawBiomeData = {
	id: string,

	/// weight associated with biome being chosen.
	w?: number,
	/**
	 * Temperatures given in fahrenheit, because it's what I understand.
	 */
	temp?: number,
	/**
	 * Rainfall given in centimeters.
	 */
	rain?: number,

	color?: string
}

export const MinTemp = -20;
export const MaxTemp = 100;

export const MinRain = 0;
export const MaxRain = 1500;

export type BiomeSampler = ReturnType<typeof buildSamplers>;

/**
 * computed dynamically on load.
 */
export type BiomeData = Required<RawBiomeData> & { color: string };

export const Biomes: Record<string, BiomeData> = Object.create(null);

export const ParseBiomes = async () => {

	const raws = RawBiomeData;

	let total: number = 0;

	for (const data of raws) {

		Biomes[data.id] = {
			id: data.id,
			w: (data as any).n ?? 50,
			color: data.color ?? 'red',
			temp: data.temp ?? 60,
			rain: data.rain ?? 100
		};

		total += Biomes[data.id]!.w;

	}

}

/**
 * Find biome matching properties.
 * KD-tree unnecessary for small values.
 * @param temp 
 * @param rain 
 */
export const MatchBiome = (temp: number, rain: number, elevation: number = 0) => {

	let best: number = Infinity;
	let biome: BiomeData = Biomes['forest']!;

	for (const k in Biomes) {

		const b = Biomes[k]!;
		let val = Math.abs(b.rain - rain) / (MaxRain - MinRain) +
			Math.abs(b.temp - temp) / (MaxTemp - MinTemp);
		if (val < best) {
			biome = b;
			best = val;
		}

	}

	//console.log(`temp: ${temp} rain: ${rain} best: ${biome?.id}  v: ${best}`);
	return biome;

}

export function buildSamplers(seed: string | Uint8Array) {
	return {
		temp: sampler({ seed: seed + 'temp', min: MinTemp, max: MaxTemp, scale: 1200 }),
		rain: sampler({ seed: seed + 'rain', min: MinRain, max: MaxRain, scale: 1500 }),
		elev: createNoise2D(alea(seed + 'elev')),
		points: alea(seed + 'pts')
	}

}
