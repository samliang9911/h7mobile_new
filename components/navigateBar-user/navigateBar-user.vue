<template>
	<view class="navBarLayout">
		
		<view class="navigateBar">
			<view class="statusBar" :style="{height:getStatusBar_Height()+'px'}"></view>			
			<view class="topBar" :style="{height:getTitleBar_Height()+'px'}">
				<view class="moreServices" @click="moreServices">
					<up-icon name="list" size="25"></up-icon>
				</view>
				<view class="setting" @click="setting">
					<up-icon name="setting" size="25"></up-icon>
				</view>				
			</view>			
		</view>
		
		<view class="fill" :style="{height:getNavigateBar_Height()+'px'}"></view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { getStatusBar_Height,getTitleBar_Height,getNavigateBar_Height } from '@/utils/systemInfo_navBarHeight.js'

defineProps({
	moreServices:{
		type: Function,
		default:""
	},
	setting:{
		type: Function,
		default:""
	}
})


</script>

<style lang="scss" scoped>
.navBarLayout{
	.navigateBar{		
		position: fixed;
		z-index: 10;
		width: 100%;		
		background-color: $bg-color-lightGrey;
		// background:
		// linear-gradient(to bottom, rgba(0,0,0,0) ,#fff 450rpx),
		// linear-gradient(to right, #bbfff1,rgba(183, 234, 255, 1));
		.statusBar{
			
		}
		.topBar{
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin: 0 25rpx;
			// border: 1rpx solid red;
			.moreServices{
			}
			.setting{
			}
			
		}
		
			
	}
}
</style>