<script setup lang="ts">
import { positionElm } from '@/util/dom';
import { MapPoint } from '@/world/mapgen';

const props = defineProps<{
	data: MapPoint
}>();

const elRef = shallowRef<HTMLDivElement>();
watch(() => props.data, (data) => {

	nextTick(() => {
		if (!elRef.value) return;

		const rect = elRef.value.parentElement!.getBoundingClientRect()!;
		const px = (data.x + 0) * 1;
		const py = (data!.y + 0) * 1;

		positionElm(elRef.value, px, py);

	});

}, { immediate: true, deep: true });
</script>
<template>
	<div ref="elRef"
		 class="absolute w-40 h-20 p-1
			bg-gray-200 border rounded-xs">
		<div class="flex">{{ data.biome.id }}</div>
	</div>
</template>