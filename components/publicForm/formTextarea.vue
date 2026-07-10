<!-- 多行文本框 -->
<template>
	<view class="textareaContent" :style="{'borderBottom': underline ? '1rpx solid #f0f0f0' :'1rpx solid transparent'}"
		v-if="showComponent">
		<view class="textareaTitle">
			<view @tap="toBackLink">
				<up-icon style="margin-right: 8rpx;" :name="icontype" :color="IsRequired ? '#f75556' : iconColorUr"
					:size="iconSize"></up-icon>
				<text
					:style="[{fontSize:textSize,color: IsRequired ? '#f75556' :  '',fontStyle:IsExtendField ? 'oblique 85deg' : null}]">{{title+':'}}</text>
			</view>
			<text>{{textLength ? textValueLenght + "/" + textLength : textValueLenght + "/" + "~"}}</text>
		</view>
		<view class="textareaContainer" :style="{color:prohibitText ? '#909090' : '#333',fontSize:'30rpx'}">
			<textarea :disabled="prohibitText" :maxlength="!textLength ? -1 : textLength" :value="textValue"
				:placeholder="textPlaceholder" @input="getIpValue($event)"></textarea>
		</view>
		<view style="display: flex;">
			<view style="flex: 1;">
			</view>
			<view style="flex:2.4;font-size: 26rpx;color:crimson;">
				{{ parseInt(textValueLenght) > 0 ? null :tips}}
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import {
		withDefaults,
		ref,
		watch
	} from "vue"
	interface Props {
		textSize ? : String, //标题字体大小
			title ? : String, //标题
			value ? : any, //内容
			tips ? : String,
			index ? : String | Number, //索引
			textLength ? : any, //文本长度
			showComponent ? : Boolean, //是否显示该组件
			icontype ? : String, //图标类型
			iconColorUr ? : String, //图标颜色
			iconSize ? : String, //图标大小
			underline ? : Boolean, //下划线
			prohibitText ? : Boolean, //禁用
			IsRequired ? : Boolean, //是否必填
			ParamsObj ? : String, //配置信息
			IsExtendField ? : Boolean, // 扩展字段
			IsBackLink ? : Boolean, // 反链
	}

	interface Emit {
		(e: "textareaModule", event ? : String, index ? : String | Number): void;
		(e: "toBackLink"): void;
	}
	let emit = defineEmits < Emit > ();
	const props = withDefaults(defineProps < Props > (), {
		textSize: () => "30",
		title: () => "标题",
		value: () => "",
		tips: () => "",
		index: () => 0,
		textLength: () => 3000,
		showComponent: () => true,
		icontype: () => "edit-pen",
		iconColorUr: () => "#2979ff",
		iconSize: () => "32",
		underline: () => true,
		prohibitText: () => false,
		IsRequired: () => false,
		ParamsObj: () => "",
		IsExtendField: () => false,
		IsBackLink: () => false,
	})
	let textValueLenght: any = ref('0'); //输入内容长度
	let textValue: any = ref(''); //输入内容
	let textPlaceholder: any = ref('');
	watch(() => props.value, (newValue: String) => {
		let str = newValue;
		if (str === null) return;
		if (typeof str != "string") str += "";
		textValueLenght.value = str.replace(/[^\x00-\xff]/g, "01").length;
		textValue.value = str;

	}, {
		immediate: true
	})
	watch(() => props.ParamsObj, (newValue: string) => {
		if (newValue) {
			try {
				let ParamsObject = JSON.parse(newValue);
				if (ParamsObject.placeholder) {
					textPlaceholder.value = props.prohibitText ? "" : ParamsObject.placeholder;
				}
			} catch (e) {}
		}
	}, {
		deep: true,
		immediate: true
	})


	let timeID = null;
	/**搜索输入框监听内容*/
	let getIpValue = (event: any) => {
		let str = event.detail.value;
		if (str === null) return;
		if (typeof str != "string") str += "";
		textValueLenght.value = str.replace(/[^\x00-\xff]/g, "01").length;
		if (timeID) {
			clearTimeout(timeID)
		}
		timeID = setTimeout(() => { //对标签进行解析,由于小程序无法操作dom无法对内容进行加粗与添加图片等功能
			emit("textareaModule", str, props.index);
			timeID = null;
		}, 300)
	};
	let toBackLink = () => {
		if (props.IsBackLink) emit("toBackLink")
	}
</script>

<style lang="scss" scoped>
	.textareaContent {
		width: 100%;
		// border-top: 1rpx solid #f0f0f0;
		padding-bottom: 10rpx;
		margin-bottom: 10rpx;

		.textareaTitle {
			display: flex;
			justify-content: space-between;
			margin: 30rpx 0;
		}

		.textareaContainer {
			border: 1px solid rgb(217, 217, 217);
			border-radius: 10rpx;
			padding: 20rpx;

			textarea {
				font-size: 28rpx;
				width: 100%;
			}
		}


	}
</style>
