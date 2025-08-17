import { useEventListener } from "@vueuse/core";
import { onUnmounted, Ref, shallowRef } from 'vue';

export const useViewDrag = (el: Ref<HTMLElement | undefined>,
	view: { tx: number, ty: number, scale: number }) => {

	const startPt = { x: 0, y: 0 };
	const clickPt = { x: 0, y: 0 };

	const active = shallowRef(false);

	const onDown = (evt: MouseEvent) => {

		active.value = false;

		startPt.x = view.tx;
		startPt.y = view.ty;

		clickPt.x = evt.clientX;
		clickPt.y = evt.clientY;

		window.addEventListener('mousemove', onMove);

	}

	const onMove = (evt: MouseEvent) => {

		active.value = true;

		view.tx = startPt.x + (evt.clientX - clickPt.x) / view.scale;
		view.ty = startPt.y + (evt.clientY - clickPt.y) / view.scale;

	}

	const onUp = (_: MouseEvent) => {

		window.removeEventListener('mousemove', onMove);

		if (!active.value || !el.value) return;
		active.value = false;

		// swallow any click events.
		window.addEventListener('click', (e) => {

			e.preventDefault();
			e.stopPropagation();

		}, { capture: true, once: true });

	}

	onUnmounted(() => {
		window.removeEventListener('mousemove', onMove);
	});

	useEventListener(el, 'mousedown', onDown);
	useEventListener('mouseup', onUp);

}