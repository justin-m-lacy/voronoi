<script setup lang="ts">
import { useOptions } from '@/store/options-store';

defineProps<{
	opt: string,
	name?: string,
	placeholder?: string,
}>();

const opts = useOptions();

</script>
<template>
	<div class="flex gap-x-2 pt-1 px-1">
		<input :id="opt" type="checkbox" :placeholder="placeholder ?? opt" :value="opt"
			   :checked="opts.getVal(opt as any) ?? false"
			   @change="opts.setVal(opt as any, ($event.target as HTMLInputElement).checked)">
		<label :for="opt" class="text-sm font-semibold pr-1">{{ name ?? opt }}</label>

	</div>
</template>