<template>
	<view class="flex-col page">
		<image class="self-start image_4" src="/static/108.png" />
		<text class="text3">H7系列-移动综合管理系统</text>
		<text class="text">广州汇软信息科技有限公司</text>
		<text class="text2">020-85624520</text>
	</view>
</template>

<script setup lang="ts">
	import { onLoad } from '@dcloudio/uni-app'
	import { http_request } from '@/api/api.js'

	//防止重复跳转
	let hasHandled = false

	onLoad((options = {}) => {
		if (hasHandled) return
		hasHandled = true
		//第三方授权链接（从外部跳入，带 code 和 Scope）
		if (options.code && options.Scope) {

			handleThirdPartyAuth(options.code, options.Scope, options.state, options.SourceSite)
			return // 处理完直接返回
		}
		//普通App启动（无任何参数，点击图标进入）
		handleNormalAppLaunch()
	})
	// ========== 功能函数 ==========
	// 处理第三方授权
	function handleThirdPartyAuth(code : string, Scope : string, state : string, SourceSite : string) {
		try {
			uni.clearStorageSync()
			let url : any
			let site : any
			if (SourceSite) {
				site = SourceSite
			} else {
				site = window.location.origin
			}
			uni.setStorageSync('serverUrl', site)
			if (Scope == 'gdhwater') {
				url = site + '/api/weWork/singinLogin/' + code + '?state=' + state
			}
			let json = {
				code: code,
				Scope: Scope
			}
			http_request('', json, url,
				(response, header) => {
					try {
						let res = response.data;
						const { HomePage2 } = res.data
						uni.setStorageSync('AccessToken', res.data.AccessToken);
						uni.setStorageSync('TimeStamp', res.data.TimeStamp);
						uni.setStorageSync('No', res.data.No);
						uni.setStorageSync('UserOID', res.data.UserOID);
						uni.setStorageSync('UserName', res.data.UserName);
						uni.setStorageSync('RealName', res.data.RealName);
						uni.setStorageSync('PostName', res.data.PostName);
						uni.setStorageSync('OrganizeOID', res.data.OrganizeOID);
						uni.setStorageSync('OrgName', res.data.OrgName);
						uni.setStorageSync('DivisionOID', res.data.DivisionOID);
						uni.setStorageSync('Division', res.data.Division);
						uni.setStorageSync('PostOID', res.data.PostOID);
						uni.setStorageSync('PostClassInfo', res.data.PostClassInfo);
						uni.setStorageSync('IsAdmin', res.data.IsAdmin);
						uni.setStorageSync('HeadPortrait', res.data.HeadPortrait);
						uni.setStorageSync('Sex', res.data.Sex);
						uni.setStorageSync('Access-Token', header['access-token'])
						uni.setStorageSync('X-Access-Token',header['x-access-token']) 
						let config = res.data.SysConfig;
						let keys = Object.keys(config);
						keys.forEach((e) => {
							uni.setStorageSync(e, config[e]);
						});
						
/* 						const { HomePage2 } = res.data.data
						const { AccessToken } = res.data.data
						uni.setStorageSync('AccessToken', AccessToken) */

						const token = uni.getStorageSync('AccessToken')
						if (token) {
							const targetPath = isValidPath(HomePage2) ? HomePage2 : '/pages/index/items'
							if (targetPath.includes('/pages/subPackages/autopage/index')) {
								uni.showModal({
									title: "提示",
									content: "不支持跳动态表单页面",
									showCancel: false,
									success: (result) => {
										if (result.confirm) {
											uni.reLaunch({
												url: '/pages/index/items'
											})
										}
									}
								})
							}
							uni.reLaunch({ url: targetPath })
						} else {
							uni.clearStorageSync()
							uni.reLaunch({ url: '/pages/login/login' })
						}
					} catch (err) {
						console.error('处理响应数据时出错:', err)
						uni.showToast({ title: `登录失败: ${err instanceof Error ? err.message : String(err)}`, icon: 'none' })
						uni.reLaunch({ url: '/pages/login/login' })
					}
				},
				(error) => {
					// 错误回调
					console.error('http_request 请求失败:', err)
					uni.showToast({ title: `网络失败，请重试: ${err instanceof Error ? err.message : String(err)}`, icon: 'none' })
					uni.clearStorageSync()
					uni.reLaunch({ url: '/pages/login/login' })
				}
			)
		} catch (error) {
			console.error('第三方登录失败:', err)
			uni.showToast({ title: `第三方登录失败: ${err instanceof Error ? err.message : String(err)}`, icon: 'none' })
			uni.reLaunch({ url: '/pages/login/login' })
		}
	}

	// 处理普通App启动
	function handleNormalAppLaunch() {
		const token = uni.getStorageSync('AccessToken')
		if (token) {
			/* 	  uni.showModal({
						title: "提示",
						content: "首页" + token,
				  }) */
			// 有Token：跳首页
			uni.reLaunch({ url: '/pages/index/items' })
		} else {
			// 无Token：跳登录页
			/* 	uni.showModal({
					title: "提示",
					content: "登录页" + token,
				}) */
			uni.clearStorageSync() // 清理可能过期的缓存
			uni.reLaunch({ url: '/pages/login/login' })
		}
	}

	// 安全路径验证（备用）
	function isValidPath(path : string) : boolean {
		return /^\/(pages)\//.test(path)
	}
</script>

<style scoped>
	.flex-col {
		display: flex;
		flex-direction: column;
	}

	.page {
		background-color: #2445cd;
		width: 100;
		overflow-y: auto;
		overflow-x: hidden;
		height: 100vh;
	}

	.flex-row {
		display: flex;
		flex-direction: row;
	}

	.justify-end {
		justify-content: flex-end;
	}

	.self-stretch {
		align-self: stretch;
	}

	.image_4 {
		margin-left: auto;
		margin-right: auto;
		margin-top: 30vh;
		width: 80rpx;
		height: 80rpx;
	}

	.self-start {
		align-self: flex-start;
	}

	.text {
		margin-top: 50vh;
		color: #dcdbe0;
		font-size: 28rpx;
		font-family: Manrope;
		line-height: 39.2rpx;
		text-align: center;
	}

	.text2 {
		margin-top: 5rpx;
		color: #dcdbe0;
		text-align: center;
	}

	.text3 {
		margin-top: 15rpx;
		color: #dcdbe0;
		text-align: center;
	}
</style>