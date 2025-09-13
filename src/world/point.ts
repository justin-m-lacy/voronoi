import { type BiomeData } from "@/world/biomes";

// delauney mapgen modified from redblobgames
export type TPoint = { x: number, y: number }

export type MapPoint = TPoint & {
	biome: BiomeData,
	elev: number,
	temp: number,
	rain: number,
	/**
	 * Links from point to other points.
	 */
	links?: string[]
};
