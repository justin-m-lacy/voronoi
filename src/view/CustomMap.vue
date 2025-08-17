<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { onMounted, shallowRef } from 'vue';
import { CustomVoronoi } from '../world/custom-delaunay';

const props = defineProps<{
	map: CustomVoronoi,
	redraw: number
}>();

const mapRef = shallowRef<HTMLCanvasElement>();

const rgb = (r: number, g: number, b: number) => {
	return `rgb(${r},${g},${b})`
}

watch(() => props.redraw, () => {

	const ctx = mapRef.value?.getContext('2d');
	if (!ctx) return;

	redraw(ctx, props.map);

});

const edgeToTri = (e: number) => { return Math.floor(e / 3); }
const nextHalfEdge = (e: number) => { return (e % 3 === 2) ? e - 2 : e + 1; }

const redraw = (ctx: CanvasRenderingContext2D, map: CustomVoronoi) => {

	const { numEdges, flipEdges: halfEdges, centers } = map;

	console.time('draw');

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.lineWidth = 2;
	ctx.strokeStyle = "black";

	for (let e = 0; e < numEdges; e++) {
		if (e < halfEdges[e]) {
			const p = centers[edgeToTri(e)];
			const q = centers[edgeToTri(halfEdges[e])];
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(q.x, q.y);
			ctx.stroke();
		}
	}

	console.timeEnd('draw');

}

const resizeDraw = () => {
	const elm = mapRef.value!;
	if (!elm) {
		console.warn(`no canvas element.`);
		return;
	}

	elm.width = window.innerWidth;
	elm.height = window.innerHeight;

	const ctx = elm.getContext('2d');
	if (!ctx) return;

	//redraw(ctx, props.map);
}

useEventListener(window, 'resize', resizeDraw);

onMounted(() => {
	resizeDraw();
});
</script>
<template>
	<canvas ref="mapRef" width="">
	</canvas>

</template>