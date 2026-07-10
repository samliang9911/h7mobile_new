<!-- 多选单选 -->
<template>
	<view v-if="showComponent" class="radioFormCentent" :style="{'display':display?'flex':'','alignItems':display? 'center':'','borderBottom':underline ?'1rpx solid #f0f0f0':'1rpx solid transparent'}">
		<view class="radioFormTitle" v-if="titleShow" @tap="toBackLink">
			<up-icon name="grid" :color="IsRequired ? '#f75556' : iconColorUr" size="33"></up-icon>
			<text :style="{fontSize:textSize+'rpx',marginLeft:'10rpx',color: IsRequired ? '#f75556' :  '',fontStyle:IsExtendField ? 'oblique 85deg' : null}">{{title}}</text>
		</view>
		
		<view v-if="radioSwitch" style="flex: 2.4 1 0%;">
			<view class="BodyInfoCheckBox">
				<view class="BodyInfoCheckContent" v-for="(item, index) in list" :key="index" :style="'width:'+width+';'">
					<view class="contentHead_Info">
						<view class="contentHead_Info_Box" @tap="radioChange($event,item,prohibit)">
							<view class="contentHead_Info_left" :style="{
									backgroundColor: prohibit ? '#ebedf0' : item.CodeID === returnRadioData() ? 'royalblue' : '#FFF'
								}">
								<!-- 控制选择选 -->
								<view style="display: flex;
								justify-content: center;
								align-items: center;
								width: 100%;
								height: 100%;
								">
									<up-icon name="checkbox-mark" :color=" item.CodeID === returnRadioData() ? prohibit ? '#909090' : 'white' : 'transparent'" size="30rpx">
									</up-icon>
								</view>
							</view>
							<view class="contentHead_Info_right">
								<text>{{item.CodeName}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view style="padding-top: 5rpx;color: crimson;font-size: 26rpx;">
				<text>{{tips}}</text>
			</view>
		</view>
		<view v-else style="flex: 2.4 1 0%;">
			<up-checkbox-group :width="width">
				<up-checkbox :disabled="prohibit" @change="checkboxChange($event,item)" v-model="item.checked" v-for="(item, index) in list" :key="index" :name="item.CodeName">{{item.CodeName}}</up-checkbox>
			</up-checkbox-group>
			<view style="padding-top: 5rpx;color: crimson;font-size: 26rpx;">
				<text>{{tips}}</text>
			</view>
		</view>

	</view>
</template>

<script lang="ts" setup>
	import {
		withDefaults,
		watch,
		ref
	} from "vue"
	interface Props {
		textSize ? : String, //标题字体大小
			title ? : String, //标题
			list ? : Array < any > , //单框显示内容
			radioSwitch ? : Boolean, //true为单选,false多选
			titleShow ? : Boolean, //是否显示标题
			width ? : String, //宽度
			identification ? : String, //标识
			checkRadioItem ? : Object, //选择框内容
			display ? : Boolean, //左,上 布局
			tips ? : String, //提示信息
			dataValue ? : String, //默认显示
			showComponent ? : Boolean, //是否显示该组件
			underline ? : Boolean, //下划线
			prohibit ? : Boolean, //是否禁用
			iconColorUr ? : String, //图标颜色
			IsRequired ? : Boolean, //是否必填
			IsExtendField ? : Boolean, // 扩展字段
			IsBackLink ? : Boolean, // 反链
	}
	interface Emit {
		(e: "checkboxTap", event ? : [MouseEvent, Object, String], identification ? : any, item ? : any, checkRadioItem ? :
			Object): void;
		(e: "radioTap", event ? : [MouseEvent, Object, String], identification ? : any, checkRadioItem ? :
			Object, item ? : any): void;
		(e: "toBackLink"): void;
	}
	let emit = defineEmits < Emit > ();
	const props = withDefaults(defineProps < Props > (), {
		textSize: () => "30",
		title: () => "标题",
		list: () => [],
		radioSwitch: () => true,
		titleShow: () => true,
		width: () => "auto",
		identification: () => "",
		checkRadioItem: () => Object,
		display: () => false,
		tips: () => "",
		dataValue: () => "",
		showComponent: () => true,
		underline: () => true,
		prohibit: () => false,
		iconColorUr: () => "#2979ff",
		IsRequired: () => false,
		IsExtendField: () => false,
		IsBackLink: () => false,
	})
	watch(() => props.list, (newValue) => {
		let s = String(props.dataValue).split(",");
		s.forEach(v => {
			newValue.forEach(item => {
				if (v === item.CodeID) {
					item.checked = true;
					showRadio.value = String(v);
				};
			})
		})
	}, {
		deep: true
	})
	watch(() => props.dataValue, (newValue) => {
		if (newValue) {
			let showType = String(newValue).split(",")
			showType.forEach(v => {
				props.list.forEach(item => {
					if (v === item.CodeID) {
						item.checked = true;
						showRadio.value = String(v);
					};
				})
			})
		}

	})
	let showRadio: {
		value: any
	} = ref("");

	let returnRadioData = () => {
		if (!showRadio.value) {
			let showType = String(props.dataValue).split(",")
			showType.forEach(v => {
				props.list.forEach(item => {
					if (v === item.CodeID) {
						item.checked = true;
						showRadio.value = String(v);
					};
				})
			})
		}
		return showRadio.value;
	}

	// 选中某个单选框时，由radio时触发
	let radioChange = (e: any, item: any, IsEdit: Boolean) => {
		if (IsEdit) return;
		showRadio.value = item.CodeID;
		emit("radioTap", e, props.identification, props.checkRadioItem, item);
	}
	// 选中某个复选框时，由checkbox时触发
	let checkboxChange = (e: any, item: any) => {
		emit("checkboxTap", e.name, props.identification, item, props.checkRadioItem);
	}
	let toBackLink = () => {
		if (props.IsBackLink) emit("toBackLink")
	}
</script>

<style lang="scss" scoped>
	.radioFormCentent {
		width: 100%;
		margin-bottom: 10rpx;

		.radioFormTitle {
			padding: 0rpx 0rpx 10rpx 0;
			flex: 1 1 0%;
		}

		.BodyInfoCheckBox {
			// margin: 30rpx 18rpx;
			display: flex;
			flex-flow: wrap;

			.BodyInfoCheckContent {
				width: 50%;

				.contentHead_Info {
					color: #333;
					margin: 0 10rpx 20rpx 10rpx;
					display: flex;
					align-items: center;

					.contentHead_Info_Box {
						display: flex;
						// background-color: #6062663c;
						border-radius: 30rpx;
						align-items: center;

						.contentHead_Info_left {
							box-shadow: 0rpx 1rpx 1rpx 1rpx #3333333c;
							width: 33rpx;
							height: 33rpx;
							border-radius: 100%;
							margin-right: 10rpx;
							text-align: center;
							transition: all .2s ease-in-out;
							opacity: 1;
							display: flex;
							justify-content: center;
							align-items: center;
							border: 2rpx solid #c8c9cc;
						}

						.contentHead_Info_right {
							text-align: center;

							text {
								font-size: 30rpx;
								padding-right: 20rpx;
							}
						}
					}


				}
			}

		}
	}
</style>
