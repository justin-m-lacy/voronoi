<script setup lang="ts">
import Map from '@/view/Map.vue';
import TileInfo from '@/view/TileInfo.vue';
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

onKeyDown(' ', (_ => {
	world.randomize();
	redraw.value++;
}));

</script>
<template>

	<div class="w-full h-full">
		<Map :map="world" :redraw="redraw" @select="select = $event" />
		<TileInfo v-if="select" :data="select" />
	</div>

</template>