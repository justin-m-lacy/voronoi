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

const emits = defineEmits<{
	(e: 'select', pt: MapPoint | null): void;
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

	vor.xmin = 0;
	vor.xmax = Math.min(-viewStore.tx + rect.width / viewStore.scale, props.map.maxWidth);
	vor.ymin = 0;
	vor.ymax = Math.min(-viewStore.ty + rect.height / viewStore.scale, props.map.maxHeight);

	redraw();

}

const redraw = () => {

	//console.time('draw');

	const points = props.map.points;
	const vor = props.map.voronoi;

	const cells: { pt: MapPoint, data: string }[] = [];

	for (let i = points.length / 2 - 1; i >= 0; i--) {
		cells.push({ pt: points[i], data: vor.renderCell(i) });
	}
	console.log(`cells count: ${cells.length}`);
	mapCells.value = cells;

	//console.timeEnd('draw');

}


const onWheel = (e: WheelEvent) => {

	const MIN_SCALE = 0.1;
	const MAX_SCALE = 1.5;

	let s = viewStore.scale + e.deltaY / 4000;
	viewStore.setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, s)));

}


useEventListener(window, 'resize', rebound);

onMounted(() => {
	rebound();
});
</script>
<template>
	<div ref="container" class="w-full h-full" @wheel.prevent="onWheel">
		<MapSvg :cells="mapCells" :tx="viewStore.tx" :ty="viewStore.ty" :scale="viewStore.scale" />
	</div>

</template>