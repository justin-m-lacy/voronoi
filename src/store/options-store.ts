import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const useOptions = defineStore('options', () => {

	const opts = useLocalStorage('options', {

		/**
		 * automatically generate new tiles to fill screen.
		 */
		autoFillView: false

	}, {
		deep: false,
		listenToStorageChanges: false,
		mergeDefaults: true
	});

	return { opts };

})