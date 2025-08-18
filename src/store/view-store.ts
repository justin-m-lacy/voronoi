import { toLocalPos } from "@/util/dom";
import { defineStore } from "pinia";

export const useViewStore = defineStore('canvas', () => {

	/**
	 * scaling should be applied before translation
	 */
	const scale = shallowRef<number>(1);

	const tx = shallowRef<number>(0);
	const ty = shallowRef<number>(0);

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
		tx, ty,
	}


});