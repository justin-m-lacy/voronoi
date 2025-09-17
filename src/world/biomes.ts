import { sampler } from '@/world/sampler';
import alea from 'alea';

export type TRawBiome = {
	id: string;

	/**
	 * biome elevation.
	 */
	elev?: number;

	/**
	 * Temperatures given in fahrenheit, because it's what I understand.
	 */
	temp?: number;

	/**
	 * Rainfall given in centimeters.
	 */
	rain?: number;

	color?: string;
}

export const MinTemp = -20;
export const MaxTemp = 100;

export const MinRain = 0;
export const MaxRain = 1500;

export type BiomeSampler = ReturnType<typeof buildSamplers>;

/**
 * computed dynamically on load.
 */
export type BiomeData = Required<Omit<TRawBiome, 'elev'>> & { elev?: number, color: string };


export function buildSamplers(seed: string | Uint8Array) {
	return {
		// x-variable in tile-point positions.
		xVar: sampler({ seed: seed + 'xvar', min: -0.4, max: 0.4, scale: 1 }),
		yVar: sampler({ seed: seed + 'yvar', min: -0.4, max: 0.4, scale: 1 }),
		temp: sampler({ seed: seed + 'temp', min: MinTemp, max: MaxTemp, scale: 1200 }),
		rain: sampler({ seed: seed + 'rain', min: MinRain, max: MaxRain, scale: 1500 }),
		elev: sampler({ seed: seed + 'elev', min: 0.5, max: 8, scale: 1600 }),
		points: alea(seed + 'pts')
	}

}
