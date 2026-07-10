<!-- 上传文件 -->
<template>
	<view class="imageListContent" v-if="showComponent">
		<view class="imageListTitle">
			<view>
				<up-icon name="photo" :color="IsRequired ? '#f75556' : iconColorUr" size="33"></up-icon>
				<text
					:style="[{fontSize: textSize,marginLeft:'10rpx',color: IsRequired ? '#f75556' :  ''}]">{{title}}</text>
			</view>
			<text
				style="font-size: 28rpx;">{{ pitrueList['length'] + '/' + (!uploadQuantity ? 'N' : Number(uploadQuantity))}}</text>
		</view>
		<view>
			<up-upload @on-get-file-name="getFileName" :BusinessState="BusinessState" :deletable="!prohibitPictrue"
				:uploadText="mark === 'a' ? '选择图片' : '选择文件'" :mark="mark" :file-list="fileList" ref="uUpload"
				:auto-upload="false" :max-count="prohibitPictrue ? 0 : Number(!uploadQuantity  ? 999 : uploadQuantity)"
				@on-choose-complete="onchoicePicture" :before-remove="onRemovePicTrue" @on-set-file-name="setfiename">
			</up-upload>
		</view>
		<view style="display: flex;">
			<view style="flex: 1;">
			</view>
			<view style="flex:2.4;font-size: 26rpx;color:crimson;">
				{{IsRequiredReturn ? '' : tips}}
			</view>
		</view>
		<up-top-tips v-show="tipsShow" ref="uTips1"></up-top-tips>
	</view>
</template>

<script lang="ts" setup>
	import {
		withDefaults,
		ref,
		watch,
		getCurrentInstance
	} from "vue"
	import { //自己的工具包
		guid, //guid
		getUrlType
	} from "@/utils/instrument/instrumentType.js"
	let {
		proxy
	} = getCurrentInstance() as any;
	interface Props {
		textSize ?: String, //标题字体大小
		title ?: String, //标题
		fileList ?: Array<any>, //回显图片
		mark ?: String, //图片标识
		identification ?: Number, //子组件标识
		showComponent ?: Boolean, //是否显示该组件
		uploadQuantity ?: String | Number,
		prohibitPictrue ?: Boolean, //禁用
		iconColorUr ?: String, //图标颜色
		tips ?: String,
		IsRequired ?: Boolean, //是否必填
		BusinessState ?: String, //标题字体大小
	}
	interface Emit {
		(e : String, event ?: any, mark ?: any, identification ?: any, imageType ?: any, ImageMarkersId ?: any,
			imageFile ?: any) : void;
	}
	let emit = defineEmits<Emit>();
	const props = withDefaults(defineProps<Props>(), {
		textSize: () => "30",
		title: () => "标题",
		fileList: () => [],
		mark: () => "",
		identification: () => 0,
		showComponent: () => true,
		uploadQuantity: () => null,
		prohibitPictrue: () => false,
		iconColorUr: () => "#2979ff",
		tips: () => "",
		IsRequired: () => false,
		BusinessState: () => "",
	})

	let pitrueList : {
		value : Array<any>
	} = ref([]); //图片内容
	let IsRequiredReturn = ref(true);
	let OID = guid();

	watch(() => props.IsRequired, (newValue) => {
		if (newValue) {
			IsRequiredReturn.value = false;
			emit("getIsRequired", false, OID); //图片数据  false 表示未填
		}
	}, {
		immediate: true
	});
	watch(() => props.fileList, (newValue) => {
		IsRequiredReturn.value = true;
		emit("getIsRequired", true, OID); //图片数据  false 表示未填
		for (let i = 0; i < newValue.length; i++) {
			if (!newValue[i].url) {
				let item = newValue[i];
				newValue[i].url = getUrlType(proxy) + '/' + item.FilePath;
				pitrueList.value.push(item)
			}
		}
	}, {
		immediate: true,
		deep: true
	});
	/**选完图片触发*/
	let onchoicePicture = (lists : any) => {
		if (lists.length >= 1) {
			IsRequiredReturn.value = true;
			emit("getIsRequired", true, OID); //图片数据
		}
		lists.forEach((item : any) => {

			if (!item.markers) {
				item.markers = guid();
			}
		})

		pitrueList.value = lists;
		pictrueData(null, null, null);
	};
	let onRemovePicTrue = (listIndex : any, lists : any) => {
		if (lists.length === 0) {
			IsRequiredReturn.value = false;
			emit("getIsRequired", false, OID); //图片数据
		}
		// return;
		// pitrueList.splice(listIndex, 1);
		pictrueData("delImage", lists[listIndex].markers, lists[listIndex]);
	}
	let pictrueData = (imageType : any, ImageMarkersId : any, imageFile : any) => {
		emit("pictrueData", pitrueList.value, props.mark, props.identification, imageType, ImageMarkersId,
			imageFile); //图片数据
	}

	let setfiename = (OID : string, name : string, fileextname : string) => {
		emit("setfiename", OID, name, fileextname); //修改名称
	}
	const tipsShow = ref(false);//显示 tips 提示
	let getFileName = (name : string) => {
		tipsShow.value = true;
		proxy.$refs.uTips1.show({
			title: name,
			type: 'success',
			duration: '2300'
		})
		setTimeout(() => {
			tipsShow.value = false;
		}, 2300)
	}
</script>

<style lang="scss" scoped>
	.imageListContent {
		width: 100%;
		// border-top: 1rpx solid #f0f0f0;
		padding-bottom: 40rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.imageListTitle {
			margin: 30rpx 0;
			font-size: 32rpx;
			display: flex;
			justify-content: space-between;
		}

	}
</style>