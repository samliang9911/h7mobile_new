<template>
	<view class="section-progress">
		<view v-for="(item, index) in sections" :key="item.id" class="progress-item"
			:class="{ active: index === activeIndex }" @tap="scrollTo(index)">
			<view class="dot" />
			<text class="label">{{ item.title }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, watch, PropType } from 'vue'

	const props = defineProps({
		sections: {
			type: Array as PropType<{ id : string; title : string }[]>,
			required: true
		},

		/** scroll-view 的 scrollTop */
		scrollTop: {
			type: Number,
			required: true
		},

		/** scroll-view 容器 id */
		scrollViewId: {
			type: String,
			required: true
		},

		/** 吸顶偏移（如自定义导航栏高度） */
		offsetTop: {
			type: Number,
			default: 0
		}
	})

	const activeIndex = ref(props.sections.length === 1 ? 0 : 1)
	const sectionTops = ref<number[]>([])

	/**
	 * 初始化：获取所有 section 的 top
	 */
	function calcSectionTops() {
		const query = uni.createSelectorQuery()
		query.select(`#${props.scrollViewId}`).boundingClientRect()

		props.sections.forEach(item => {
			query.select(`#${item.id}`).boundingClientRect()
		})

		query.exec(res => {
			const containerTop = res[0]?.top || 0

			sectionTops.value = res
				.slice(1)
				.map(r => r.top - containerTop)
		})
	}

	/**
	 * 根据 scrollTop 计算当前激活 section
	 */
	function updateActive(scrollTop : number) {
		if (!sectionTops.value.length) return

		// scroll-view 可视区域高度
		uni.createSelectorQuery()
			.select(`#${props.scrollViewId}`)
			.boundingClientRect()
			.exec(res => {
				const containerHeight = res[0]?.height || 0
				const viewCenter = scrollTop + containerHeight / 2

				let minDistance = Infinity
				let active = 0

				sectionTops.value.forEach((top, index) => {
					const nextTop = sectionTops.value[index + 1] ?? Infinity
					const sectionCenter = (top + nextTop) / 2
					const distance = Math.abs(sectionCenter - viewCenter)

					if (distance < minDistance) {
						minDistance = distance
						active = index
					}
				})

				activeIndex.value = active
			})
	}

	/**
	 * 点击跳转
	 */
	function scrollTo(index : number) {
		uni.createSelectorQuery()
			.select(`#${props.sections[index].id}`)
			.boundingClientRect()
			.select(`#${props.scrollViewId}`)
			.boundingClientRect()
			.exec(res => {
				const targetTop = res[0].top - res[1].top
				uni.pageScrollTo({
					scrollTop: targetTop,
					duration: 300
				})
			})
	}

	watch(
		() => props.scrollTop,
		(val) => updateActive(val)
	)

	defineExpose({
		calcSectionTops
	})
</script>

<style scoped>
	.section-progress {
		position: fixed;
		right: 16rpx;
		top: 50%;
		transform: translateY(-50%);
		z-index: 999;
	}

	.progress-item {
		display: flex;
		align-items: center;
		margin: 16rpx 0;
		opacity: 0.4;
	}

	.progress-item.active {
		opacity: 1;
	}

	.dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background-color: #409eff;
		margin-right: 12rpx;
	}

	.label {
		font-size: 24rpx;
		white-space: nowrap;
	}
</style>