import { useEventListener } from "@vueuse/core";

export const useFileSelect = (
	onSelect: (files: FileList) => void | Promise<void>,
	accept = 'text/json text/*'
) => {

	const input = document.createElement('input');
	input.style.display = 'none';
	input.type = 'file';
	input.accept = accept;

	document.body.appendChild(input);

	useEventListener(input, 'change', async (_) => {

		try {
			if (input.files) await onSelect(input.files);
		} catch (err) {
			console.error(err);
		} finally {
			input.value = '';
		}

	});

	onUnmounted(() => {
		input.remove();
	});

	return {
		input,
		open: () => input.click()
	}

}