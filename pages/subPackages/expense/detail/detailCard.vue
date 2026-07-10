<template>
	<view class="page-container">
		<view class="tab-bar">
			<view v-for="(item, index) in data.filter(d => d.data && d.data.length > 0)" :key="index"
				:class="['tab-item', currentIndex === index ? 'active' : '']" @click="onTabChange(index)">
				{{ item.title }}
			</view>
		</view>

		<scroll-view v-if="currentTable" scroll-y class="card-section" :scroll-top="scrollTop" @scrolltolower="loadNext"
			lower-threshold="50">
			<view class="card-wrapper">
				<view v-for="(row, rowIndex) in currentTable.data" :key="rowIndex" class="card">
					<view class="card-count">第 {{ rowIndex + 1 }} 条</view>
					<view class="card-body">
						<view v-for="col in currentTable.columns" :key="col.field" class="card-field">
							<text class="field-label">{{ col.label }}：</text>
							<text class="field-value">{{ formatValue(col, row) }}</text>
						</view>
					</view>

					<view v-if="row.annex?.length" class="annex-box">
						<view class="annex-title">附件（共 {{ row.annex.length }} 个）</view>
						<view v-for="(file, fileIndex) in row.annex" :key="fileIndex" class="annex-row">
							<image class="annex-icon"
								:src="`https://pcm77.com/font/images/img_fileType/${png(file.type)}.png`" />
							<view class="annex-info">
								<text class="annex-name">[第 {{ rowIndex + 1 }} 行] {{ file.name }}</text>
								<text class="annex-meta">{{ file.user }} · {{ file.date }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="load-status">
					{{ currentTable.finished ? '没有更多了' : (loadingMap[currentIndex] ? '正在加载...' : '上拉加载更多') }}
				</view>
				<view style="height: 20rpx;"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, reactive, watch } from 'vue'
	import { getDetailSingle, parseCodeTableFlat } from '@/api/expense'
	import { formatValue } from '@/api/expense/format.ts'

	const data = defineModel<any[]>({ default: [] })
	const emit = defineEmits(['refresh'])
	const currentIndex = ref(0)
	const scrollTop = ref(0)

	const currentTable = computed(() => data.value[currentIndex.value])
	const loadingMap = reactive<Record<number, boolean>>({})
	const PAGE_SIZE = 30

	// 【核心修复】监听数据：初始数据不满一页时禁止触发触底
	watch(() => data.value, (newVal) => {
		newVal?.forEach(item => {
			if (item.data?.length > 0 && item.data.length < PAGE_SIZE && item.finished === undefined) {
				item.finished = true
			}
		})
	}, { immediate: true, deep: true })

	function onTabChange(index : number) {
		currentIndex.value = index
		scrollTop.value = scrollTop.value === 0 ? 0.01 : 0
	}

	async function loadNext() {
		const item = currentTable.value
		const index = currentIndex.value
		if (!item || item.finished || loadingMap[index]) return

		loadingMap[index] = true
		// 计算逻辑：初始14条因 watch 拦截不会走到这里。如果是30条，则加载第2页。
		let nextPageNum = Math.floor(item.data.length / PAGE_SIZE) + 1

		try {
			const nextData = await getDetailSingle(index, nextPageNum)

			if (nextData?.length) {
				parseCodeTableFlat(nextData, item.columns, item.codeValue || [])
				item.data.push(...nextData)
				if (nextData.length < PAGE_SIZE) item.finished = true
				emit('refresh')
			} else {
				item.finished = true
				emit('refresh')
			}
		} catch (e) {
			console.error('加载失败:', e)
		} finally {
			loadingMap[index] = false
		}
	}

	const category = [['png', ['jpg', 'jpeg']], ['ecel', ['xlsx', 'xls']], ['ppt', ['ppt', 'pptx']], ['word', ['docx', 'doc']], ['video', ['video', 'mp4']]]
	const png = type => category.find(e => e[1].includes(type))?.[0] || type
</script>

<style scoped lang="scss">
	/* 样式保持原样 */
	.page-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f6f7f9;
	}

	.tab-bar {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		justify-content: center;
		gap: 20rpx;
		padding: 24rpx;
		background-color: #fff;
	}

	.tab-item {
		padding: 14rpx 36rpx;
		font-size: 14px;
		color: #606266;
		background-color: #f2f3f5;
		border-radius: 32rpx;
	}

	.tab-item.active {
		background-color: #1677ff;
		color: #fff;
		font-weight: 600;
	}

	.card-section {
		flex: 1;
		height: 0;
		padding: 0;
	}

	.card-wrapper {
		max-width: 720rpx;
		margin: 0 auto;
		padding: 24rpx 10rpx;
		box-sizing: border-box;
	}

	.card {
		background: #fff;
		border-radius: 20rpx;
		padding: 28rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
	}

	.card-count {
		font-size: 12px;
		color: #b0b0b0;
		margin-bottom: 12rpx;
	}

	.card-field {
		display: flex;
		// justify-content: space-between;
		padding: 16rpx 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.field-label {
		font-size: 15px;
		color: #303133;
		font-weight: 500;
		text-align: left;
		word-break: break-all;
		max-width: 65%;
	}

	.field-value {
		font-size: 14px;
		color: #909399;
	}

	.annex-box {
		background-color: #f7f8fa;
		padding: 16rpx 24rpx;
		border: 1px solid #e0e0e0;
		border-top: none;
		margin-top: 12rpx;
	}

	.annex-title {
		font-size: 14px;
		color: #606266;
		margin-bottom: 8rpx;
	}

	.annex-row {
		display: flex;
		align-items: center;
		padding: 10rpx 0;
		border-bottom: 1px dashed #ddd;
	}

	.annex-icon {
		width: 40rpx;
		height: 40rpx;
		margin-right: 16rpx;
	}

	.annex-info {
		display: flex;
		flex-direction: column;
	}

	.annex-name {
		font-size: 14px;
		color: #333;
	}

	.annex-meta {
		font-size: 12px;
		color: #999;
	}

	.load-status {
		text-align: center;
		color: #bdbdbd;
		padding: 32rpx 0;
		font-size: 13px;
	}
</style>