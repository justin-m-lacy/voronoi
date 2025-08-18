<script setup lang="ts">
import { useElementSize } from '@vueuse/core';

withDefaults(defineProps<{
	tx?: number,
	ty?: number,
	scale?: number
}>(), {
	tx: 0,
	ty: 0,
	scale: 1
});

const emit = defineEmits<{
	(e: 'dblclick', evt: MouseEvent, pt: TPoint): void;
	(e: 'clickPoint', evt: MouseEvent, pt: TPoint): void
}>();

const svgRef = ref<SVGElement>();

const { width, height } = useElementSize(svgRef);
</script>
<template>
	<svg ref="svgRef" class="absolute w-full h-full"
		 :viewBox="`${-(0.5 * width / scale) - tx} ${-(0.5 * height) / scale - ty} ${width / scale} ${height / scale}`">

		<path v-for="(cell, ind) in cellData" :d="cell.data" :key="cell.pt.x + ',' + cell.pt.y"
			  :fill="cell.pt.biome.color"
			  @mouseover="emits('select', cell.pt)" />

	</svg>
</template>