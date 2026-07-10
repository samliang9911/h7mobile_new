<template>
	<view class="timeLineLayout">
		<view class="sliderBlock">
			<view
				id="marginWidthRunRef"
				ref="marginWidthRunRef"
				@click="handleSwitchChange"
				class="block"
				:style="'border: 2rpx solid ' + backGroundColour + ';'"
			>
				<view style="z-index: 1; background-color: transparent;">
					<text
						:style="
							!valueSwitch
								? 'transparent;transition: all .2s;margin-left: 10rpx;color: ' + backGroundColour + ';'
								: 'transparent;transition: all .2s;margin-left: 10rpx;color: #eeeeee;'
						"
					>
						预计
					</text>
				</view>

				<view
					:style="
						valueSwitch
							? 'border-top: 62rpx solid ' +
							  backGroundColour +
							  ';width:50%;transition: all .2s ease-in-out;position: absolute;margin-left:' +
							  parseInt(parseInt(marginWidthRun) + parseInt(marginWidth)) +
							  'px;border-left:15rpx solid transparent;right: 1rpx;width: 50%;background-color: transparent;'
							: 'left: 1rpx;width: 50%;background-color: transparent;margin-right:' +
							  parseInt(parseInt(marginWidthRun) + parseInt(marginWidth)) +
							  'px;border-top: 62rpx solid ' +
							  backGroundColour +
							  ';width:50%;transition: all .2s ease-in-out;position: absolute;border-right: 15px solid transparent;'
					"
				>
				</view>

				<view style="z-index: 1; background-color: transparent;">
					<text
						:style="
							valueSwitch
								? 'transparent;transition: all .2s;margin-left: 10rpx;color: ' + backGroundColour + ';'
								: 'transparent;transition: all .2s;margin-left: 10rpx;color: #eeeeee;'
						"
					>
						实况
					</text>
				</view>
			</view>
		</view>

		<up-steps :current="currentStep" direction="column" activeColor="#19be6b">
			<up-steps-item v-for="(item, index) in timeListComputed" :key="index">
				<template #icon>
					<view class="slot-icon" :class="getStepIconClass(item, index)">
						<text>{{ index + 1 }}</text>
					</view>
				</template>

				<template #content>
					<view class="slot-title" :style="{ color: item.Status ? '#666' : '#c8c9cc' }">
						<view class="u-order-title">
							<view class="u-order-title-name">{{ item.ActivityName || '' }}</view>
							<view class="u-order-title-time">
								{{ getNodeDisplayTime(item) }}
							</view>
						</view>
					</view>

					<view class="slot-desc" :style="{ color: item.Status ? '#8a8f99' : '#c8c9cc' }">
						<view v-for="(executorItem, executorIndex) in item.ExecutorInfo" :key="executorIndex">
							<view
								class="agree"
								:style="executorItem.IdeaContent === executorItem.IdeaCodeValue ? 'display:none;' : 'display:block;'"
							>
								{{ executorItem.IdeaCodeValue || '' }}
							</view>

							<view class="pact">{{ executorItem.IdeaContent || '' }}</view>

							<view class="foot-text">
								<view>
									<image v-if="executorItem.FilePath" class="qianming-img" :src="executorItem.FilePath"></image>
									<view v-else class="foot-name">
										{{ executorItem.ExecutorName || '' }}
									</view>
								</view>
								<view class="foot-time">
									{{
										executorItem.FinishDate === '1900-01-01' ||
										executorItem.FinishDate === '' ||
										executorItem.FinishDate === undefined
											? ''
											: executorItem.FinishDate
									}}
								</view>
							</view>
						</view>
					</view>
				</template>
			</up-steps-item>
		</up-steps>
	</view>
</template>

<script setup lang="ts">
import { startUserImage } from "@/utils/instrumentType.js";
import { computed, withDefaults, ref, getCurrentInstance } from "vue";
import { onShow } from "@dcloudio/uni-app";

