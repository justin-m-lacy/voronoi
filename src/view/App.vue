<script setup lang="ts">
import { useBiomeStore } from '@/store/biome-store';
import { useOptions } from '@/store/options-store';
import Header from '@/view/Header.vue';
import MapView from '@/view/MapView.vue';
import BiomeEditor from '@/view/panes/BiomeEditor.vue';
import MapSettings from '@/view/panes/MapSettings.vue';
import TileInfo from '@/view/TileInfo.vue';
import { MapPoint, WorldMap } from '@/world/world-map';
import { useEventListener } from '@vueuse/core';

const world = shallowRef<WorldMap | null>(null);

const biomeStore = useBiomeStore();

onBeforeMount(async () => {

	await biomeStore.init();

	world.value = new WorldMap({
		seed: 'testmap',
		range: {
			left: -window.innerWidth / 2,
			right: window.innerWidth / 2,
			top: -window.innerHeight / 2,
			bottom: window.innerHeight / 2
		},
		tileSize: 72,

	});


});

const options = useOptions();


const redraw = ref(0);
const rollInfo = shallowRef<{
	data: MapPoint,
	at: { x: number, y: number }
} | null>(null);

const onBiomeChange = () => {
	redraw.value++;
}
const onCellOver = (cell: MapPoint, at: { x: number, y: number }) => {

	rollInfo.value = {
		data: cell,
		at
	};
}

useEventListener('keydown', (evt => {

	if (evt.key == ' ') {
		world.value?.randomize();
		redraw.value++;
	}
}));

</script>
<template>

	<div class="w-full h-full flex justify-end overflow-hidden">
		<Header class="z-100" />
		<MapView v-if="world" class="absolute w-full h-full z-0 overflow-hidden"
				 :map="world" :redraw="redraw"
				 @cellOver="onCellOver" />

		<TileInfo class="z-50" v-if="rollInfo" :data="rollInfo.data" :at="rollInfo.at" />

		<div class="flex flex-col justify-stretch min-h-full h-screen z-10 min-w-20 p-2 bg-white/75">
			<MapSettings :map="world" />
			<BiomeEditor :biomes="biomeStore.biomes" @changed="onBiomeChange" />
		</div>
	</div>

</template>