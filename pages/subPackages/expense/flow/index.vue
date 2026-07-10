<template>
	<view>
		<timeLine :preditLineData="data.preditLineData" :actuallyLineData="data.actuallyLineData" />
	</view>
</template>
<script setup lang="ts">
	import timeLine from '../../form/time-line.vue'
	const data = defineModel<{
		preditLineData : any
		actuallyLineData : any
	}>({ default: {} })
</script>