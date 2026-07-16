<!-- 事项 -->
<template>
	<view style="width: 100%;height: 100%;">
		<view class="movable-area">
			<view class="hr-margin-wrap">
				<view class="swiper">
					<view class="sx-box">
						<view class="boxMax">
							<view class="boxContent">
								<view ref="handHeight" id="handHeight"
									:class="showSearchANDTabs ? 'theHead' : 'theHead theHeadTopFalse'">
									<view style="display: flex; width: 100%; align-items: center">
										<!-- 颜色#f2f2f2 -->
										<view class="headInput">
											<view class="inputIco">
												<up-icon name="search" size="18"></up-icon>
											</view>
											<view class="inputContent">
												<input v-model="searchData" placeholder="输入关键词" type="text" />
											</view>
											<view class="inputDel" v-show="searchData !== ''" @click="searchData = ''">
												<up-icon name="close-circle-fill" size="15"></up-icon>
											</view>
											<view class="headSearch" @click="handleSearch">
												<text>搜索</text>
											</view>
										</view>
									</view>
									<view class="tabNaviBox">
										<view v-for="(tab,i) in tabsList"
											:style="current === i ? 'color:#131313;' : 'color:#606266;'"
											class="tabBakcground tabLeft" @click="current = i">
											<text>{{tab.name}}</text>
											<view v-if="(i === 0 || i === 2) && tabsList[i]['count'] > 0" class="tabBadge">
												{{ tabsList[i]['count'] > 99 ? '99+' : tabsList[i]['count'] }}
											</view>
										</view>
										<view id="track" :class="['tabBakcgroundMove', startUserColor]"
											:style="{left: `calc(${ LineLeft}px - 120rpx)`}">
										</view>
									</view>
								</view>
								<swiper style="height: 100%;" :current="current" @transition="swiperTransition"
									@animationfinish="swiperAnimationfinish">
									<swiper-item v-for="(_,i) in tabsList">
										<index :ref="`index${i}`" :tabIndex="i" :current="current"
											:searchData="searchData" :tabsList="tabsList"
											:showSearchANDTabs="showSearchANDTabs"
											@update-tab-count="handleUpdateTabCount"></index>
									</swiper-item>
								</swiper>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { computed, ref, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import { startUserImage } from "/utils/instrumentType.js";
	import index from "/components/index/index.vue";
	import { logins } from "/api/api.js";
	const { proxy } = getCurrentInstance()!;
	let showSearchANDTabs = ref(true);
	const searchData = ref('');
	const current = ref(0); // 当前tabs/swiper的索引
	const tabsList = ref([
		{ name: '待办', count: 0 },
		{ name: '已办', count: 0 },
		{ name: '待阅', count: 0 },
		{ name: '已阅', count: 0 }
	]);

	const handleUpdateTabCount = ({ index, count }) => {
		tabsList.value[index].count = count;
	};
	const trackLeft = ref(0); // 滑块静止时的偏移量
	const swiperDx = ref(0); // 轮播图滚动时的距离
	const screenWidth = ref(0); // 可视宽度
	const screenHeight = ref(0); // 可视高度
	const startUserColor = ref('');
	onLoad((option) => {
		// const kk = uni.getDeviceInfo().deviceId
		uni.getSystemInfo({
			success: (res) => {
				screenWidth.value = res.screenWidth || 0;
				screenHeight.value = res.screenHeight || 0;
				trackLeft.value = screenWidth.value / 4;
			}
		})
		startUserColor.value = startUserImage().naviColor; //导航颜色


		// #ifdef H5
		if (option?.webviewJson) { //webview页面跳转进入此页面,如果有参数则进行登录
			let webviewJson = JSON.parse(option.webviewJson);
			logins(webviewJson.userName, webviewJson.password, webviewJson.IsFirst, webviewJson.loginUID, proxy);
			uni.setStorageSync('serverUrl', webviewJson.ldServerUrl);
		}
		if (option?.current) uni.setStorageSync('current', option.current); //tabbar索引记录
		if (uni.getStorageSync('current')) current.value = Number(uni.getStorageSync('current')); //tabbar索引
		// #endif
	})


	const LineLeft = computed(() => trackLeft.value + swiperDx.value)

	//搜索
	const handleSearch = () => {
		let e = proxy?.$refs[`index${current.value}`]![0]
		e.pageNo = 1
		e.showLoading = true
		e.getData()
	}

	//swiper滑动中
	const swiperTransition = (e) => {
		swiperDx.value = (e.detail.dx / screenWidth.value) * (screenWidth.value / 4)
	}

	//swiper滑动结束
	const swiperAnimationfinish = (e) => {
		current.value = e.detail.current;
		swiperDx.value = 0
		trackLeft.value = (screenWidth.value / 4) * (current.value + 1) - (current.value * 5)
	}
</script>

<style lang="scss">
	.movable-area {
		width: 100%;
		height: 100vh;
		/* #ifdef H5 */
		height: calc(100vh - 50px);
		/* #endif */
		position: relative;
	}

	.hr-margin-wrap {
		width: 100%;
		height: 100%;

		.swiper {
			width: 100%;
			height: 100%;

			.sx-box {
				width: 100%;
				height: 100%;

				.boxMax {
					width: 100%;
					height: 100%;
					background-color: #ffffff;
					overflow-y: hidden;

					.boxContent {
						width: 95%;
						height: 100%;
						margin: 0rpx 2.5%;

						.theHeadTopFalse {
							top: inherit;
							top: -500rpx !important;
						}

						.theHead {
							width: 95%;
							background-color: #ffffff;
							display: flex;
							flex-direction: column;
							align-items: center;
							position: fixed;
							top: 0rpx;
							z-index: 99;
							transition: all 0.5;
							box-shadow: 1rpx 1rpx 40rpx #ffffff;
							padding-top: calc(40rpx + var(--status-bar-height));
							-webkit-transition: all 0.5s ease;
							-moz-transition: all 0.5s ease;
							-ms-transition: all 0.5s ease;
							-o-transition: all 0.5s ease;
							transition: all 0.5s ease;

							.tabNaviBox {
								width: 100%;
								height: 70rpx;
								background-color: #ffffff;
								margin: 10rpx 0;
								display: flex;
								position: relative;

								.tabBakcground {
									flex: 1;
									width: 25%;
									height: 100%;
									border-radius: 50rpx;
									text-align: center;
									line-height: 80rpx;
									color: #606266;
									font-size: 35rpx;
									position: relative;
								}

								.tabBadge {
									position: absolute;
									top: 5rpx;
									right: -0.4125rpx;
									min-width: 36rpx;
									height: 36rpx;
									padding: 0 10rpx;
									background-color: #f56c6c;
									color: #fff;
									font-size: 22rpx;
									border-radius: 18rpx;
									display: flex;
									align-items: center;
									justify-content: center;
								}

								.tabBakcgroundMove {
									position: absolute;
									text-align: center;
									line-height: 80rpx;
									color: #fff;
									background-color: #606266;
									border-radius: 50rpx;
									font-size: 35rpx;
									width: 5%;
									height: 10%;
									bottom: 0;
									left: 0;
								}
							}

							.headInput {
								width: 100%;
								height: 40rpx;
								padding: 20rpx;
								flex: 1;
								display: flex;
								align-items: center;
								background-color: #f2f2f2;
								border-radius: 50rpx;

								.headSearch {
									font-size: 32rpx;
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
					}
				}
			}
		}
	}
</style>