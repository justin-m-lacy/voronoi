<script setup lang="ts">
import { useOptions } from '@/store/options-store';
import { useViewStore } from '@/store/view-store';
import MapSvg from '@/view/MapSvg.vue';
import { MapPoint, WorldMap } from '@/world/world-map';
import { useEventListener } from '@vueuse/core';
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

function rebound() {

	let rect = container.value?.getBoundingClientRect();
	if (!rect) return;

	if (options.opts.autoFillView) {
		props.map.grow(rect);
	}

	props.map.updateVoronoi();

	redraw();

}

const redraw = () => {

	//console.time('draw');

	const mapPts = props.map.points;

	const vor = props.map.voronoi;
	const cells: { pt: MapPoint, data: string }[] = [];

	vor.xmin = props.map.bounds.left;
	vor.xmax = props.map.bounds.right
	vor.ymin = props.map.bounds.top
	vor.ymax = props.map.bounds.bottom

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