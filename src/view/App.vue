<script setup lang="ts">
import Map from '@/view/Map.vue';
import BiomeEditor from '@/view/panes/BiomeEditor.vue';
import MapSettings from '@/view/panes/MapSettings.vue';
import TileInfo from '@/view/TileInfo.vue';
import { Biomes } from '@/world/biomes';
import { MapPoint } from '@/world/mapgen';
import { WorldMap } from '@/world/world-map';
import { onKeyDown } from '@vueuse/core';
import { onBeforeMount } from 'vue';

const world = new WorldMap({
	seed: 'testmap',
	width: 8,
	height: 8,
	tileSize: 72,

});

const redraw = ref(0);
const select = shallowRef<MapPoint | null>(null)


onBeforeMount(() => {

});

const onBiomeChange = () => {
	redraw.value++;
}
onKeyDown(' ', (_ => {
	world.randomize();
	redraw.value++;
}));

</script>
<template>

	<div class="w-full h-full flex justify-end">
		<Map class="absolute w-full h-full z-0" :map="world" :redraw="redraw"
			 @select="select = $event" />

		<TileInfo v-if="select" :data="select" />

		<div class="flex flex-col z-10">
			<MapSettings :map="world" />
			<BiomeEditor :biomes="Biomes" @changed="onBiomeChange" />
		</div>
	</div>

</template>