import { TPoint, type PointData, type TCluster } from "@/types/geom";
import { NextId } from "@/util/data";

export function decodeAll(ptsData: any, clusterData: any) {

	const points = parsePoints(ptsData);
	const clusters = parseClusters(clusterData, points);

	return {
		points,
		clusters
	}
}

export const parsePoints = (data: Array<PointData & any>) => {

	if (!Array.isArray(data)) {
		throw new Error(`bad points data, ${data}`, data);
	}

	const pts = new Map<string, TPoint>();

	for (let i = 0; i < data.length; i++) {

		const rawPt = data[i];

		const pos = (rawPt.p as string)?.split(',').map(v => Number(v)) ?? [0, 0];
		if (pos.length < 2 || Number.isNaN(pos[0]) || Number.isNaN(pos[1])) {
			console.log(`bad position: ${rawPt} : ${rawPt.p}`);
			pos.length = 2;
			pos[0] = pos[1] = 0;
		}
		delete rawPt.p;

		const p: TPoint & { p?: string } = {
			uid: NextId('star'),
			x: pos[0],
			y: pos[1],
			...rawPt
		}

		pts.set(p.uid, p);

	}

	return pts;

}

/**
 * Convert point id to point uid.
 * @param points 
 * @param id 
 */
function idToUid(points: Map<string, TPoint>, id: string) {
	for (const p of points.values()) {
		if (p.id == id) return p.uid;
	}
	return null;
}

const linksRegex = /(?:(\d+),(\d+))#?/ig;

/**
 * Clusters contain array of uids of all points in cluster.
 * Links are encoded as pairs of indices into the point uid list.
 * Index pairs are joined by ',' and all links are joined by '#
 * @param links - links encoded as `ind1,ind2#ind3,ind4#...`
 * @param uids - array of star uids.
 * @returns link pairs as [ [uid1,uid2],[uid3,uid4]...]
 */
function parseLinks(links: string, uids: string[], points: Map<string, TPoint>) {

	const matches = links.matchAll(linksRegex);
	const res: Array<[TPoint, TPoint]> = [];

	for (const parts of matches) {

		if (parts.length < 3) {
			console.warn(`bad link: ${parts[0]}`);
		}
		const ind1 = Number.parseInt(parts[1]);
		const ind2 = Number.parseInt(parts[2]);

		if (Number.isNaN(ind1) || ind1 < 0 || ind1 >= uids.length) {
			console.warn(`bad link index: ${parts[0]}: ${ind1}`);
			continue;
		}
		if (Number.isNaN(ind2) || ind2 < 0 || ind2 >= uids.length) {
			console.warn(`bad link index: ${parts[0]}: ${ind2}`);
			continue;
		}

		const pt1 = points.get(uids[ind1]);
		const pt2 = points.get(uids[ind2]);
		if (!pt1 || !pt2) {
			console.warn(`missing link points: ${uids[ind1]},${uids[ind2]}`);
			continue;
		}

		res.push([pt1, pt2]);

	}

	return res;
}

export const parseClusters = (arrData: any, points: Map<string, TPoint>) => {

	if (!Array.isArray(arrData)) {
		throw new Error('Unexpected cluster data');
	}

	const map = new Map<string, TCluster>();

	for (let i = 0; i < arrData.length; i++) {

		const raw = arrData[i];
		const obj = {
			uid: NextId('con'),
			...raw
		}

		/// Map human-readable ids to point uids.
		obj.stars = raw.stars?.map((id: string) => idToUid(points, id)) ?? [];

		/// Map link star-indices to star uids.
		obj.links = raw.links ? parseLinks(raw.links, obj.stars, points) : [];

		map.set(obj.uid, obj);

	}

	return map;

}