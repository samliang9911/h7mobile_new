<!-- items的内容 -->
<template>
	<scroll-view class="Totality" ref="Totality" scroll-y="true" @scrolltoupper="handlescrolltoupper"
		@scrolltolower="handleScrolltolower()" scroll-with-animation @scroll="handleScroll" :scroll-top="scrollTop"
		@touchstart="handleScrollTouchStart" @touchend="handleScrollTouchEnd" @touchmove="handleScrollTouchMove">
		<!-- 下拉刷新 -->
		<view id="indexCard" style="height: 230rpx;"></view>
		<view class="PullRefresh" :style="{height:resettingHeight+'rpx'}">
			<view>
				<image :style="{width:'300rpx',height: '70rpx'}" src="/static/loadingResetting.gif" mode="aspectFill">
				</image>
			</view>
			<view>{{ ResetStatus == 0 ? '下拉刷新' : ResetStatus == 1 ? '松开刷新' : ResetStatus == 2 ? '正在努力刷新中' :'加载完成' }}
			</view>
		</view>
		<!-- 内容区域 -->
		<view @click="goShowInfoOn(item)" class="middle" v-for="(item,index) in dataList" :key="item['AssignTaskOID']">
			<view class="middleBox">
				<view class="middleHead">
					<view class="personNameIcon">
						{{ (item['PersonName']=='超级管理员'?'超管':item['PersonName']||'').match(/.*?(.{1,2})$/)?.[1]}}
					</view>
					<view class="personTitle">{{setTitleCategory(item)}}</view>
				</view>
				<view class="middleContent">
					<view class="row">
						<view class="contentTitle">单据编号:</view>
						<view class="contentValue">{{ setBusinessCode(item) }}</view>
					</view>

					<view class="row">
						<view class="contentTitle">经办人:</view>
						<view class="contentValue">{{item.PersonName}}</view>
					</view>
					<view class="row">
						<view class="contentTitle">发起时间:</view>
						<view class="contentValue">{{item.SYS_Created}}</view>
					</view>
					<view class="row">
						<view class="contentTitle">{{naviId === 1 || naviId === 2 ?'到达时间:' : ''}}</view>
						<rich-text class="contentValue"
							v-html="naviId === 1 || naviId === 2 ? item['AssignedTS']:'' "></rich-text>
					</view>
					<view class="row">
						<view class="contentTitle">{{ naviId === 2 ? "审批时间:" : ""}}</view>
						<view class="contentValue">{{setApproveReadTime(item)}}</view>
					</view>
					<view class="row">
						<view class="contentTitle">单据类型:</view>
						<view class="contentValue">
							<text :style="`background: radial-gradient(${colour}52, #cc1b1b00)`">
								{{ setCategory(item) }}</text>
						</view>
					</view>
					<view class="contentStatus">
						<text>{{setBusinessState(item)}}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 空内容显示 -->
		<up-empty v-show="!dataList.length" class="showempty" margin-top="-280rpx" text="列表为空" mode="list"></up-empty>
		<!-- 上拉加载 -->
		<up-loadmore v-show="!firstLoad && dataList.length" :status="canLoadMome ? 'loading' : 'none'"></up-loadmore>
	</scroll-view>
	<!-- 全屏加载 -->
	<view style="width: 100%;" class="Q_loading_Box" v-show="showLoading">
		<view class="Q_loading"></view>
	</view>
	<!-- 回到顶部 -->
	<view class="returnTop" :style="{bottom:topPosition}" v-show="showReturnTop" @tap="setTop()">
		<image src="../../static/airPlane.png"></image>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		onMounted,
		nextTick,
		getCurrentInstance
	} from 'vue';
	import {
		startUserImage
	} from "@/utils/instrumentType.js";
	import {
		getJson
	} from "@/api/Json.js";
	import {
		onShow
	} from '@dcloudio/uni-app';
	import {
		taskResultList,
		businessStateList
	} from './index.js';

	const props = defineProps({
		tabIndex: { //该组件所在的tab索引
			type: Number,
			default: 0
		},
		current: { //当前的tabs/swiper索引
			type: Number,
			default: 0
		},
		searchData: {
			type: String,
			default: ''
		},
		tabsList: {
			type: Array,
			default: []
		},
		showSearchANDTabs: {
			type: Boolean
			// default:true
		}
	})

	const localShowSearchANDTabs = ref(props.showSearchANDTabs);
	const {
		proxy,
		appContext
	} = getCurrentInstance();
	const $http_request = appContext.config.globalProperties.$http_request;
	const dataList = ref([]);
	const naviId = ref(null);
	const colour = ref('');
	const ResetStatus = ref(0); // 下拉刷新的状态 0:未能刷新 1:可以刷新 2:刷新中 3:刷新完成
	const scrollTop = ref(0); // 滚动视图距离顶部的位置
	const resettingHeight = ref(0); // 下拉刷新的高度
	const startResettingY = ref(0); // 开始下拉点
	const showReturnTop = ref(false); // 显示小火箭
	const topPosition = ref('22%'); // 小火箭距离底部的距离
	const showLoading = ref(false); // 显示全屏加载
	const showLoadMore = ref(false); // 显示上拉加载更多
	const canRefresh = ref(true); // 是否可以下拉刷新
	const canLoadMome = ref(true); // 是否可以加载更多
	let pageNo = ref(1); // 页码
	const firstLoad = ref(true); // 是否为首次加载		
	const UserOID = uni.getStorageSync("UserOID")

	watch(() => props.current, (newVal) => {
		if (newVal === props.tabIndex || props.tabIndex === 0 || props.tabIndex === 2) {
			if (firstLoad.value) {
				nextTick(() => {
					if (newVal === props.tabIndex) showLoading.value = true;
					getData();
				});
			}
		}
	}, {
		immediate: true
	});
	onShow(() => {
		nextTick(() => {
			getData();
		})
	})
	onMounted(() => {
		naviId.value = props.tabIndex + 1;
		colour.value = startUserImage().colour;
	})

	const setTitleCategory = (item) => { //标题
		if (naviId.value === 1 || naviId.value === 2) return '关于【' + (item.ProjectName || item.PersonName) + '】' + item.BusinessCategory;
		else if (naviId.value === 3 || naviId.value === 4) return item.Title;
		return '';
	}
	const setBusinessCode = (item) => { //单据编号
		if (naviId.value === 1 || naviId.value === 2) return item.BusinessCode;
		else if (naviId.value === 3 || naviId.value === 4) return item.Code;
		return '';
	}
	const setStateValue = (item) => {
		if (naviId.value === 1 || naviId.value === 2 || naviId.value === 3) return item.CodeName;
		return item.CategoryName;
	}

	const setApproveReadTime = (item) => {
		if (naviId.value === 2) return item.FinishDate;
		// else if(naviId.value === 4) return item.ReadTime;
		return '';
	}
	const setCategory = (item) => { //所属业务
		if (naviId.value === 1 || naviId.value === 2) return item.BusinessCategory;
		else if (naviId.value === 3 || naviId.value === 4) return item.Belong;
		return '';
	}
	const setBusinessState = (item) => { //单据状态
		if (naviId.value === 1 || naviId.value === 2) {
			const matchState = businessStateList.value.find(state => state.name === item.BusinessState);
			return matchState ? matchState.value : '';
		}
		return '';
	}
	let numberIndex = 0;
	//点击卡片
	const goShowInfoOn = (item) => {
		let json = {
			StartFlowFlag: true, //
			naviBtnShow: naviId.value, //导航栏索引

			PageID: item.PageID, //页面ID
			FlowID: item.FlowID, //流程ID
			InstanceID: item.InstanceID, //工作流实例
			TaskOID: item.Flow_AssignTaskOID, //任务主键			
			FromActivityID: item.FromActivityID, //来源节点			
			BusinessKey: item.BusinessKey, //业务外键
			BusinessState: item.BusinessState, //业务状态
			BusinessUrl: item.BusinessUrl, //业务地址

			Flow_ReadRecordOID: item.Flow_ReadRecordOID, //待阅主键
			RerderFK: item.Flow_AssignTask_FK, //待阅分配任务外键
			// ActivityID: item.ActivityID, //无
		}

		// let json = {
		// 	StartFlowFlag: true, //
		// 	naviBtnShow:naviId.value, //导航栏索引
		// 	...dataList.value[index]
		// }
		if (numberIndex % 2 === 0 || true) {
			uni.navigateTo({
				url: `/pages/subPackages/expense/index?BusinessKey=${item.BusinessKey}` +
					`&Flow_AssignTaskOID=${item.Flow_AssignTaskOID}&naviId=${naviId.value}` +
					`&Flow_ReadRecordOID=${item.Flow_ReadRecordOID}&InstanceID=${item.InstanceID}`
			})
		} else {
			uni.setStorageSync("itemJson", json)
			uni.navigateTo({
				url: '/pages/subPackages/form/form'
			})
		}
		numberIndex++
	}
	/**请求堆栈 */
	const stack = []
	const getData = async () => {
		if (typeof naviId.value != 'number') {
			naviId.value = props.tabIndex + 1
		}
		const stackItem = JSON.stringify([pageNo.value, naviId.value, UserOID]);
		if (stack.includes(stackItem)) return;
		stack.push(stackItem);
		nextTick(() => {
			if (naviId.value) {
				$http_request(proxy, {
					json: getJson(pageNo.value, naviId.value, UserOID, props.searchData)
				}, '', (res) => {
					const stackIndex = stack.indexOf(JSON.stringify([pageNo.value, naviId.value,
						UserOID
					]));
					if (stackIndex !== -1) {
						stack.splice(stackIndex, 1);
					}
					if (res.data.code == 1000) {
						//待办
						if (naviId.value == 1 || naviId.value == 2) {
							if (res.data.data.Flow_AssignTask) {
								props.tabsList[0].count = res.data.data.Flow_AssignTask
									.Total //设置待办总条数
								if (pageNo.value === 1) dataList.value = res.data.data
									.Flow_AssignTask.Items //待办数据赋值到 视图数组
								else dataList.value = [...dataList.value, ...res.data.data
									.Flow_AssignTask.Items
								]
								if (res.data.data.Flow_AssignTask.Items.length < 10) canLoadMome
									.value = false
								else canLoadMome.value = true
							} else {
								props.tabsList[0].count = 0
								if (props.searchData && pageNo.value == 1) {
									uni.showToast({
										title: '没有与 ' + props.searchData + ' 相关的数据',
										icon: 'none'
									})
									dataList.value = []
								}
								canLoadMome.value = false
							}
						}


						//待阅
						else if (naviId.value === 3) {
							if (res.data.data.Flow_ReadRecord) {
								props.tabsList[2].count = res.data.data.Flow_ReadRecord
									.Total //设置待阅总条数
								if (pageNo.value === 1) dataList.value = res.data.data
									.Flow_ReadRecord.Items //待阅数据赋值到 视图数组
								else dataList.value = [...dataList.value, ...res.data.data
									.Flow_ReadRecord.Items
								]
								if (res.data.data.Flow_ReadRecord.Items.length < 10) canLoadMome
									.value = false
								else canLoadMome.value = true
							} else {
								props.tabsList[2].count = 0
								if (props.searchData && pageNo.value == 1) {
									uni.showToast({
										title: '没有与 ' + props.searchData + ' 相关的数据',
										icon: 'none'
									})
									dataList.value = []
								}
								canLoadMome.value = false
							}

						}

						//已阅
						else if (naviId.value === 4) {
							if (res.data.data.Flow_ReadRecord) {
								if (pageNo.value === 1) dataList.value = res.data.data
									.Flow_ReadRecord.Items //待办数据赋值到 视图数组
								else dataList.value = [...dataList.value, ...res.data.data
									.Flow_ReadRecord.Items
								]
								if (res.data.data.Flow_ReadRecord.Items.length < 10) canLoadMome
									.value = false
								else canLoadMome.value = true
							} else {
								if (props.searchData && pageNo.value == 1) {
									uni.showToast({
										title: '没有与 ' + props.searchData + ' 相关的数据',
										icon: 'none'
									})
									dataList.value = []
								}
								canLoadMome.value = false
							}

						}

						showLoadMore.value = false
						ResetStatus.value = 3
						if (firstLoad.value) firstLoad.value = false;
						showLoading.value = false
						setTimeout(() => {
							ResetStatus.value = 0
							resettingHeight.value = 0
						}, 500)
					} else {
						uni.showToast({
							title: res.data.msg,
							icon: 'none'
						})
					}
				}, (err) => {
					uni.showToast({
						title: err.message,
						icon: 'none'
					})
				}, false, () => {
					showLoading.value = false
					console.log("关闭加载！")
				})
			}
		})
	}

	/**
	 * 触顶
	 */
	const handlescrolltoupper = () => {

	}

	/**
	 * 触底
	 */
	const handleScrolltolower = () => {
		showLoadMore.value = true
		if (canLoadMome.value) {
			pageNo.value++
			getData()
		} else {
			uni.showToast({
				title: '无法加载更多,已经到底啦~',
				icon: 'none'
			})
		}
	}

	/**
	 * 滚动
	 */
	const handleScroll = (e) => {
		if (e.detail.scrollTop > 100) {
			localShowSearchANDTabs.value = false
			showReturnTop.value = true
		} else {
			localShowSearchANDTabs.value = true
			if (topPosition.value === '100%') {
				setTimeout(() => {
					showReturnTop.value = false
				}, 500)
			} else {
				showReturnTop.value = false
			}
		}
	}

	const handleScrollTouchStart = (e) => {
		startResettingY.value = e.changedTouches[0].clientY;
	}
	const handleScrollTouchMove = (e) => {
		//如果小于直接返回 或者 下滑大于可视高度直接 说明是上滑 或者超出范围 flag.value 处于顶部才能进行刷新
		if (e.changedTouches[0].clientY < startResettingY.value) return
		resettingHeight.value = e.changedTouches[0].clientY - startResettingY.value
		if (resettingHeight.value > 120) ResetStatus.value = 1
		else ResetStatus.value = 0
	}
	const handleScrollTouchEnd = () => {
		if (resettingHeight.value > 120) resettingHeight.value = 120;
		if (ResetStatus.value === 1) {
			ResetStatus.value = 2
			//重置页数
			pageNo.value = 1
			getData()
		} else {
			if (resettingHeight.value) resettingHeight.value = 0;
		}
	}

	const setTop = () => {
		scrollTop.value = -1
		topPosition.value = '100%'
		nextTick(function() {
			scrollTop.value = 0
			setTimeout(() => {
				topPosition.value = '22%'
			}, 1000)
		});
	}

	defineExpose({
		pageNo,
		showLoading,
		getData
	})
