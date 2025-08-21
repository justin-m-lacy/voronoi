<script lang="ts" setup>
import { BiomeData } from '../../world/biomes';

const props = defineProps<{
	biomes: Record<string, BiomeData>
}>();

const emit = defineEmits<{
	(e: 'changed', biome: BiomeData): void
}>();

</script>
<template>
	<div
		 class="flex flex-wrap grow max-w-40 items-start content-start justify-between overflow-auto shrink p-2 gap-y-3">
		<div v-for="b in biomes">
			<div class="font-semibold text-sm">{{ b.id }}</div>
			<input type="color" class="w-8" v-model="b.color"
				   @input="emit('changed', b)"
				   @change="emit('changed', b)">
			<div class="text-sm">{{ b.color }}</div>
		</div>
	</div>
</template>