import alea from 'alea';
import { createNoise2D } from 'simplex-noise';

/**
 * 
 * @param scale - scale applied to coordinate param.
 * @returns 
 */
export const sampler = ({ seed, min = -1, max = 1, scale = 1 }: { seed: string, min: number, max: number, scale: number }) => {

	// local const is necessary.
	const func = function s(x: number, y: number) {
		s.a + s.b * s.f(x / s.scale, y / s.scale);
	}
	// avoid function closure.
	func.a = 0.5 * (max + min);
	func.b = 0.5 * (max - min);
	func.f = createNoise2D(alea(seed));
	func.scale = scale;

	return func as any as (x: number, y: number) => number;

}