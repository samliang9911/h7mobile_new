<!-- 评分 -->
<template>
	<view style="margin-bottom: 20rpx;" v-if="showComponent">
		<view :class="['scoreFormCentent',prohibitScore  ? 'Q_shake' :'']" :style="{
				'display': display ?'flex' :'',
				    'borderBottom': tipsBorder? '1rpx solid crimson' : underline ? '1rpx solid #f0f0f0' :'1rpx solid transparent'
			}">
			<view class="scoreFormTitle" :style="{borderBottom:'2rpx dashed',borderBottomColor:IsBackLink ? '#123875' :'transparent' ,flex: display ? '1' : null}" @tap="toBackLink">
				<view class="scoreFormTitleIcon">
					<up-icon :name="icontype" :color="IsRequired ? '#f75556' : iconColorUr" :size="iconSize"></up-icon>
				</view>
				<view class="scoreFormTitleText" :style="{color: IsRequired ? '#f75556' :  '',fontStyle:IsExtendField ? 'oblique 85deg' : null}">
					<text>{{title}}</text>
				</view>

			</view>
			<view class="scoreFormCententBox" :style="display ? 'flex: 2.4;' : ''">
				<view class="scoreFormInputPlay">
					<up-rate v-model="current" active-color="#2979ff" size="50" :current="current" :disabled="prohibitScore" @change="scoreDateFn"></up-rate>
				</view>

			</view>
		</view>
		<view style="display: flex;">
			<view style="flex: 1;">
			</view>
			<view style="flex:2.4;font-size: 16rpx;color:crimson;">
				{{dataValue ? null :tips}}
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
	interface Emit {
		(e: "change", value ? : [Number, String], scoreItem ? : Object): void;
		(e: "toBackLink"): void;
	}
	let emit = defineEmits < Emit > ();

	interface Props {
		showComponent ? : Boolean,
			prohibitScore ? : Boolean, //控制是否可评分
			tips ? : String, //提示
			tipsBorder ? : Boolean, //下滑线提示
			display ? : Boolean, //左右布局
			title ? : String, //标题
			icontype ? : String, //图标类型
			iconColorUr ? : String, //图标颜色
			iconSize ? : String, //图标大小
			dataValue ? : String | Number, //初始值
			scoreItem ? : any, //评分数据
			underline ? : Boolean, //下划线
			IsRequired ? : Boolean, //是否必填
			IsExtendField ? : Boolean, // 扩展字段
			IsBackLink ? : Boolean, // 反链
	}
	const props = withDefaults(defineProps < Props > (), {
		showComponent: () => true,
		prohibitScore: () => true,
		tipsBorder: () => false,
		display: () => false,
		tips: () => "",
		title: () => "标题", //标题
		icontype: () => "star", //图标类型
		iconColorUr: () => "#2979ff", //图标颜色
		iconSize: () => "32", //图标大小
		dataValue: () => 0,
		scoreItem: () => {},
		underline: () => true,
		IsRequired: () => false,
		IsExtendField: () => false,
		IsBackLink: () => false,
	})

	let current: {
		value: Number
	} = ref(Number(props.dataValue)); //默认选择数量
	watch(() => props.dataValue, (newValue: Number) => {
		current.value = newValue;
	})
	let scoreDateFn = (value: any) => {
		emit("change", value, props.scoreItem);
	}
	let toBackLink = () => {
		if (props.IsBackLink) emit("toBackLink")
	}
</script>

<style lang="scss" scoped>
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

				input {
					padding: 10rpx 0;
				}
			}
		}
	}
</style>
