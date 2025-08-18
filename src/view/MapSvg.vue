<script setup lang="ts">
import { MapPoint } from '@/world/mapgen';
import { useElementSize } from '@vueuse/core';

const props = withDefaults(defineProps<{
	cells: Array<{ pt: MapPoint, data: string }>,
	tx?: number,
	ty?: number,
	scale?: number
}>(), {
	tx: 0,
	ty: 0,
	scale: 1
});

const svgEl = shallowRef<SVGElement>();

const emit = defineEmits<{
	(e: 'cellOver', pt: MapPoint, evt: MouseEvent): void;
	(e: 'clickPoint', evt: MouseEvent, pt: { x: number, y: number }): void
}>();


const { width, height } = useElementSize(svgEl);
</script>
<template>
	<svg class="absolute w-full h-full" ref="svgEl" preserveAspectRatio="xMinYMin"
		 :viewBox="`${-(0.5 * width / scale) - tx} ${-(0.5 * height) / scale - ty} ${width / scale} ${height / scale}`">

		<path v-for="(cell, ind) in cells" :d="cell.data" :key="ind"
			  :fill="cell.pt.biome.color"
			  @mouseover="emit('cellOver', cell.pt, $event)" />
	</svg>
</template>