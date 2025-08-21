import { BiomeData, MaxRain, MaxTemp, MinRain, MinTemp, TRawBiome } from '@/world/biomes';
import { defineStore } from 'pinia';
import BiomeJson from '../data/biomes.json';

export const useBiomeStore = defineStore('biome', () => {

	const biomes = ref<Record<string, BiomeData>>({});

	async function parseBiomes(raws: TRawBiome[]) {

		const biomes: Record<string, BiomeData> = Object.create(null);

		for (const data of raws) {

			biomes[data.id] = {
				id: data.id,
				color: data.color ?? 'red',
				temp: data.temp ?? 60,
				rain: data.rain ?? 100,
				elev: data.elev,
			};

		}

		return biomes;

	}

	/**
	 * Find biome matching properties.
	 * KD-tree unnecessary for small values.
	 * @param temp 
	 * @param rain 
	 */
	const matchBiome = (temp: number, rain: number, elevation: number = 1) => {

		let best: number = Infinity;
		const all = biomes.value;
		let biome: BiomeData = all['forest']!;

		for (const k in all) {

			const b = all[k]!;
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

	return {

		biomes,
		matchBiome,
		async init() {
			biomes.value = await parseBiomes(BiomeJson);
		},
		getData() {
			return JSON.stringify(biomes.value);
		},
		async setData(data: string) {

			try {
				const raw = JSON.parse(data);
				biomes.value = await parseBiomes(raw);
			} catch (err) {
				console.error(err);
			}

		}

	}

});