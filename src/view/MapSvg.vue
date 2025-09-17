<script setup lang="ts">
import { MapPoint } from '@/world/point';
import { useElementSize } from '@vueuse/core';

withDefaults(defineProps<{
	cells: Array<{ pt: MapPoint, data: string, valid?: boolean }>,
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

		<template v-for="(cell, ind) in cells" :d="cell.data" :key="ind">
			<path v-if="cell.data != null && cell.data.length > 0" :d="cell.data" :key="ind"
				  :fill="cell.pt.biome.color" class="" stroke-opacity="0.9" stroke-width="4"
				  :class="cell.valid ? ['stroke-slate-400'] : ['stroke-red-700', 'stroke-1']"
				  @mouseover="emit('cellOver', cell.pt, $event)" />
			<circle v-else :cx="cell.pt.x" :cy="cell.pt.y" r="4" fill="red" />
		</template>

	</svg>
</template>