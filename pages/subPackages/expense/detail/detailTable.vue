<template>
	<view class="page-root">
		<scroll-view id="tableScroll" scroll-y class="table-layout-root" @scroll="onScroll">
			<view v-for="(item, index) in visibleTables" :key="index" :id="`table-${index}`" class="table-container">

				<view class="title">
					{{ item.title }}
					<!-- 点击旋转按钮：存缓存 + 跳转 -->
					<image @click="goRotatePage(item)" src="/static/pingmuxuanzhuan.png" mode="aspectFit" />
				</view>

				<render name="grid" v-model="item.data" :config="{
                          mode: 'list',
                          edit: false,
                          columns: item.columns,
                          count: visibleTables.length
                        }" @next-page="nextPage(index, item)" />

			</view>
		</scroll-view>

		<SectionProgress ref="progressRef" :sections="sections" :scroll-top="scrollTop" scroll-view-id="tableScroll" />
	</view>
</template>

<script setup lang="ts">
	import { reactive, watch, computed, ref, nextTick } from 'vue'
	import render from '../../autopage/components'
	import SectionProgress from '@/components/SectionProgress/SectionProgress.vue'
	import { getDetailSingle, parseCodeTableFlat } from '@/api/expense'

	const data = defineModel<any[]>({ default: [] })
	const emit = defineEmits(['refresh'])

	const scrollTop = ref(0)
	const progressRef = ref()

	const visibleTables = computed(() =>
		data.value.filter(d => d.data && d.data.length > 0)
	)

	const sections = computed(() =>
		visibleTables.value.map((item, index) => ({
			id: `table-${index}`,
			title: item.title
		}))
	)

	const loadingMap = reactive<Record<number, boolean>>({})
	const PAGE_SIZE = 30

	function onScroll(e) {
		scrollTop.value = e.detail.scrollTop
	}

	watch(() => data.value, (newVal) => {
		newVal?.forEach(item => {
			if (item.data?.length > 0 && item.data.length < PAGE_SIZE && item.finished === undefined) {
				item.finished = true
			}
		})
	}, { immediate: true, deep: true })

	watch(() => visibleTables.value.length, () => {
		nextTick(() => {
			progressRef.value?.calcSectionTops()
		})
	}, { immediate: true })

	/** 点击旋转按钮：存缓存 + 跳转 */
	function goRotatePage(item) {
		const payload = {
			title: item.title,
			columns: item.columns,
			data: JSON.parse(JSON.stringify(item.data)) // 深拷贝，保证数据存在
		}
		uni.setStorageSync('rotateTableData', payload)
		uni.navigateTo({
			url: '/pages/subPackages/expense/detail/rotateTable'
		})
	}

	async function nextPage(index, item) {
		if (loadingMap[index] || item.finished) return

		loadingMap[index] = true
		try {
			const page = Math.floor(item.data.length / PAGE_SIZE) + 1
			const nextData = await getDetailSingle(index, page)

			if (nextData && nextData.length > 0) {
				parseCodeTableFlat(nextData, item.columns, item.codeValue || [])
				item.data.push(...nextData)

				if (nextData.length < PAGE_SIZE) {
					item.finished = true
				}
				emit('refresh')
			} else {
				item.finished = true
			}
		} finally {
			loadingMap[index] = false
		}
	}
</script>

<style scoped lang="scss">
	.page-root {
		position: relative;
		margin-left: 15rpx;
		margin-right: 15rpx;
	}

	.title {
		text-align: center;
		color: #606266;
		background-color: #007aff0d;
		height: 40px;
		line-height: 40px;
		font-size: 16px;
		border: 1px solid #dfe2e5;
		position: relative;

		&>image {
			height: 22px;
			width: 22px;
			position: absolute;
			top: 9px;
			right: 9px;
		}
	}

	.table-layout-root {
		max-height: 100vh;
		overflow: hidden;
	}

	.table-container {
		transition: all 0.4s ease-in-out;
		margin-top: 30rpx;
		background-color: #fff;
	}
</style>