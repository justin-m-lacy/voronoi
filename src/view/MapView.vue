<script setup lang="ts">
import { useBuildStore } from '@/store/build-store';
import { useOptions } from '@/store/options-store';
import { useViewStore } from '@/store/view-store';
import MapSvg from '@/view/MapSvg.vue';
import { MapPoint, TBounds, WorldMap } from '@/world/world-map';
import { useDebounceFn, useEventListener } from '@vueuse/core';
import { onMounted } from 'vue';
import { useViewDrag } from './composable/view-drag';

const props = defineProps<{
	map: WorldMap
}>();

const emit = defineEmits<{
	(e: 'cellOver', pt: MapPoint, at: { x: number, y: number }): void;
}>();

const container = shallowRef<HTMLElement>();
const viewStore = useViewStore();
const buildStore = useBuildStore();
const options = useOptions();

const viewBounds: TBounds = {
	left: props.map.bounds.left,
	right: props.map.bounds.right,
	top: props.map.bounds.top,
	bottom: props.map.bounds.bottom,
};

/**
 * Data of each map tile.
 */
const mapCells = shallowRef<{ pt: MapPoint, data: string }[]>([]);


useViewDrag(container, viewStore);

watch(() => [viewStore.tx, viewStore.ty, viewStore.scale], rebound,
	{ immediate: false, deep: false });
watch(() => buildStore.changed, rebound, { immediate: false });

const growMap = useDebounceFn((bnds: { left: number, right: number, top: number, bottom: number }) => {
	props.map.grow(bnds);
}, 100);

function rebound() {

	if (!container.value) return;

	const bounds = viewStore.getBounds(container.value, viewBounds);

	if (options.opts.autoFillView) {

		console.log(`autofill bounds`);
		buildStore.bounds = bounds;

	} else {

		const mapBounds = props.map.bounds;
		bounds.left = Math.max(mapBounds.left, bounds.left);
		bounds.right = Math.min(mapBounds.right, bounds.right);
		bounds.top = Math.max(mapBounds.top, bounds.top);
		bounds.bottom = Math.min(mapBounds.bottom, bounds.bottom);

	}

	props.map.updateVoronoi();

	redraw();

}

function redraw() {

	//console.time('draw');
	const mapPts = props.map.points;

	const vor = props.map.voronoi;
	const cells: { pt: MapPoint, data: string }[] = [];

	vor.xmin = viewBounds.left;
	vor.xmax = viewBounds.right
	vor.ymin = viewBounds.top;
	vor.ymax = viewBounds.bottom;

	let ind = 0;
	for (const p of mapPts.values()) {

		cells.push({ pt: p, data: vor.renderCell(ind) });
		ind++;

	}

	mapCells.value = cells;

	//console.timeEnd('draw');

}


const onWheel = (e: WheelEvent) => {

	const MIN_SCALE = 0.1;
	const MAX_SCALE = 1.5;

	let s = viewStore.scale + e.deltaY / 4000;
	viewStore.setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, s)));

}

const onCellOver = (data: MapPoint, evt: MouseEvent) => {
	emit('cellOver', data, {
		x: evt.clientX,
		y: evt.clientY
	})
}

useEventListener(window, 'resize', rebound);

onMounted(() => {
	redraw();
});
</script>
<template>
	<div ref="container" class="w-full h-full" @wheel.prevent="onWheel">
		<MapSvg :cells="mapCells" :tx="viewStore.tx" :ty="viewStore.ty"
				:scale="viewStore.scale" @cellOver="onCellOver" />
	</div>

</template>