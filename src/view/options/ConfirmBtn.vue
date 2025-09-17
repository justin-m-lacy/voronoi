<script setup lang="ts">

const props = defineProps<{
	confirm?: string,
	cancel?: string
}>();

const emits = defineEmits<{
	(e: 'confirm'): void;
	(e: 'cancel'): void;
	(e: 'click'): void;
}>();

const confirmTxt = shallowRef(props.confirm ?? 'Confirm');
const cancelTxt = shallowRef(props.cancel ?? 'Cancel');
const confirming = shallowRef(false);


const onClick = () => {
	confirming.value = true;
	emits('click');
}
const confirmClick = () => {
	confirming.value = false;
	emits('confirm');
}
const onCancel = () => {
	confirming.value = false;
	emits('cancel');
}

</script>


<template>
	<template v-if="confirming">
		<div class="flex justify-stretch bg-red-700/65">
			<button type="button" class="basis-1/2 border border-black/20" @click="confirmClick">{{ confirmTxt
			}}</button>
			<button type="button" class="basis-1/2 border border-black/20" @click="onCancel">{{ cancelTxt }}</button>
		</div>
	</template>
	<template v-else>
		<button type="button" @click="onClick">
			<slot>Delete</slot>
		</button>
	</template>

</template>