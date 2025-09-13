<script setup lang="ts">
import { useBiomeStore } from '@/store/biome-store';
import { useBuildStore } from '@/store/build-store';
import { useOptions } from '@/store/options-store';
import Header from '@/view/Header.vue';
import MapView from '@/view/MapView.vue';
import BiomeEditor from '@/view/panes/BiomeEditor.vue';
import MapSettings from '@/view/panes/MapSettings.vue';
import TileInfo from '@/view/TileInfo.vue';
import { MapPoint } from '@/world/point';
import { useEventListener } from '@vueuse/core';

const options = useOptions();
const buildStore = useBuildStore();
const biomeStore = useBiomeStore();

onBeforeMount(async () => {
	await biomeStore.init();
	buildStore.buildMap();
});

onMounted(() => {
});

const rollInfo = shallowRef<{
	data: MapPoint,
	at: { x: number, y: number }
} | null>(null);

const onBiomeChange = () => {
	buildStore.changed++;
}
const onCellOver = (cell: MapPoint, at: { x: number, y: number }) => {

	rollInfo.value = {
		data: cell,
		at
	};
}

useEventListener('keydown', (evt => {

	if (evt.key == ' ') {
		buildStore.randomize();
	}
}));

</script>
<template>

	<div class="w-full h-full flex justify-end overflow-hidden">
		<Header class="z-100" />
		<MapView v-if="buildStore.map" class="absolute w-full h-full z-0"
				 :map="buildStore.map" @cellOver="onCellOver" />

		<TileInfo class="z-50" v-if="rollInfo" :data="rollInfo.data" :at="rollInfo.at" />

		<div class="flex flex-col justify-stretch min-h-full h-screen z-10 min-w-20 p-2 bg-white/75">
			<MapSettings :map="buildStore.map" />
			<BiomeEditor :biomes="biomeStore.biomes" @changed="onBiomeChange" />
		</div>
	</div>

</template>