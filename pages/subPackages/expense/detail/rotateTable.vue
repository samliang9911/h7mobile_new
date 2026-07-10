<template>
	<view class="rotate-page-container" v-if="tableData">
		<view class="rotate-content">
			<view class="rotate-header">
				<text class="header-title">{{ tableData.title || '数据详情' }}</text>
				<view class="close-btn" @click="goBack">关闭</view>
			</view>

			<scroll-view scroll-y="true" scroll-x="true" class="tbody-scroll">
				<view class="table-inline-box">
					<view class="tr-row thead-row sticky-top">
						<view class="td-cell index-col sticky-left-top" :style="{ left: 0 }">序号</view>
						<view class="td-cell" v-for="(col, index) in tableData.columns" :key="index"
							:class="{ 'sticky-left-top': col.fixed }" :style="{ 
								width: col.width ? (col.width + 'rpx') : '220rpx',
								left: getStickyLeft(index) 
							}">
							{{ col.label || col.title }}
						</view>
					</view>

					<view class="tr-row" v-for="(row, rIdx) in tableData.data" :key="rIdx">
						<view class="td-cell index-col sticky-left" :style="{ left: 0 }">{{ rIdx + 1 }}</view>
						<view class="td-cell" v-for="(col, cIdx) in tableData.columns" :key="cIdx"
							:class="{ 'sticky-left': col.fixed }" :style="{ 
								width: col.width ? (col.width + 'rpx') : '220rpx',
								left: getStickyLeft(cIdx)
							}">
							{{ row[col.field || col.key] || '-' }}
						</view>
					</view>

					<view class="bottom-gap"></view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { onShow } from '@dcloudio/uni-app'

	const tableData = ref<any>(null)

	onShow(() => {
		const cached = uni.getStorageSync('rotateTableData')
		if (cached) {
			tableData.value = cached
		}
	})

	// 计算固定列偏移量逻辑
	function getStickyLeft(index : number) {
		if (!tableData.value?.columns[index]?.fixed) return 'auto'
		let left = 80; // 对应序号列宽度
		for (let i = 0; i < index; i++) {
			if (tableData.value.columns[i].fixed) {
				left += parseInt(tableData.value.columns[i].width || 220)
			}
		}
		return left + 'rpx'
	}

	function goBack() {
		uni.navigateBack()
	}
</script>

<style scoped lang="scss">
	/* 页面基础容器保持 svh/svw 锁定 */
	.rotate-page-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100svw;
		height: 100svh;
		background: #fff;
		z-index: 9999;
		overflow: hidden;
	}

	.rotate-content {
		position: absolute;
		width: calc(100svh - 40rpx);
		height: 100svw;
		display: flex;
		flex-direction: column;
		background: #fff;
		transform-origin: center center;
		transform: translate(calc(50svw - 50svh), calc(50svh - 50svw)) rotate(90deg);
	}

	.rotate-header {
		height: 44px;
		flex-shrink: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		/* 适配 iOS 安全区域 */
		padding: 0 calc(15px + env(safe-area-inset-right)) 0 calc(15px + env(safe-area-inset-left));
		background: #007aff0d;
		border-bottom: 1px solid #eee;

		.header-title {
			font-size: 16px;
			color: #333;
			font-weight: bold;
		}

		.close-btn {
			font-size: 14px;
			color: #007aff;
			font-weight: 500;
		}
	}

	.tbody-scroll {
		flex: 1;
		height: 0;
		width: 100%;
	}

	.table-inline-box {
		display: inline-block;
		min-width: 100%;
		vertical-align: top;
	}

	.tr-row {
		display: flex;
		background: #fff;
		border-bottom: 1px solid #f0f0f0;
	}

	.thead-row {
		position: sticky;
		top: 0;
		z-index: 100;
		background: #fafafa;
		font-weight: bold;
		color: #666;
	}

	.td-cell {
		flex-shrink: 0;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		color: #555;
		border-right: 1px solid #f0f0f0;
		padding: 0 10rpx;
		box-sizing: border-box;
		white-space: nowrap;
		background: inherit;

		&.index-col {
			width: 80rpx !important;
		}

		&.sticky-left {
			position: sticky !important;
			z-index: 10;
		}

		&.sticky-left-top {
			position: sticky !important;
			z-index: 110;
		}
	}

	.bottom-gap {
		height: calc(20px + env(safe-area-inset-bottom));
	}
</style>