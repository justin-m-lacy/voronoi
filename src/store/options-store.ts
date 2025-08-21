import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const useOptions = defineStore('options', () => {

	const opts = useLocalStorage('options', {

		/**
		 * automatically generate new tiles to fill screen.
		 */
		autoFillView: true

	}, {
		deep: false,
		listenToStorageChanges: false,
		mergeDefaults: true
	});

	opts.value.autoFillView = true;
	return { opts };

})