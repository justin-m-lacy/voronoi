import { useViewStore } from '@/store/view-store';
import { WorldMap } from '@/world/world-map';
import { defineStore } from 'pinia';

type TBounds = WorldMap['bounds'];

/**
 * Values and reactives for rebuilding map.
 */
export const useBuildStore = defineStore('build', () => {

	const seed = shallowRef<string>('testmap');

	const tileSize = shallowRef<number>(64);

	const map = shallowRef<WorldMap>();

	/**
	 * watch for changes in current map.
	 */
	const changed = shallowRef<number>(0);

	/**
	 * Change to set the real bounds of a generated map,
	 * not just to change the view bounds.
	 */
	const bounds: TBounds = shallowReactive({
		left: -window.innerWidth / 2,
		right: window.innerWidth / 2,
		top: -window.innerHeight / 2,
		bottom: window.innerHeight / 2
	});

	/**
	 * Generate new map with current build values.
	 */
	function buildMap() {
		return map.value = new WorldMap({
			seed: seed.value,
			bounds: bounds,
			tileSize: tileSize.value
		});
	}

	function randomize() {
		map.value!.randomize();
		changed.value++;
	}

	function fillView() {

		const view = useViewStore().getBounds();
		bounds.left = view.left;
		bounds.right = view.right;
		bounds.top = view.top;
		bounds.bottom = view.bottom;

	}

	watch(seed, (newSeed, oldSeed) => {

		if (newSeed == oldSeed) return;
		map.value!.reseed(newSeed);
		changed.value++;

	});

	watch(bounds, (newBounds, _) => {

		map.value!.bounds = newBounds;
		map.value!.rebuild();

		changed.value++;

	});

	watch(tileSize, (newSize, oldSize) => {

		if (newSize == oldSize) return;

		map.value!.tileSize = newSize;
		map.value!.rebuild();
		changed.value++;

	});

	return {

		fillView,
		buildMap,
		changed,
		seed,
		bounds,
		tileSize,
		randomize,
		map

	}

});