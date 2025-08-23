<script setup lang="ts">
import { useBuildStore } from '@/store/build-store';
import { WorldMap } from '@/world/world-map';

const props = defineProps<{
	map?: WorldMap | null
}>();

const emit = defineEmits<{
	(e: 'reseed'): void;
}>();

const build = useBuildStore();

function fillView() {

}
function updateSize(evt: Event) {

	const tileSize = Number((evt.target as HTMLInputElement).value);
	if (tileSize < 10) {
		return;
	}

	build.tileSize = tileSize;

}

function randomize() {
	props.map?.randomize();
}

function copySeed(str: string) {
	navigator.clipboard.writeText(str)
}
</script>
<template>
	<div v-if="map" class="flex flex-col gap-y-2 text-sm max-w-48 shrink px-1">

		<div class="flex gap-x-2 text-xs overflow-hidden">
			<span>seed:</span>
			<span class="overflow-hidden" @click="copySeed(map.seed)">{{ map.seed }}</span>
		</div>
		<div class="flex flex-col gap-x-1 text-xs items-center">
			<div class="flex items-center justify-between gap-x-1">
				<div>
					<label for="mapleft">left</label>
					<input type="number" id="mapleft" class="text-xs p-0.5 w-12"
						   v-model="build.bounds.left" @change="">
				</div>
				<div>
					<label for="mapright">right</label>
					<input type="number" id="mapright" class="text-xs p-0.5 w-12"
						   v-model="build.bounds.right" @change="">
				</div>
			</div>

			<div class="flex items-center justify-between gap-x-1">
				<div>
					<label for="maptop">top</label>
					<input type="number" id="maptop" class="text-xs p-0.5 w-12"
						   v-model="build.bounds.top" @change="">
				</div>
				<div>
					<label for="mapbottom">bottom</label>
					<input type="number" id="mapbottom" class="text-xs p-0.5 w-12"
						   v-model="build.bounds.bottom" @change="">
				</div>
			</div>

		</div>
		<div class="flex gap-x-1 items-center pt-1">
			<label for="tilesize" class="text-xs">tile size</label>
			<input type="number" id="tilesize" class="text-xs p-0.5 w-12" min="10" max="200"
				   :value="map.tileSize" @change="updateSize($event)">
		</div>
		<div class="flex justify-evenly">
			<button type="button" class="bg-blue-600/45 rounded-md px-1 py-0.5" @click="fillView">Fill View</button>
			<button type="button" class="bg-blue-600/45 rounded-md px-1 py-0.5" @click="randomize">Random</button>
		</div>
	</div>
</template>