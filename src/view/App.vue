<script setup lang="ts">
import Map from '@/view/Map.vue';
import { MapGen } from '@/world/mapgen';
import { onKeyDown } from '@vueuse/core';
import { onBeforeMount } from 'vue';

const world = MapGen({
	seed: 'testmap',
	width: 4,
	height: 4,
	tileSize: 72,

});

const redraw = ref(0);

onBeforeMount(() => {

});

onKeyDown(' ', (_ => {
	world.randomize();
	redraw.value++;
}));

</script>
<template>

	<div>
		<Map :voronoi="world.voronoi" :redraw="redraw" />
	</div>

</template>