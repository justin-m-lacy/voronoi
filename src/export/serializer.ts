import { parsePoints } from "@/export/decode";
import { encodePoints } from "@/export/encode";
import { TPoint } from "@/world/point";
import type { Serializer } from "@vueuse/core";

export type AppData = {

	points: Map<string, TPoint>
}

export function PointSerializer(): Serializer<AppData> {

	return {

		read(str: string): AppData {

			ResetIds();

			const raw = JSON.parse(str);
			const points = parsePoints(raw.points);

			return {
				points,
			};

		},
		write(data: AppData): string {

			return JSON.stringify({
				points: encodePoints(data.points),
			});

		}
	}


}