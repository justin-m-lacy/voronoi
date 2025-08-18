<script setup lang="ts">
import { useViewStore } from '@/store/view-store';
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
const svgEl = shallowRef<SVGElement>();

const viewStore = useViewStore();
const view = shallowReactive({
	width: 0,
	height: 0,
});

useViewDrag(container, viewStore);

const onWheel = (e: WheelEvent) => {

	const MIN_SCALE = 0.25;
	const MAX_SCALE = 1.5;

	let s = e.deltaY / 4000 + viewStore.scale;
	s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));

	viewStore.setScale(s);

	redraw();

}

/**
 * Data of each map tile.
 */
const cellData = shallowRef<{ pt: MapPoint, data: string }[]>();

const redraw = () => {

	//console.time('draw');

	const points = props.map.points;
	const voron = props.map.voronoi;

	const rect = container.value?.getBoundingClientRect();
	if (!rect) {
		return;
	}

	console.dir(rect);

	view.width = rect.height;
	view.height = rect.width;

	console.log(`tx: ${viewStore.tx}`);

	voron.xmin = 0;
	voron.xmax = Math.min(rect.width / viewStore.scale, props.map.maxWidth);
	voron.ymin = 0;
	voron.ymax = Math.min(rect.height / viewStore.scale, props.map.maxHeight);

	//console.log(`X ${voron.xmin},${voron.xmax} Y ${voron.ymin},${voron.ymax}`)


	const cells: { pt: MapPoint, data: string }[] = [];

	for (let i = points.length / 2 - 1; i >= 0; i--) {
		cells.push({ pt: points[i], data: voron.renderCell(i) });
	}

	cellData.value = cells;

	//console.timeEnd('draw');


}
watch(() => props.redraw, redraw);

const resizeDraw = () => {
	redraw();
}

useEventListener(window, 'resize', resizeDraw);

onMounted(() => {
	resizeDraw();
});
</script>
<template>
	<div ref="container" class="w-full h-full" @wheel.prevent="onWheel">
		<svg class="absolute w-full h-full" ref="svgEl"
			 :viewBox="`${-(0.5 * view.width / viewStore.scale) - viewStore.tx} ${-(0.5 * view.height) / viewStore.scale - viewStore.ty} ${view.width / viewStore.scale} ${view.height / viewStore.scale}`">

			<path v-for="(cell, ind) in cellData" :d="cell.data" :key="cell.pt.x + ',' + cell.pt.y"
				  :fill="cell.pt.biome.color"
				  @mouseover="emits('select', cell.pt)" />
		</svg>
	</div>

</template>