<!-- 进度条 -->
<template>
	<view style="margin-bottom: 20rpx;" v-if="showComponent">
		<view :class="['scoreFormCentent',prohibitProgressBar  ? 'Q_shake' :'']" :style="{
				'display': display ?'flex' :'',
				    'borderBottom': tipsBorder? '1rpx solid crimson' : underline ? '1rpx solid #f0f0f0' :'1rpx solid transparent'
			}">
			<view class="scoreFormTitle" :style="{borderBottom:'2rpx dashed',borderBottomColor:IsBackLink ? '#123875' :'transparent' ,flex: display ? '1' : null}" @tap="toBackLink">
				<view class="scoreFormTitleIcon">
					<up-icon :name="IsBackLink ? 'attach' : icontype" :color="IsRequired ? '#f75556' : iconColorUr" :size="iconSize"></up-icon>
				</view>
				<view class="scoreFormTitleText" :style="{color: IsRequired ? '#f75556' :  '',fontStyle:IsExtendField ? 'oblique 85deg' : null}">
					<text>{{title}}</text>
				</view>

			</view>
			<view class="scoreFormCententBox" :style="display ? 'flex: 2.4;' : ''">
				<view class="scoreFormInputPlay">
					<up-slider @end="endFn" :disabled="prohibitProgressBar" v-model="sliderData" height="16" block-width="30" block-color="white" :min="progressMin" :max="progressMax">
						<view>
							<view class="badge-button">
								{{sliderData}}
							</view>
						</view>
					</up-slider>
				</view>

			</view>
		</view>
		<view style="display: flex;">
			<view style="flex: 1;">
			</view>
			<view style="flex:2.4;font-size: 16rpx;color:crimson;">
				{{tips}}
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import {
		withDefaults,
		ref,
		watch
	} from "vue"
	interface Props {
		showComponent ? : Boolean,
			prohibitProgressBar ? : Boolean, //控制是否可滑动
			tips ? : String, //提示
			tipsBorder ? : Boolean, //下滑线提示
			display ? : Boolean, //左右布局
			title ? : String, //标题
			icontype ? : String, //图标类型
			iconColorUr ? : String, //图标颜色
			iconSize ? : String, //图标大小
			underline ? : Boolean, //下划线
			progressBarItem ? : any, //进度条数据
			IsRequired ? : Boolean, //是否必填
			IsExtendField ? : Boolean, // 扩展字段
			IsBackLink ? : Boolean, // 反链
	}
	interface Emit {
		(e: "progressBarFunction", sliderData ? : String | Number, scoreItem ? : Object): void;
		(e: "toBackLink"): void;
	}
	let emit = defineEmits < Emit > ();
	const props = withDefaults(defineProps < Props > (), {
		showComponent: () => true,
		prohibitProgressBar: () => true,
		tipsBorder: () => false,
		display: () => false,
		tips: () => "",
		title: () => "标题", //标题
		icontype: () => "hourglass-half-fill", //图标类型
		iconColorUr: () => "#2979ff", //图标颜色
		iconSize: () => "32", //图标大小
		underline: () => true,
		progressBarItem: () => {},
		IsRequired: () => false,
		IsExtendField: () => false,
		IsBackLink: () => false,
	})

	let sliderData: {
		value: String | Number
	} = ref(props.progressBarItem.dataValue || 0);//原来是  ?? 兼容钉钉
	let progressMin: {
		value: String | Number
	} = ref(0);
	let progressMax: {
		value: String | Number
	} = ref(100);
	watch(() => props.progressBarItem.dataValue, (newValue: Number | String) => {
		sliderData.value = newValue;
	})
	let endFn = () => {
		emit("progressBarFunction", sliderData.value, props.progressBarItem)
	}
	let toBackLink = () => {
		if (props.IsBackLink) emit("toBackLink")
	}
</script>

<style lang="scss">
	.scoreFormCentent {
		width: 100%;

		.scoreFormTitle {
			display: flex;
			align-items: center;
			margin: 20rpx 0;

			.scoreFormTitleIcon {
				margin-right: 8rpx;
			}
		}

		.scoreFormCententBox {
			width: calc(100% - 1rpx);
			display: flex;
			align-items: center;
			// border: 1rpx solid #bfbfbf;
			border-radius: 8rpx;

			.scoreFormInputIcon {
				width: 7%;
				text-align: center;
				margin-right: 15rpx;
			}

			.scoreFormInputPlay {
				width: 100%;
				margin-left: 10rpx;
				margin-right: 10rpx;

				.badge-button {
					padding: 4rpx 6rpx;
					background-color: var(--backGround);
					color: #fff;
					border-radius: 6rpx;
					font-size: 22rpx;
					line-height: 1;
				}

				input {
					padding: 10rpx 0;
				}
			}
		}
	}
</style>
