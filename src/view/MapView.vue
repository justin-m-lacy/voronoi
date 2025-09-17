<script setup lang="ts">
import { useBuildStore } from '@/store/build-store';
import { useOptions } from '@/store/options-store';
import { useViewStore } from '@/store/view-store';
import MapSvg from '@/view/MapSvg.vue';
import { MapPoint } from '@/world/point';
import { TBounds, WorldMap } from '@/world/world-map';
import { useDebounceFn, useEventListener } from '@vueuse/core';
import { Voronoi } from 'd3-delaunay';
import { onMounted } from 'vue';
import { useViewDrag } from './composable/view-drag';

const props = defineProps<{
	map: WorldMap
}>();

const emit = defineEmits<{
	(e: 'cellOver', pt: MapPoint, at: { x: number, y: number }): void;
}>();

const container = shallowRef<HTMLElement>();
const viewStore = useViewStore();
const buildStore = useBuildStore();
const options = useOptions();

const viewBounds: TBounds = {
	left: -window.innerWidth / 2,
	right: window.innerWidth / 2,
	top: -window.innerHeight / 2,
	bottom: window.innerHeight / 2
};

/**
 * Data of each map tile.
 */
const mapCells = shallowRef<{ pt: MapPoint, data: string, valid?: boolean }[]>([]);

const viewVoronoi = shallowRef<Voronoi | null>(null);

useViewDrag(container, viewStore);

watch(() => [viewStore.tx, viewStore.ty, viewStore.scale], rebound,
	{ immediate: false, deep: false });

const growMap = useDebounceFn((bnds: {
	left: number,
	right: number, top: number, bottom: number
}) => {
	props.map.grow(bnds);
}, 100);

function rebound() {

	if (!container.value) return;

	const bounds = viewStore.getBounds(container.value, viewBounds);

	if (options.opts.autoFillView) {
		props.map.rebuild(bounds);
		viewVoronoi.value = props.map.voronoi;
	}


}

watch(viewVoronoi, redraw);

function redraw() {

	//console.time('draw');

	const vor = props.map.voronoi;
	const pts = props.map.viewPoints;
	const cells: { pt: MapPoint, data: string, valid?: boolean }[] = new Array(pts.length);
	for (let i = 0; i < pts.length; i++) {

		cells[i] = {
			pt: pts[i], data: vor.renderCell(i),
			valid: vor.contains(i, pts[i].x, pts[i].y)
		};

	}

	mapCells.value = cells;

	//console.timeEnd('draw');

}


const onWheel = (e: WheelEvent) => {

	const MIN_SCALE = 0.1;
	const MAX_SCALE = 1.5;

	let s = viewStore.scale + e.deltaY / 4000;
	viewStore.setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, s)));

}

const onCellOver = (data: MapPoint, evt: MouseEvent) => {
	emit('cellOver', data, {
		x: evt.clientX,
		y: evt.clientY
	})
}

useEventListener(window, 'resize', rebound);

onMounted(() => {
	viewVoronoi.value = props.map.voronoi;
});
</script>
<template>
	<div ref="container" class="w-full h-full" @wheel.prevent="onWheel">
		<MapSvg :cells="mapCells" :tx="viewStore.tx" :ty="viewStore.ty"
				:scale="viewStore.scale" @cellOver="onCellOver" />
	</div>

</template>