<template>
	<layout v-for="item in data" :config="item.config" :mainShow="item.mainShow"></layout>
</template>
<script setup lang="ts">
	import layout from './layout.vue'
	import { CompConfig } from '@/api/autopage/indexTypes'
	const data = defineModel<CompConfig[]>()
	data.value ??= []
</script>