let { proxy } = getCurrentInstance() as any;
let timeListTotal = ref<any[]>([]);
let valueSwitch = ref(true);
let marginWidthRunRef = ref();
let backGroundColour = ref(startUserImage().colour);
let marginHeightRun = ref(0);
let marginWidth = ref(0);

let iconBackground = ref({ background: "#19be6b" });
let textFontColor = ref({ "text-font-color": true });
let errText = ref("你还没有流程");
let stepList = ref([]);

interface Props {
	preditLineData: any[];
	actuallyLineData: any[];
	currentStep: number;
}

const props = withDefaults(defineProps<Props>(), {
	preditLineData: () => [],
	actuallyLineData: () => [],
	currentStep: 0,
});

const handleSwitchChange = () => {
	valueSwitch.value = !valueSwitch.value;
	// #ifdef APP-PLUS
	uni.createSelectorQuery().in(proxy).select("#marginWidthRunRef").boundingClientRect().exec((rect: any) => {
		marginHeightRun.value = rect[0].height;
		marginWidth.value = (rect[0].width / 2) * 0.84;
	});
	// #endif
};

const marginWidthRun = computed(() => 0);
let finallyFinishDate = computed(() => false);

/** 取节点“到达时间”：
 * 优先 item.sys_created
 * 其次 ExecutorInfo 里任意一个 sys_created
 */
const getNodeReachedTime = (item: any) => {
	const nodeTime = item?.sys_created ?? item?.Sys_Created ?? item?.sysCreated;
	if (nodeTime !== undefined && nodeTime !== null && String(nodeTime).trim() !== "") return nodeTime;

	const list = item?.ExecutorInfo || [];
	const executorTimeItem = list.find((x: any) => {
		const t = x?.sys_created ?? x?.Sys_Created ?? x?.sysCreated;
		return t !== undefined && t !== null && String(t).trim() !== "";
	});
	if (executorTimeItem) {
		return executorTimeItem?.sys_created ?? executorTimeItem?.Sys_Created ?? executorTimeItem?.sysCreated;
	}

	return "";
};

const hasReachedNode = (item: any) => {
	return String(getNodeReachedTime(item) || "").trim() !== "";
};

// 标题时间：优先到达时间 sys_created，否则预计时间 createTime
const getNodeDisplayTime = (item: any) => {
	const reachedTime = getNodeReachedTime(item);
	if (reachedTime) return reachedTime;
	return item?.createTime || "";
};

/**
 * 数字圆点颜色逻辑
 * - 已完成：绿色（有完成时间 或 ResolutionCode != UnProcessed）
 * - 已到达未完成：粉红色（有 sys_created，但未完成）
 * - 未到达：灰色
 */
const getStepIconClass = (item: any, index: number) => {
	const firstExecutor = item?.ExecutorInfo?.[0] || {};
	const code = firstExecutor?.ResolutionCode;
	const reached = hasReachedNode(item);

	// 是否已完成（更稳：看任一执行人有有效 FinishDate，或 code 明确非未处理）
	const hasFinished = (item?.ExecutorInfo || []).some((x: any) => {
		const d = x?.FinishDate;
		return d && d !== "" && d !== "1900-01-01";
	});

	if (hasFinished || (code && code !== "UnProcessed")) {
		return "is-finished";
	}

	// 已到达但未审批完成：显示你指定颜色
	if (item?.createTime && (!code || code == "UnProcessed")) {
		return "is-pending";
	}

	return "is-waiting";
};

const timeListComputed = computed(() => {
	if (valueSwitch.value) {  //预计
		console.log("1",props.preditLineData)
		return timeListTotal.value.length > 0 ? timeListTotal.value : props.preditLineData;
	} else {
		console.log("2",props.preditLineData)
		timeListTotal.value = props.preditLineData as any;
		return props.actuallyLineData;  //实况
	}
});

onShow(() => {});
</script>

