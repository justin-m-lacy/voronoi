import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

const makeOpt = <K extends keyof any>(ref: Ref<any>, s: K, defaultVal?: any[K]) => {

	ref.value[s] ??= defaultVal;

	return computed<any[K] | undefined>({
		get() { return ref.value[s] ?? defaultVal; },
		set(v: any[K] | undefined) { ref.value[s] = v; }
	});

}


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

	return {
		opts,
		setVal<K extends string>(s: K, v: any) {
			(opts.value as any)[s] = v;
		},
		getVal<K extends string>(s: K) {
			return (opts.value as any)[s];
		}
	};

})