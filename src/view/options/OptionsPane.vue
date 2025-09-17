<script setup lang="ts">
import BoolOpt from '@/view/options/BoolOpt.vue';

const emit = defineEmits<{
	(e: 'close'): void
}>()
</script>
<template>
	<div class=" bg-blue-300/50 p-4 fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2
		flex flex-col z-100">
		<button type="button" class="bg-red-700 p-1"
				@click="emit('close')">X</button>
		<BoolOpt opt="autoFillView" name="Auto Fill View" />

	</div>
</template>