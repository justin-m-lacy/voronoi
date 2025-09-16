import { toLocalPos } from "@/util/dom";
import { TBounds } from "@/world/world-map";
import { defineStore } from "pinia";

export const useViewStore = defineStore('canvas', () => {

	/**
	 * scaling should be applied before translation
	 */
	const scale = shallowRef<number>(1);

	const tx = shallowRef<number>(0);
	const ty = shallowRef<number>(0);

	/**
	 * Mimics the Map view points just to make the bounds reactive.
	 */
	//const bounds = computed<TBounds>(() => getBounds());


	/**
	 * Get bounding rect of the current view.
	 * @param targ 
	 * @param into 
	 * @returns 
	 */
	const getBounds = (targ: HTMLElement = document.body, into?: TBounds) => {

		const rect = targ.getBoundingClientRect();
		const s = 1 / scale.value;

		if (into) {

			into.left = -tx.value + (rect.left - rect.width / 2) * s;
			into.right = -tx.value + (rect.right - rect.width / 2) * s;
			into.top = -ty.value + (rect.top - rect.height / 2) * s;
			into.bottom = -ty.value + (rect.bottom - rect.height / 2) * s;

			return into;
		}

		return {
			left: -tx.value + (rect.left - rect.width / 2) * s,
			right: -tx.value + (rect.right - rect.width / 2) * s,
			top: -ty.value + (rect.top - rect.height / 2) * s,
			bottom: -ty.value + (rect.bottom - rect.height / 2) * s,
		}


	}
	const toLocal = <T extends { x?: number, y?: number }>(
		evt: MouseEvent | DragEvent, parent: HTMLElement, pt: T) => {

		return toLocalPos(evt, parent, pt, {
			tx: tx.value,
			ty: ty.value,
			scale: scale.value
		})

	}

	return {
		toLocal,
		setScale(s: number) { scale.value = s },
		setPos(x: number, y: number) { tx.value = x, ty.value = y },
		scale,
		//bounds,
		getBounds,
		tx, ty,
	}


});