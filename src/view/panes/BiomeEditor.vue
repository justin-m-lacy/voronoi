<script lang="ts" setup>
import { BiomeData } from '../../world/biomes';
defineProps<{
	biomes: Record<string, BiomeData>
}>();

const emit = defineEmits<{
	(e: 'changed', biome: BiomeData): void
}>();

</script>
<template>
	<div class="flex flex-col items-center shrink">
		<div v-for="b in biomes">
			<div class="font-semibold text-sm">{{ b.id }}</div>
			<input type="color" v-model="b.color"
				   @input="emit('changed', b);"
				   @change="emit('changed', b)">
			<div class="text-sm">{{ b.color }}</div>
		</div>
	</div>
</template>