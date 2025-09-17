<script setup lang="ts">
import { useOptions } from '@/store/options-store';

defineProps<{
	opt: string,
	placeholder?: string
}>();

const opts = useOptions();

</script>
<template>
	<div class="flex items-center pt-2 scroll-px-2 gap-x-3 gap-y-4">
		<input type="color" class="basis-1/3" :placeholder="placeholder ?? opt"
			   :value="opts.getVal(opt as any)"
			   @change="opts.setVal(opt as any, ($event.target as HTMLInputElement).value)">
		<div class="text-sm font-semibold pr-1 pointer-events-none">{{ opt }}</div>

	</div>
</template>