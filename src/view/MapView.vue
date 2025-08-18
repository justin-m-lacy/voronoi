<script setup lang="ts">
import { useViewStore } from '@/store/view-store';
import MapSvg from '@/view/MapSvg.vue';
import { WorldMap } from '@/world/world-map';
import { useEventListener } from '@vueuse/core';
import { onMounted } from 'vue';
import { useViewDrag } from '../../composables/view-drag';
import { MapPoint } from '../world/mapgen';

const props = defineProps<{
	map: WorldMap,
	redraw: number
}>();

const emit = defineEmits<{
	(e: 'cellOver', pt: MapPoint, at: { x: number, y: number }): void;
}>();

const container = shallowRef<HTMLElement>();
const viewStore = useViewStore();

/**
 * Data of each map tile.
 */
const mapCells = shallowRef<{ pt: MapPoint, data: string }[]>([]);


useViewDrag(container, viewStore);

watch(() => [viewStore.tx, viewStore.ty, viewStore.scale], rebound,
	{ immediate: false, deep: false });
watch(() => props.redraw, rebound, { immediate: false });

function rebound() {

	const rect = container.value?.getBoundingClientRect();
	if (!rect) return;

	const vor = props.map.voronoi;

	vor.xmin = props.map.range.xmin;
	vor.xmax = props.map.range.xmax;
	vor.ymin = props.map.range.ymin;
	vor.ymax = props.map.range.ymax;

	redraw();

}

const redraw = () => {

	//console.time('draw');

	const mapPts = props.map.points;

	const vor = props.map.voronoi;
	const cells: { pt: MapPoint, data: string }[] = [];

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
	rebound();
});
</script>
<template>
	<div ref="container" class="w-full h-full" @wheel.prevent="onWheel">
		<MapSvg :cells="mapCells" :tx="viewStore.tx" :ty="viewStore.ty" :scale="viewStore.scale"
				@cellOver="onCellOver" />
	</div>

</template>