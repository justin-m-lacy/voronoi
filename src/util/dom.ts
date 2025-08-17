
const PadX = 256;
const PadY = 256;

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

/**
 * Attempt to position an element outside the bounds of all points.
 * @param el 
 * @param pts 
 */
export const positionOutside = (el: HTMLElement, pts: Array<{ x: number, y: number }>,
	{ tx, ty, scale }: { tx: number, ty: number, scale: number }) => {

	if (pts.length <= 0) return;

	const rect = el.getBoundingClientRect();

	let minX = 999999, minY = 999999;
	let maxX = -999999, maxY = -999999;
	for (let i = pts.length - 1; i >= 0; i--) {

		const x = scale * pts[i].x + tx - rect.width;
		const y = scale * pts[i].y + ty - rect.height;

		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	}



	/// check which sides have more space.
	const width = window.visualViewport?.width ?? 0;
	const height = window.visualViewport?.height ?? 0;

	const leftSpace = minX;
	const rightSpace = width - maxX;

	const topSpace = minY;
	const botSpace = height - maxY;

	console.log(`${minX},${minY}=> ${maxX},${maxY}`);

	positionElm(el, leftSpace > rightSpace ? minX : maxX, topSpace > botSpace ? minY : maxY, rect);

}

export const positionElm = (el: HTMLElement | undefined, x: number, y: number, rect?: DOMRect) => {

	if (!el) return;

	const style = el.style;
	rect ??= el.getBoundingClientRect();

	const width = window.visualViewport?.width ?? 0;
	const height = window.visualViewport?.height ?? 0;

	if (x > width / 2) {
		x = (x - rect.width - PadX);
	} else {
		x = (x + PadX);
	}

	if (y < PadY) y = PadY;
	else if (y + rect.height > height - PadY) {
		y = height - rect.height - PadY;
	}

	style.left = `${x}px`;
	style.top = `${y}px`;


}

export const round = (n: number, digits: number = 0) => {
	const ten = Math.pow(10, digits);
	return Math.round(ten * n) / ten;
}