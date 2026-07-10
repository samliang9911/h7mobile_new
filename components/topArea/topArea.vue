<template>
	<view class="layout-topArea">
		<view class="topArea" :style="{height:getNavigateBar_Height()+'px'}"></view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { getStatusBar_Height,getTitleBar_Height,getNavigateBar_Height } from '@/utils/systemInfo_navBarHeight.js'
	
</script>

<style>
</style>