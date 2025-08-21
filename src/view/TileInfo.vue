<script setup lang="ts">
import { positionElm } from '@/util/dom';
import { MapPoint } from '@/world/world-map';
import { precise } from '../util/format';

const props = defineProps<{
	data: MapPoint,
	at: { x: number, y: number }
}>();

const elRef = shallowRef<HTMLDivElement>();
watch(() => props.at, (at) => {

	nextTick(() => {
		if (!elRef.value) return;
		positionElm(elRef.value, at);

	});
}, { immediate: true, deep: true });
</script>
<template>
	<div ref="elRef"
		 class="absolute w-40 min-h-20 p-1
			bg-gray-200 border text-xs rounded-xs">
		<div class="flex">{{ data.biome.id }}</div>
		<div>Temp: {{ precise(data.temp) }}</div>
		<div>Rain: {{ precise(data.rain) }}</div>
		<div>Elev: {{ precise(data.elev) }}</div>
	</div>
</template>