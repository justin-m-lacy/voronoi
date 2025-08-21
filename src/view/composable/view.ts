import { reactive, Ref } from 'vue';
import { useViewDrag, } from './view-drag';

/**
 * Use a view with tx,ty, and scale properties.
 */
export const useView = (elm: Ref<HTMLElement | undefined>) => {

	const view = reactive({
		tx: 0,
		ty: 0,
		scale: 1
	})

	useViewDrag(elm, view);

	/**
	 * Convert event point to view point.
	 * @param e 
	 * @param pt 
	 * @returns 
	 */
	const toLocal = <T extends { x?: number, y?: number }>(
		e: MouseEvent | DragEvent, pt: T) => {

		const rect = elm.value?.getBoundingClientRect();
		if (rect) {
			// tx,ty is negative of the view origin position.
			pt.x = -view.tx + (e.clientX - (rect.x + rect.width / 2)) / view.scale;
			pt.y = -view.ty + (e.clientY - (rect.y + rect.height / 2)) / view.scale;
		}

		return pt;

	}

	return {
		toLocal,
		get scale() { return view.scale },
		set scale(v) { view.scale = v },
		get tx() { return view.tx },
		set tx(v) { view.tx = v },
		get ty() { return view.ty },
		set ty(v) { view.ty = v },
	}


}