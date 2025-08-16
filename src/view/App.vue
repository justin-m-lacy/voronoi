<script setup lang="ts">
import Map from '@/view/Map.vue';
import { MapGen } from '@/world/mapgen';
import { onBeforeMount } from 'vue';

const world = MapGen({
	seed: 'testmap',
	width: 8,
	height: 64,
	tileSize: 64,

});

onBeforeMount(() => {

});

</script>
<template>

	<div>
		<Map :voronoi="world.voronoi" />
	</div>

</template>