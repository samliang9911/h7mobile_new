<template>
	<div>{{data}}</div>
</template>
<script setup lang="ts">
	import { FieldConfig } from '@/api/autopage/indexTypes'
	const { columns } = defineProps<{ columns : FieldConfig[] }>()

	const data = defineModel()
	console.log('data ',data)
</script>