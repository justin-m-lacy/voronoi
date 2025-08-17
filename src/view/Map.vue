<script setup lang="ts">
import { WorldMap } from '@/world/world-map';
import { useEventListener } from '@vueuse/core';
import { onMounted } from 'vue';
import { MapPoint } from '../world/mapgen';

const props = defineProps<{
	map: WorldMap,
	redraw: number
}>();

const emits = defineEmits<{
	(e: 'select', pt: MapPoint | null): void;
}>();

/**
 * Data of each map tile.
 */
const cellData = shallowRef<{ pt: MapPoint, data: string }[]>();

const redraw = () => {

	//console.time('draw');

	const points = props.map.points;
	const voron = props.map.voronoi;

	//console.log(`range: ${voron.xmin},${voron.xmax} => ${voron.ymin},${voron.ymax}`)
	/*voron.xmin = -100;
	voron.xmax = 10000;
	voron.ymin = -1000;
	voron.ymax = 10000;*/


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
	<div>
		<svg class="max-w-100 max-h-100 w-full h-full flex" width="100" height="100"
			 preserveAspectRatio="xMidYMid meet">

			<path v-for="(cell, ind) in cellData" :d="cell.data" :key="cell.pt.x + ',' + cell.pt.y"
				  :fill="cell.pt.biome.color"
				  @mouseover="emits('select', cell.pt)" />
		</svg>
	</div>

</template>