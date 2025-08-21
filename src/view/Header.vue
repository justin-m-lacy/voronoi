<script setup lang="ts">
import { loadJsonStr, useFileLink } from '@/export/files';
import { useBiomeStore } from '@/store/biome-store';
import { useFileSelect } from '@/view/composable/file-select';

const showMerge = ref(false);

function exportData() {
	const data = useBiomeStore().getData();
	useFileLink(data, 'biomes.json');
}

function openMerge() {
	showMerge.value = true;
}

const fileSelect = useFileSelect(loadFile);

async function loadFile(files: FileList) {
	try {
		const fileData = await loadJsonStr(files);
		useBiomeStore().setData(fileData!);

	} catch (err) {
		console.error(err);
	}
}

const fileDrop = (e: DragEvent) => {

	const files = e.dataTransfer?.files;
	if (files && files.length > 0) {
		loadFile(files);
	}

}
const fileDrag = (e: DragEvent) => {
	e.preventDefault();
	e.dataTransfer!.dropEffect = 'copy';
}

</script>
<template>
	<MergePopup v-if="showMerge" @close="showMerge = false" />
	<div class="h-min w-full px-4 bg-slate-900 text-slate-100
		flex gap-x-6 py-0.5"
		 v-bind="$attrs">
		<button type="button" @click="exportData">Export</button>
		<button type="button"
				@click.stop.prevent="fileSelect.open"
				@drop.prevent="fileDrop" @dragover="fileDrag"
				title="Import Data">
			[Import]
		</button>
	</div>
</template>