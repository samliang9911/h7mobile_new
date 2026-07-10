<template>
	<view style="padding: 3% 0;">
		<view class="flowListBorder">
			<view class="flowListDelete" :style="{right: iconRight+'rpx',
				top: iconTop+'rpx',display:showDeleteIcon ? 'block':'none'}" @tap.stop="deleteTap">
				<up-icon name="close" :color="deleteColor" :size="deleteSize"></up-icon>
			</view>
			<slot></slot>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import {
		withDefaults
	} from "vue"
	interface Props {
		deleteColor ?: String,
			deleteSize ?: String,
			iconRight ?: String,
			iconTop ?: String,
			showDeleteIcon ?: Boolean,
	}
	interface Emit {
		(e: "deleteTap", event ? : MouseEvent): void;
	}
	let emit = defineEmits < Emit > ();
	const props = withDefaults(defineProps < Props > (), {
		deleteColor: () => '#ff0648', //控制删除按钮颜色
		deleteSize: () => '20', //控制删除按钮大小
		iconRight: () => '15', //控制删除按钮左右移动,
		iconTop: () => '10', //控制删除按钮上下移动,
		showDeleteIcon: () => true, //控制删除按钮
	})
	let deleteTap = () => {
		emit("deleteTap")
	}
</script>

<style lang="scss" scoped>
	.flowListBorder {
		width: 94%;
		margin: 0 3%;
		padding: 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 1rpx 10rpx 1rpx rgba(7, 17, 27, 0.2);
		position: relative;

		.flowListDelete {
			width: 40rpx;
			height: 40rpx;
			text-align: center;
			line-height: 40rpx;
			position: absolute;

		}
	}
</style>
