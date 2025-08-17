<script setup lang="ts">
import Map from '@/view/Map.vue';
import BiomeEditor from '@/view/panes/BiomeEditor.vue';
import TileInfo from '@/view/TileInfo.vue';
import { Biomes } from '@/world/biomes';
import { MapGen, MapPoint } from '@/world/mapgen';
import { onKeyDown } from '@vueuse/core';
import { onBeforeMount } from 'vue';
const world = MapGen({
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
	console.log(`biome change`);
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
		<BiomeEditor class="z-10" :biomes="Biomes" @changed="onBiomeChange" />
	</div>

</template>