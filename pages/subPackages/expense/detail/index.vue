<template>
	<view class="detail-container">
		<component :is="layoutMode === 'card' ? CardLayout : TableLayout" v-model="data" v-model:rotate="rotate"
			@refresh="refreshData" />
	</view>

	<view v-if="rotate === null" class="fab-button" @click="toggleLayout" :class="layoutMode">
		<view class="fab-content">
			<text class="fab-icon">{{ layoutMode === 'card' ? '📊' : '🗂️' }}</text>
			<text class="fab-label">{{ layoutMode === 'card' ? '表格' : '卡片' }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import CardLayout from './detailCard.vue'
	import TableLayout from './detailTable.vue'

	const data = defineModel<any[]>({ default: [] })
	const layoutMode = ref<'card' | 'table'>('table')
	const rotate = ref<number | null>(null)

	function toggleLayout() {
		layoutMode.value = layoutMode.value === 'card' ? 'table' : 'card'
	}

	function refreshData() {
		data.value = [...data.value]
	}
</script>

<style scoped lang="scss">
	.detail-container {
		width: 100%;
	}

	/* 悬浮按钮样式 */
	.fab-button {
		position: fixed;
		right: 40rpx;
		bottom: 100rpx; // 避开可能的底部导航
		width: 110rpx;
		height: 110rpx;
		background: #007aff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.3);
		z-index: 999;
		transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

		&:active {
			transform: scale(0.9);
			box-shadow: 0 4rpx 10rpx rgba(0, 122, 255, 0.2);
		}

		// 根据模式变色（可选）
		&.card {
			background: #1890ff;
		}

		&.table {
			background: #52c41a;
		}
	}

	.fab-content {
		display: flex;
		flex-direction: column;
		align-items: center;

		.fab-icon {
			font-size: 36rpx;
			line-height: 1;
		}

		.fab-label {
			font-size: 20rpx;
			color: #ffffff;
			margin-top: 4rpx;
		}
	}
</style>