<script setup lang="ts">
import { positionElm } from '@/util/dom';
import { MapPoint } from '@/world/point';
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
	<div ref="elRef" class="absolute w-32 min-h-20 p-1 px-2
			bg-gray-200 border text-xs rounded-xs">
		<div class="flex font-semibold">{{ data.biome.id }}</div>
		<div>temp: {{ precise(data.temp) }}</div>
		<div>rain: {{ precise(data.rain) }}</div>
		<div>elev: {{ precise(data.elev) }}</div>
	</div>
</template>