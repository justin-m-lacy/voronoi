<script setup lang="ts">
import MapView from '@/view/MapView.vue';
import BiomeEditor from '@/view/panes/BiomeEditor.vue';
import MapSettings from '@/view/panes/MapSettings.vue';
import TileInfo from '@/view/TileInfo.vue';
import { Biomes } from '@/world/biomes';
import { MapPoint } from '@/world/mapgen';
import { WorldMap } from '@/world/world-map';
import { useEventListener } from '@vueuse/core';
import { onBeforeMount } from 'vue';

const world = new WorldMap({
	seed: 'testmap',
	cols: 32,
	rows: 32,
	tileSize: 72,

});

const redraw = ref(0);
const select = shallowRef<MapPoint | null>(null)


onBeforeMount(() => {

});

const onBiomeChange = () => {
	redraw.value++;
}
useEventListener('keydown', (evt => {

	if (evt.key == ' ') {
		world.randomize();
		redraw.value++;
	}
}));

</script>
<template>

	<div class="w-full h-full flex justify-end">
		<MapView class="absolute w-full h-full z-0" :map="world" :redraw="redraw"
				 @select="select = $event" />

		<TileInfo v-if="select" :data="select" />

		<div class="flex flex-col z-10 min-w-20 bg-white/80">
			<MapSettings :map="world" />
			<BiomeEditor :biomes="Biomes" @changed="onBiomeChange" />
		</div>
	</div>

</template>