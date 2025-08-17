<script setup lang="ts">
import { WorldMap } from '@/world/world-map';

const props = defineProps<{
	map: WorldMap
}>();

const emit = defineEmits<{
	(e: 'resize'): void;
	(e: 'reseed'): void;
}>()

function copySeed(str: string) {
	navigator.clipboard.writeText(str)
}
</script>
<template>
	<div class="flex flex-col text-sm">

		<div class="flex gap-x-2 text-sm">
			<span>seed:</span><span @click="copySeed(map.seed)">{{ map.seed }}</span>
		</div>
		<div class="flex gap-x-1 items-center">
			<label for="mapwidth">width</label>
			<input type="number" id="mapwidth" class="text-sm p-0.5 w-12" v-model="map.width" min="10"
				   @changed="emit('resize')">
			<label for="mapheight">height</label>
			<input type="number" id="mapheight" class="text-sm p-0.5 w-12"
				   v-model="map.height" min="10"
				   @changed="emit('resize')">

		</div>
		<div class="flex gap-x-1 items-center">
			<label for="tilesize">tile size</label>
			<input type="number" id="tilesize" class="text-sm p-0.5 w-12" v-model="map.tileSize" min="10"
				   @changed="emit('resize')">
		</div>
	</div>
</template>