<script setup lang="ts">
import MapView from '@/view/MapView.vue';
import BiomeEditor from '@/view/panes/BiomeEditor.vue';
import MapSettings from '@/view/panes/MapSettings.vue';
import TileInfo from '@/view/TileInfo.vue';
import { Biomes } from '@/world/biomes';
import { MapPoint } from '@/world/mapgen';
import { WorldMap } from '@/world/world-map';
import { useEventListener } from '@vueuse/core';

const world = new WorldMap({
	seed: 'testmap',
	range: {
		xmin: -window.innerWidth / 2,
		xmax: window.innerWidth / 2,
		ymin: -window.innerHeight / 2,
		ymax: window.innerHeight / 2
	},
	tileSize: 72,

});

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
		world.randomize();
		redraw.value++;
	}
}));

</script>
<template>

	<div class="w-full h-full flex justify-end overflow-hidden">
		<MapView class="absolute w-full h-full z-0 overflow-hidden"
				 :map="world" :redraw="redraw"
				 @cellOver="onCellOver" />

		<TileInfo class="z-10" v-if="rollInfo" :data="rollInfo.data" :at="rollInfo.at" />

		<div class="flex flex-col z-10 min-w-20 bg-white/80">
			<MapSettings :map="world" />
			<BiomeEditor :biomes="Biomes" @changed="onBiomeChange" />
		</div>
	</div>

</template>