<!-- 选择框 -->
<template>
	<view :style="{ 
			'borderBottom': underline ? '1rpx solid #f0f0f0' : '1rpx solid transparent',marginBottom: '20rpx'
	}" class="choiceListContent" @tap="choiceChange" v-if="showComponent">
		<view class="choiceList">
			<view @tap.stop="toBackLink" :style="{borderBottom:'2rpx dashed',borderBottomColor:IsBackLink ? '#123875' :'transparent' }">
				<up-icon v-if="iconTo && !IsBackLink" :custom-prefix="iconTo" :name="iconName" :color="IsRequired ? '#f75556' : iconColorUr" :size="iconSize"></up-icon>
				<up-icon v-else :name="IsBackLink ? 'attach' :  'file-text'" :color="IsRequired ? '#f75556' : iconColorUr" size="33"></up-icon>
				<text :style="{ fontSize:textSize+'rpx',marginLeft:'10rpx',color: IsRequired ? '#f75556' :  '',fontStyle:IsExtendField ? 'oblique 85deg' : null}">{{title}}</text>
			</view>
			<view class="R_icon">
				<up-icon name="arrow-right" color="#a8a8a8" size="33"></up-icon>
				<text :class="[prohibitChoice ? 'editColor' : null,'R_icon_text']">{{dataValue}}</text>
			</view>
		</view>
		<view style="display: flex;">
			<view style="flex: 1;">
			</view>
			<view style="flex:2.4;font-size: 26rpx;color:crimson;">
				{{dataValue && dataValue !='请选择' ? null : tips }}
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { withDefaults, watch, ref } from "vue"

	interface Props {
		textSize ? : String, //标题字体大小
			title ? : String, //标题
			dataValue ? : String, //选中内容
			showComponent ? : Boolean, //是否显示该组件
			underline ? : Boolean, //下划线
			prohibitChoice ? : Boolean, //禁用
			iconColorUr ? : String, //图标颜色
			IsRequired ? : Boolean, //是否必填
			tips ? : String, //提示
			IsExtendField ? : Boolean, // 扩展字段
			IsBackLink ? : Boolean, // 反链
			paramsobject ? : String, //自定义配置
			iconSize ? : String //图标大小
	}
	interface Emit {
		(e: "choiceChange"): void;
		(e: "toBackLink"): void;
	}
	let emit = defineEmits < Emit > ();
	let props = withDefaults(defineProps < Props > (), {
		textSize: () => "30",
		title: () => "标题",
		dataValue: () => "",
		showComponent: () => true,
		underline: () => true,
		prohibitChoice: () => false,
		iconColorUr: () => "#2979ff",
		IsRequired: () => false,
		tips: () => "",
		IsExtendField: () => false,
		IsBackLink: () => false,
		paramsobject: () => "",
		iconSize: () => "32",
	})
	let iconTo: RefType < string > = ref(null);
	let iconName: RefType < string > = ref(null);
	watch(() => props.paramsobject, (newValue) => {
		if (newValue) {
			try {
				let ParamsObject = JSON.parse(newValue);
				iconTo.value = ParamsObject.icon.type !== null  && ParamsObject.icon.type !== undefined ? ParamsObject.icon.type : "custom-icon";
				iconName.value = ParamsObject.icon.name;
			} catch (e) {
				//TODO handle the exception
			}

		}

	}, {
		immediate: true
	})

	// 点击选择按钮
	let choiceChange = () => {
		if (!props.prohibitChoice)
			emit("choiceChange");
	}
	let toBackLink = () => {
		if (props.IsBackLink) emit("toBackLink")
	}
</script>

<style lang="scss" scoped>
	.choiceListContent {
		width: 100%;


		.choiceList {
			padding: 20rpx 0;
			display: flex;
			justify-content: space-between;

			.R_icon {
				width: 70%;
				overflow: hidden;
				display: flex;
				flex-direction: row-reverse;
				justify-content: space-between;

				.R_icon_text {
					font-size: 30rpx;
					overflow: auto;
					color: #333333;
					margin-right: 5px;
					white-space: pre;
				}

				.editColor {
					color: #909090;
				}
			}
		}
	}
</style>
