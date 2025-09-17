<script setup lang="ts">
import { useOptions } from '@/store/options-store';

defineProps<{
	opt: string,
	placeholder?: string
}>();

const opts = useOptions();

</script>
<template>
	<div class="flex items-center justify-stretch pt-2 px-1 gap-y-4">
		<div class="text-sm font-semibold pr-1">{{ opt }}</div>
		<input type="number" class="grow" :placeholder="placeholder ?? opt" min="0" max="8"
			   :value="opts.getVal(opt as any)"
			   @change="opts.setVal(opt as any, Number(($event.target as HTMLInputElement).value))">
	</div>
</template>