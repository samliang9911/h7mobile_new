<template>
	<up-input v-model="data" :type="all[type||'input']" :placeholder="$attrs.placeholder||''" v-bind="$attrs"
		:border="border" clearable fontSize="13px" />
</template>
<script setup lang="ts">
	import { computed, useAttrs } from 'vue'
	const data = defineModel()
	const $attrs = useAttrs()
	const { type } = defineProps<{ type ?: 'input' | 'inputNumber' }>()
	const all = { input: 'text', inputNumber: 'number' }
	const border = computed<'surround' | 'bottom' | 'none'>(() => {
		return $attrs.border || $attrs.disabled ? 'surround' : 'none'
	})
</script>