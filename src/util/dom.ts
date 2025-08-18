
const PadX = 42;
const PadY = 42;

/**
 * Convert event point to local point view.
 * @param evt 
 * @param elm - html view container.
 * @param pt 
 * @returns 
 */
export const toLocalPos = <T extends { x?: number, y?: number }>(
	evt: MouseEvent | DragEvent, elm: HTMLElement, pt: T,
	{ scale = 1, tx = 0, ty = 0 }: { scale: number, tx: number, ty: number }) => {

	const rect = elm.getBoundingClientRect();

	/// (offset from canvas center)/(scale amount) + screen center pt
	pt.x = -tx + (evt.clientX - (rect.x + rect.width / 2)) / scale;
	pt.y = -ty + (evt.clientY - (rect.y + rect.height / 2)) / scale;

	return pt;

}

export const setElmPos = (el: HTMLElement, x: number, y: number) => {

	const style = el.style;
	style.left = `${x}px`;
	style.top = `${y}px`;

}

export const positionElm = (el: HTMLElement | undefined, at: { x: number, y: number }, rect?: DOMRect) => {

	if (!el) return;

	const style = el.style;
	rect ??= el.getBoundingClientRect();

	const width = window.visualViewport?.width ?? 0;
	const height = window.visualViewport?.height ?? 0;

	if (at.x > width / 2) {
		at.x = (at.x - rect.width - PadX);
	} else {
		at.x = (at.x + PadX);
	}

	if (at.y < PadY) at.y = PadY;
	else if (at.y + rect.height > height - PadY) {
		at.y = height - rect.height - PadY;
	}

	style.left = `${at.x}px`;
	style.top = `${at.y}px`;


}

export const round = (n: number, digits: number = 0) => {
	const ten = Math.pow(10, digits);
	return Math.round(ten * n) / ten;
}