</script>

<style lang="scss" scoped>
	.Totality {
		padding-bottom: 116rpx;
		overflow-y: auto;
		width: 100%;
		padding-top: var(--status-bar-height);
		height: calc(100% - var(--status-bar-height));

		.PullRefresh {
			overflow: hidden;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			flex-direction: column;
		}

	}

	.returnTop {
		position: fixed;
		bottom: 22%;
		right: 2%;
		width: 15%;
		height: 7%;
		transition: all 1s ease-in-out;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.middle {
		// width: 700rpx;
		margin: 0 10rpx;
		background-color: #fff;
		box-sizing: border-box;

		.middleBox {
			width: 695rpx;
			margin: 0 0 30rpx 0;
			border-radius: 20rpx;
			box-shadow: 0rpx 1rpx 10rpx 1rpx rgba(7, 17, 27, 0.2);

			.middleHead {
				font-size: 28rpx;
				color: #444;
				padding: 15rpx 20rpx 10rpx 30rpx;
				display: flex;

				// flex-wrap: wrap;
				.personNameIcon {
					width: 80rpx;
					height: 40rpx;
					margin-right: 5rpx;
					background-color: rgb(102, 193, 255);
					border-radius: 35%;
					text-align: center;
					color: #444;
					overflow: hidden;
				}

				.personTitle {
					width: 580rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
					word-break: break-all;
					text-overflow: ellipsis;
				}
			}

			.middleContent {
				font-size: 26rpx;
				color: #777;
				margin: 0 35rpx;
				padding-bottom: 10rpx;
				overflow: hidden;
				position: relative;

				.row {
					display: flex;

					.contentTitle {
						flex: 2;
					}

					.contentValue {
						flex: 7;
						padding-bottom: 3rpx;
					}

				}

				.contentStatus {
					position: absolute;
					right: 0;
					bottom: 10rpx;

					text {
						color: rgb(26, 184, 124);
					}

				}
			}
		}
	}
</style>