<style lang="scss" scoped>
.timeLineLayout {
	margin-left: 20rpx;
	margin-right: 20rpx;
}

.sliderBlock {
	transition: all 0.2s ease-in-out;
	display: flex;
	flex-direction: row-reverse;
	align-items: center;
	margin: 10rpx;

	.block {
		width: 250rpx;
		padding: 15rpx;
		font-size: 26rpx;
		border-radius: 6rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: row-reverse;
		position: relative;
	}
}

.text-font-color {
	color: rgb(200, 200, 200);
}

/* 对齐修复（uview兼容） */
:deep(.u-steps-item),
:deep(.up-steps-item) {
	align-items: flex-start !important;
}

:deep(.u-steps-item__wrapper),
:deep(.up-steps-item__wrapper),
:deep(.u-steps-item__icon),
:deep(.up-steps-item__icon) {
	display: flex !important;
	align-items: flex-start !important;
	justify-content: center;
	padding-top: 0 !important;
	margin-top: 0 !important;
}

:deep(.u-steps-item__content),
:deep(.up-steps-item__content) {
	padding-top: 0 !important;
	margin-top: 0 !important;
	color: #8a8f99;
}

:deep(.u-steps-item__content__title),
:deep(.up-steps-item__content__title),
:deep(.u-steps-item__content__desc),
:deep(.up-steps-item__content__desc) {
	margin-top: 0 !important;
	padding-top: 0 !important;
}

:deep(.u-steps-item__line),
:deep(.up-steps-item__line) {
	top: 22rpx !important;
}

/* 数字圆点 */
.slot-icon {
	width: 42rpx;
	height: 42rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 22rpx;
	color: #fff;
	line-height: 1;
	text-align: center;
	box-sizing: border-box;
	margin-top: 0 !important;
	flex-shrink: 0;
	background-color: #c8c9cc;
}

.slot-icon.is-finished {
	background-color: #19be6b;
	color: #fff;
}

/* 重点：不用8位hex，改 rgba，兼容性更好 */
.slot-icon.is-pending {
	background-color: rgba(255, 0, 76, 0.67);
	color: #fff;
}

.slot-icon.is-waiting {
	background-color: #c8c9cc;
	color: #fff;
}

.slot-title {
	line-height: 1.4;
}

.u-order-title {
	font-size: 30rpx;
	font-weight: 600;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	line-height: 1.4;
	color: #606266;
}

.u-order-title-name {
	flex: 1;
	padding-right: 12rpx;
	word-break: break-word;
	overflow-wrap: break-word;
}

.u-order-title-time {
	margin-right: 4%;
	font-size: 24rpx;
	font-weight: 400;
	line-height: 1.4;
	color: #909399;
	flex-shrink: 0;
}

.slot-desc {
	margin: 10rpx 0 10rpx 24rpx;
	min-height: 100rpx;
	line-height: 1.6;

	.agree {
		margin-top: 15rpx;
		font-size: 25rpx;
		color: #606266;
		word-break: break-word;
	}

	.pact {
		margin: 10rpx 0;
		font-size: 25rpx;
		color: #909399;
		word-break: break-word;
		overflow-wrap: break-word;
	}

	.foot-text {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.foot-time {
			margin-right: 4%;
			font-size: 26rpx;
			font-weight: 400;
			color: #a0a4ab;
			line-height: 1.4;
			flex-shrink: 0;
			text-align: right;
		}

		.qianming-img {
			width: 105px;
			height: 35px;
			object-fit: contain;
		}

		.foot-name {
			font-size: 28rpx !important;
			font-weight: 500;
			font-family: "隶书", Helvetica Neue, Helvetica, sans-serif;
			color: #606266;
			line-height: 1.4;
			word-break: break-word;
		}
	}
}

.finish {
	min-height: 0;
}

.u-order-time {
	color: rgb(200, 200, 200);
	font-size: 26rpx;
}

.u-time-axis::before {
	border-left: 1px solid #000;
}
</style>