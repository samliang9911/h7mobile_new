<template>
	<view class="flowListContent">
		<up-navbar :back-icon-color="backIconColor" :custom-back="quitPage" :autoBack="false" :border-bottom="false" :immersive="false" :background="titleBackground">
			<view class="flowListNaviQuitTitle">
				<view class="flowListNaviTitle" v-if="switchSearch==='title'?true: false">
					<text :style="{
							color: titleColor,
							fontSize: titleSize + 'rpx',
							fontWeight: titleBold ? 'bold' : 'normal'
						}">{{title}}</text>
				</view>
				<!-- 搜索search -->
				<view style="display: flex; width: 90%; align-items: center;margin-left: 5%;" v-if="switchSearch==='search'?true: false">
					<!-- 颜色#f2f2f2 -->
					<view class="headInput">
						<view class="inputIco">
							<up-icon name="search"></up-icon>
						</view>
						<view class="inputContent">
							<input ref="Refipu" @input="getIpValue($event)" @focus="monitorInp('gain')" :placeholder="searchHint" @blur="monitorInp('lose')" type="text" :value="searchData" />
						</view>
						<view class="inputDel" v-show="removeShow" @tap="searchDataDle">
							<up-icon size="32" name="close-circle-fill"></up-icon>
						</view>
						<view class="headSearch" @tap="searchOn">
							<text>搜索</text>
						</view>
					</view>
				</view>
			</view>
		</up-navbar>
		<!-- 加号 -->
		<view class="addIconBox" v-if="switchAddBtn" @tap="addBtn">
			<view class="addIcon" :style="{backgroundColor: addBtnBackg}">
				<up-icon name="plus" :color="addBtnColor" :size="addSIze"></up-icon>
			</view>
		</view>
		<!-- 表单例表 -->
		<view class="flowListContentBox">
			<slot></slot>
		</view>
	</view>
</template>

<script lang="ts" setup>
	/**
	 * flowList 自定义列表
	 * @description 此组件一般用于在有例表情况下，需要自定义列表内容。
	 * @property {String} switchSearch 导航栏标题或搜索，默认值('title')
	 * @property {String} title 导航栏标题，如设置为空字符，将会隐藏标题占位区域
	 * @property {String} title-size 导航栏标题字体大小，单位rpx（默认30）
	 * @property {Function} search-on 搜索方法
	 * @property {Function} add-btn 加号按钮方法
	 * @property {Function} on-reach 下拉触底方法
	 * @property {String} titleColor 标题颜色（默认#606266）
	 * @property {String} backIconColor 返回图标颜色（默认#606266）
	 * @property {Object} title-background 导航栏背景设置 默认{ background: '#ffffff' }）
	 * @property {Boolean} switch-add-btn 控制+号按钮显示或不显示（默认true）
	 * @example <flowList switch-search="search" ></flowList>
	 */

	import {
		ref,
		withDefaults
	} from "vue"
	import {
		onReachBottom
	} from "@dcloudio/uni-app"
	/**Props区域*/
	interface Props {
		switchSearch ? : String,
			switchAddBtn ? : Boolean,
			titleBackground ? : Object,
			titleColor ? : String,
			titleSize ? : String,
			titleBold ? : Boolean,
			addBtnBackg ? : String,
			addBtnColor ? : String,
			addSIze ? : String,
			title ? : String,
			backIconColor ? : String,
			searchHint ? : String
	}
	const props = withDefaults(defineProps < Props > (), {
		switchSearch: () => 'title', //控制搜索框,标题,或不显示
		switchAddBtn: () => true, //控制+号按钮显示或不显示
		titleBackground: () => {
			background: '#ffffff'
		}, //标题背景颜色
		titleColor: () => '#606266', //标题文字颜色
		titleSize: () => '32', //标题文字大小
		titleBold: () => false, //标题文字加粗
		addBtnBackg: () => '#2979ff', //加号按钮背景颜色
		addBtnColor: () => '#ffffff', //加号按钮字体颜色
		addSIze: () => '48', //加号按钮字体大小
		title: () => '', //标题内容
		backIconColor: () => '#606266', //返回图标的颜色
		searchHint: () => '请输入关键词',
	});
	interface Emit {
		(e: "onReach", event ? : MouseEvent): void;
		(e: "searchOn", event ? : MouseEvent): void;
		(e: "addBtn", event ? : MouseEvent): void;
	}
	let emit = defineEmits < Emit > ();
	/**变量区域*/
	let searchData: String = ref(''); //输入框内容
	let removeShow = ref(false); //输入框获取焦点
	/**内部函数*/
	onReachBottom(() => {
		emit("onReach", searchData.value);
	})

	/**函数区域*/
	let quitPage = () => {
		uni.navigateBack();
	}
	/**搜索输入框监听内容*/
	let getIpValue = (event) => {
		searchData.value = event.detail.value
	};
	/** * gain获取焦点* lose失去焦点 */
	let monitorInp = (e) => {
		setTimeout(() => {
			e === "gain" ? removeShow.value = true : removeShow.value = false;
		}, 50)
		emit("monitorInp", removeShow.value, searchData.value);
	};
	//清空搜索框内容
	let searchDataDle = () => {
		searchData.value = '';
		emit("searchDataDle");
	};
	//搜索
	let searchOn = () => {
		emit("searchOn", searchData.value);
	}
	//加号
	let addBtn = () => {
		emit("addBtn");
	}
</script>

<style lang="scss" scoped>
	.flowListContent {
		width: 100%;
		height: 100%;
		//#ifdef MP-WEIXIN
		margin-top: 100rpx;

		//#endif
		.flowListNaviQuitTitle {
			width: 100%;
			height: 100%;

			// margin-left: 36%;
			.flowListNaviTitle {
				margin-left: 39%;
			}

			.headInput {
				width: 100%;
				padding: 10rpx;
				flex: 1;
				display: flex;
				align-items: center;
				background-color: #f2f2f2AA;
				border-radius: 50rpx;

				.headSearch {
					font-size: 29rpx;
					margin-right: 40rpx;
					margin-left: 5rpx;
				}

				.inputIco {
					margin: 0 20rpx;
				}

				.inputContent {
					flex: 1;
				}

				.inputDel {
					margin: 0 20rpx;
				}

			}
		}

		.flowListContentBox {
			width: 100%;
			height: 100%;


		}

		.addIconBox {
			position: fixed;
			bottom: 10%;
			right: 13%;
			width: 90rpx;
			height: 90rpx;
			z-index: 520;

			.addIcon {
				box-shadow: 0 1rpx 10rpx 1rpx rgba(7, 17, 27, 0.2);
				width: 100%;
				height: 100%;
				border-radius: 100%;
				text-align: center;
				line-height: 100rpx;
			}
		}
	}
</style>
