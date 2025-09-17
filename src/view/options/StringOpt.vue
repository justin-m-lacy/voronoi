<script setup lang="ts">
import { useOptions } from '@/store/options-store';

defineProps<{
	opt: string,
	placeholder?: string
}>();

const opts = useOptions();

</script>
<template>
	<input type="text" :placeholder="placeholder ?? opt"
		   :value="opts.getVal(opt as any)"
		   @change="opts.setVal(opt as any, ($event.target as HTMLInputElement).value)">
</template>