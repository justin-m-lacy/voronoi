<script setup lang="ts">
import { useOptions } from '@/store/options-store';
import { useViewStore } from '@/store/view-store';
import MapSvg from '@/view/MapSvg.vue';
import { MapPoint, WorldMap } from '@/world/world-map';
import { useDebounceFn, useEventListener } from '@vueuse/core';
import { onMounted } from 'vue';
import { useViewDrag } from './composable/view-drag';

const props = defineProps<{
	map: WorldMap,
	redraw: number
}>();

const emit = defineEmits<{
	(e: 'cellOver', pt: MapPoint, at: { x: number, y: number }): void;
}>();

const container = shallowRef<HTMLElement>();
const viewStore = useViewStore();

const options = useOptions();

/**
 * Data of each map tile.
 */
const mapCells = shallowRef<{ pt: MapPoint, data: string }[]>([]);


useViewDrag(container, viewStore);

watch(() => [viewStore.tx, viewStore.ty, viewStore.scale], rebound,
	{ immediate: false, deep: false });
watch(() => props.redraw, rebound, { immediate: false });

const growMap = useDebounceFn((bnds: { left: number, right: number, top: number, bottom: number }) => {
	props.map.grow(bnds);
}, 100);

function rebound() {

	let rect = container.value?.getBoundingClientRect();
	if (!rect) return;

	const s = 1 / (viewStore.scale);

	const bounds = {
		left: -viewStore.tx + (rect.left - rect.width / 2) * s,
		right: -viewStore.tx + (rect.right - rect.width / 2) * s,
		top: -viewStore.ty + (rect.top - rect.height / 2) * s,
		bottom: -viewStore.ty + (rect.bottom - rect.height / 2) * s
	}

	if (options.opts.autoFillView) {
		growMap(bounds);
	}

	props.map.updateVoronoi();

	redraw(bounds);

}

const redraw = (bnds?: { left: number, right: number, top: number, bottom: number }) => {

	//console.time('draw');
	const mapPts = props.map.points;

	const vor = props.map.voronoi;
	const cells: { pt: MapPoint, data: string }[] = [];

	bnds ??= props.map.bounds;
	vor.xmin = bnds.left;
	vor.xmax = bnds.right
	vor.ymin = bnds.top
	vor.ymax = bnds.bottom

	let ind = 0;
	for (const p of mapPts.values()) {

		cells.push({ pt: p, data: vor.renderCell(ind) });
		ind++;

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
	redraw();
});
</script>
<template>
	<div ref="container" class="w-full h-full" @wheel.prevent="onWheel">
		<MapSvg :cells="mapCells" :tx="viewStore.tx" :ty="viewStore.ty" :scale="viewStore.scale"
				@cellOver="onCellOver" />
	</div>

</template>