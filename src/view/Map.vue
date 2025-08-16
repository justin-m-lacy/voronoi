<script setup lang="ts">
import { Voronoi } from 'd3-delaunay';
import { onMounted, shallowRef } from 'vue';

const props = defineProps<{
	voronoi: Voronoi<number>
}>();

const mapRef = shallowRef<HTMLCanvasElement>();

const rgb = (r: number, g: number, b: number) => {
	return `rgb(${r},${g},${b})`
}
const redraw = (ctx: CanvasRenderingContext2D) => {


	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	const v = props.voronoi;

	v.xmin = -500;
	v.xmax = 9999;
	v.ymin = 0;
	v.ymax = 9999;


	console.log(`circumcneters: ${v.circumcenters.length}`);
	console.log(`pts: ${v.delaunay.points.length / 2}`);

	for (let i = v.delaunay.points.length / 2 - 1; i >= 0; i--) {

		const red = 128 + 128 * Math.random();
		const blue = 128 + 128 * Math.random();
		const green = 128 + 128 * Math.random();


		ctx.beginPath();
		ctx.fillStyle = rgb(red, green, blue);
		v.renderCell(i, ctx);

		ctx.fill();

	}

	/*for (const face of v.cellPolygons()) {

		const red = 128 + 128 * Math.random();
		const blue = 128 + 128 * Math.random();
		const green = 128 + 128 * Math.random();

		for (const p of face) {
			ctx.moveTo(p[0], p[1]);
		}

		ctx.fillStyle = rgb(red, green, blue);
		ctx.fill();

	}*/


}

onMounted(() => {

	const elm = mapRef.value;
	if (!elm) {
		console.warn(`no canvas element.`);
		return;
	}

	elm.width = window.innerWidth;
	elm.height = window.innerHeight;

	const ctx = elm.getContext('2d');
	if (!ctx) return;

	redraw(ctx);

});
</script>
<template>
	<canvas ref="mapRef" width="">
	</canvas>

</template>