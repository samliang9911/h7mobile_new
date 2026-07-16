<!-- 登录界面 -->
<!-- 功能：版本号判断 、更新、登录-->
<template>
	<view class="content" :style="{ backgroundImage: 'url(' + imageURL + ')' }"
		style="position: absolute;top: 0;left: 0;background-size: 200% 100%;background-repeat: no-repeat;background-position: center;min-width: 100%;min-height: 100%;">
		<!-- <hrLoading></hrLoading> -->
		<view class="Loginbackground">
			<view class="logo_Top">
				<image class="logo" mode="aspectFit" src="https://www.pcm77.com/font/images/static/appHomeLogo.png"
					style="height: 340upx;"></image>
			</view>
			<view class="Backstage_Data">
				<view style="width: 93%;margin-left: 7%;border-bottom: 1px solid #FFFFFF;">
					<view style="margin-left: 25%;">
						<input @blur="userBlur" @focus="inputColor = '#FFFFFF';showLogo = 0" :style="[{
							'padding': '15rpx 0',
							'width': '60%',
							'color':inputColor
						}]" placeholder="请输入用户名" type="text" v-model="username" />
					</view>
				</view>
				<view style="width: 93%; margin-left: 7%;border-bottom: 1px solid #FFFFFF;">
					<view style="margin-left: 25%;">
						<input @blur="userBlur" @focus="inputColor = '#FFFFFF';showLogo = 0" :style="[{
							'padding': '15rpx 0',
							'width': '60%',
							'color':inputColor
						}]" placeholder="请输入密码" type="password" v-model="password" />
					</view>
				</view>


				<view class="action">
					<view class="sz_server" @tap="showModal" data-target="DialogModal1"><text
							style="font-size: 36rpx;">设置</text></view>
					<!-- <view style="height: 100%;" @getphonenumber="getInto"><text>进入微信</text></view> -->

					<!-- 一键登录, 除了H5 -->
					<!-- #ifndef H5 -->
					<!-- <button class="action_Btn"
						style="height: 100%;background-color: transparent;margin: 0;font-size: 32rpx;color: #544e4e;"
						open-type="getPhoneNumber" @getphonenumber="getInto"><text>一键登录</text>
					</button> -->
					<!-- #endif -->
				</view>

				<!-- 登录 -->
				<view class="Btn_div">
					<button @tap="btnLogin"
						:style="'background-color:'+ backGround+';color: #fff;border-radius: 30px;font-size: 20px'">登录
					</button>
				</view>

				<!-- 设置IP地址模态框 -->
				<view class="cu-modal" :class="modalName == 'DialogModal1' ? 'show' : ''">
					<view class="cu-dialog">
						<view class="cu-bar bg-white justify-end">
							<view class="content" :style="{color:choiceAgreement ? '#ff9900':'#303133'}">
								<text>{{choiceAgreement ? "请选择协议" : "IP地址"}}</text>
							</view>
							<view class="action" @tap="hideModal">
								<up-icon name="close" color="#e54d42"></up-icon>
							</view>
						</view>

						<view class="padding-xl">
							<input :focus="ipInputState" style="width: 100%;" @blur="blur" @focus="focus" type="text"
								:value="ipdizhi" placeholder="请输入" @input="getIpValue($event)" maxlength="50" />
							<view style="margin-left: 20rpx;" v-show="clean" @tap="cleanIp">
								<up-icon size="18" name="close-circle-fill"></up-icon>
							</view>
							<view class="value-cue" :style="{left:cueShow ? '0' : '-100%'}">
								<view class="value-http">
									<button class="cu-btn bg-orange margin-left" @tap="cupHead(false)">http://</button>
								</view>
								<view class="value-https">
									<button class="cu-btn bg-orange margin-left" @tap="cupHead(true)">https://</button>
								</view>
							</view>
						</view>
						<view class="cu-bar bg-white justify-end">
							<!-- choiceAgreement ? 'Q_shake':'' -->
							<view class="action">
								<view>
									<button class="cu-btn line-green text-green" @tap="hideModal">取消</button>
								</view>
								<view :class="[choiceAgreement ? 'Q_shake':'']">
									<button class="cu-btn bg-green margin-left" @tap="hideModal2">确定</button>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- #ifdef APP-PLUS -->
				<up-modal :show="showAgreeModal" title="请阅读并同意以下条款" confirmText="同意并继续" cancelText="不同意"
					:showCancelButton="true" :closeOnClickOverlay="true" @confirm="agreeConfirm" @cancel="agreeCancel">
					<view class="slot-content">
						<up-link @tap="navigeAgreement(1)" style="font-weight: bold;" text="《服务协议》"
							fontSize="14"></up-link>
						<up-link @tap="navigeAgreement(0)" style="font-weight: bold;" text="《隐私政策》"
							fontSize="14"></up-link>
					</view>
				</up-modal>
				<view style="color: #FFFFFF;padding-left: 30rpx;">
					<up-checkbox-group class="checkAgree">
						<up-checkbox style="margin: 0 10rpx;" v-model="agree" shape="circle" label="我已阅读并同意"
							labelColor="#FFFFFF"></up-checkbox>
						<up-link @tap="navigeAgreement(1)" style="font-weight: bold;" text="《服务协议》"
							fontSize="14"></up-link>
						<up-link @tap="navigeAgreement(0)" style="font-weight: bold;" text="《隐私政策》"
							fontSize="14"></up-link>
					</up-checkbox-group>

				</view>
				<!-- #endif -->


				<!-- 公司简介 -->
				<view class="Other " :style="{opacity:showLogo}" style="position: fixed;bottom: 70rpx;">
					<view class="url " style="width: 100%;">
						www.pcm77.com
					</view>
					<view class="Corporate_name ">
						广州汇软信息科技有限公司
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script setup lang="ts">
	// import hrLoading from "@/components/hr_loading/hr_loading.vue"
	import {
		logins,		//登录
		throttle,	//防抖
	} from "@/api/api.js"
	import {
		getUrlType,   //获取iP地址
		startUserImage,   //用户图片
	} from "@/utils/instrumentType.js"
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import {
		getCurrentInstance,
		ref,
		onMounted,
	} from 'vue'

	let { proxy } = getCurrentInstance() as any;
	// enum loginType {
	// 	oneLogin = 1, //第一次登录
	// 	multipleLogin = 2, //多次登录
	// 	normalLogin = 3 //正常登录
	// }
	interface RefType<T> {
		value : T
	}
	let ipInputState = ref(false);//输入地址输入框获取自动焦点
	let showLogo = ref(1); //显示隐藏logo
	let cueShow : RefType<Boolean> = ref(false); //提示输入http/https
	let inputColor : RefType<String> = ref('#303133');
	let username : RefType<string> = ref(''); //用户名
	let password : RefType<string> = ref(''); //用户密码
	let imageURL : RefType<String> = ref('https://www.pcm77.com/font/images/static/appHomeBg.jpg');
	let modalName : RefType<String> = ref('false'); //是否显示模态框
	let ipdizhi : RefType<String> = ref('');
	let backGround : RefType<String> = ref(startUserImage().colour || '#4395ff'); //全局背景颜色
	// let onelogin : RefType<loginType> = ref(loginType.normalLogin); //第一次登录
	let loginUID : RefType<String> = ref('');
	let urlData : RefType<any> = ref();
	let showOneTapLogin : RefType<Boolean> = ref(false); //h5一键登录隐藏
	let remindSetIP : Boolean = true; //提醒输入IP地址
	let clean : RefType<Boolean> = ref(false);
	let choiceAgreement : RefType<Boolean> = ref(false); //选择协议Http/Https
	let agree : RefType<Boolean> = ref(false)
	let showAgreeModal : RefType<Boolean> = ref(false)
	let showloading : RefType<Boolean> = ref(false)
	/**页面加载时*/
	onLoad((option) => {
		uni.$on('showloginLoading', (e) => {
			showloading.value = e
		})
		backGround.value = startUserImage().colour || '#4395ff'; //获取按钮背景颜色
		if (option.Page) {
			uni.setStorageSync('toPage', option.Page);
		} else {
			if (uni.getStorageSync("toPage")) uni.removeStorageSync('toPage');
		}
		//#ifdef H5
		if (!option.Scope && uni.getStorageSync('optionData') != "") {
			option = JSON.parse(uni.getStorageSync('optionData'));
		}
		if (option.Scope) {
			uni.setStorageSync('optionData', JSON.stringify(option)); //写入企业微信链接内容
			uni.setStorageSync('WEWORK', option.Scope); //写入企业微信链接内容
			// console.log("进入企业微信一键登录开始");
			urlData.value = option;
			if (urlData.value.IsFirst === undefined) {
				urlData.value.IsFirst = false;
			} else {
				urlData.value.IsFirst = urlData.value.IsFirst.toLowerCase() === "true" ? true : false; //更改为第一次登录
			}
		}
		//#endif
		ipdizhi.value = uni.getStorageSync('serverUrl');
		if (!ipdizhi.value)
			ipdizhi.value = getUrlType(proxy); //默认地址
	});
	onMounted(() => {
		//#ifdef H5
		if (urlData.value) { //&& urlData.value.Scope ==="WEWORK"
			if (urlData.value.Scope) getPhone(null, null);
		}
		//#endif
	})

	let empower = () => {
		//传参登录方式参数WECHAT
		/** 获取用户信息 * 展示加载框 */
		return new Promise(resolve => {
			uni.login({
				provider: 'weixin',
				success: res => {
					let json = JSON.stringify({
						ClientId: 'wxcc02fd3aa0a0a8f2', //你的小程序的APPID
						Scope: 'authorization_code',
						AgentId: res.code //用户登录凭证。开发者需要在开发者服务器后台，使用 code 换取 openid 和 session_key 等信息
					})
					uni.request({
						url: 'https://auth.pcm77.com/v1/app/WeWhatLogin', // 请求微信服务器
						// url: 'https://192.168.0.114/v1/app/Login', // 测试请求微信服务器
						method: 'POST',
						data: {
							TransferData: json,
							TransferUrl: 'https://api.weixin.qq.com/sns/jscode2session',
							TransferMethod: 'GET'
						},
						success: (resKey : any) => {
							if (!resKey.data.data.SourceSite)
								resKey.data.data.IsFirst = true;
							resolve(resKey.data);
						}
					})
				}

			});
		})

	};
	/**微信授权登录*/
	let getInto = async (res : any) => {
		let getPhoneKey = await empower();
		await getPhone(res, getPhoneKey);
	}
	/**获取手机号*/
	let getPhone = (res : any, getPhoneKey : any) => {
		//#ifdef H5
		if (urlData.value.Scope && urlData.value.IsFirst) {
			//第一次登录
			// console.log("进入企业微信一键登录第一次");
			// onelogin.value = loginType.oneLogin;
			// console.log("获取到onelogin", loginType.oneLogin);
			// loginUID.value = urlData.value.UID;
			// console.log("获取到UID", urlData.value.UID);
			proxy.$refs.uTips.show({
				title: '首次一键登录需记录域名,账号与及密码!',
				type: 'warning',
				duration: '10000'
			})
			// modalName.value = 'DialogModal1'; //显示输入IP弹窗
			return;
		} else if (urlData.value.Scope && !urlData.value.IsFirst) {
			//多次登录
			// onelogin.value = loginType.multipleLogin;
			loginUID.value = urlData.value.UID;
			//uni.setStorageSync('serverUrl', urlData.value.SourceSite); //写入ip地址
			// logins(username.value, password.value, onelogin.value, loginUID.value, proxy);

			return;
		}
		//#endif
		// onelogin.value = getPhoneKey.data.IsFirst ? loginType.oneLogin : loginType.multipleLogin;
		loginUID.value = getPhoneKey.data.UID;
		// if (onelogin.value == loginType.oneLogin) { //第一次登录
		// 	proxy.$refs.uTips.show({
		// 		title: '首次一键登录需记录域名,账号与及密码!',
		// 		type: 'warning',
		// 		duration: '10000'
		// 	})
		// 	if (remindSetIP) {
		// 		uni.showModal({
		// 			title: '提示',
		// 			content: '是否现在输入域名',
		// 			success: (res) => {
		// 				if (res.confirm) {
		// 					modalName.value = 'DialogModal1'; //显示输入IP弹窗
		// 				} else if (res.cancel) {

		// 					remindSetIP = false;
		// 					return;
		// 				}
		// 			}
		// 		});
		// 	}
		// } else if (onelogin.value == loginType.multipleLogin) {
		// 	uni.setStorageSync('serverUrl', getPhoneKey.data.SourceSite); //写入ip地址
		// 	logins(username.value, password.value, onelogin.value, loginUID.value, proxy);
		// }

	}

	/**显示弹框*/
	let showModal = (e : any) => {
		modalName.value = e.currentTarget.dataset.target;
	};
	/**取消弹框*/
	let hideModal = () => {
		//取消
		modalName.value = 'false';
	};
	/**确认弹框*/
	let hideModal2 = () => {
		let reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
		if (!reg.test(ipdizhi.value.toString())) { // 判断是否是http/https开头
			choiceAgreement.value = true;
			cueShow.value = true; //显示http辅助输入
			return;
		}
		choiceAgreement.value = false;
		//确定
		//清理本地数据缓存。uni.clearStorage
		let loginone = uni.getStorageSync("loginone"); //判断是否是2211重新绑定 如果是则重新绑定
		if (loginone != 0) uni.clearStorage();
		modalName.value = 'false';
		uni.setStorageSync('serverUrl', ipdizhi.value); //写入ip地址

	};
	let getIpValue = (event : any) => {
		ipdizhi.value = event.detail.value
		if (!cueShow.value) {
			const reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
			if (!reg.test(ipdizhi.value.toString())) { // 判断是否是http/https开头
				cueShow.value = true; //显示http辅助输入
			}
		}

	};
	/**登陆*/
	let btnLogin = () => {
		//判断用户是否配置ip地址,如果不配则使用测试环境ip地址
		if (ipdizhi.value.length <= 0 || ipdizhi.value === null || ipdizhi.value === undefined) {
			getUrlType(proxy)
		};
		const aa = uni.getStorageSync('serverUrl')
		if (username.value == '' || username.value.length == 0) {
			uni.showToast({
				title: "账号不能为空!",
				duration: 2000,
				icon: "none",
			})
			return;
		};
		//#ifdef H5
		if (uni.getStorageSync('optionData') != "") {
			urlData.value = JSON.parse(uni.getStorageSync('optionData'));
			getPhone(null, null);
		}
		//#endif

		// #ifdef APP-PLUS
		if (!agree.value) {
			showAgreeModal.value = true
			return
		}
		// #endif


		uni.setStorageSync('getTokenNum', "0");
		let loginone = uni.getStorageSync("loginone"); //判断是否是2211重新绑定 如果是则重新绑定
		if (loginone === 0) {
			logins(username.value, password.value, loginUID.value, proxy);
			uni.removeStorageSync("loginone");
			return;
		}

		// 调用登录函数		
		logins(username.value, password.value, loginUID.value, proxy);
	};

	//获取焦点
	let focus = () => {
		clean.value = true;
		let reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
		if (!reg.test(ipdizhi.value.toString())) { // 判断是否是http/https开头
			cueShow.value = true; //显示http辅助输入
			return;
		}
	}
	//失去焦点
	let blur = () => {
		ipInputState.value = false;
		let reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
		if (!reg.test(ipdizhi.value.toString())) { // 判断是否是http/https开头
			cueShow.value = true; //显示http辅助输入
		} else {
			cueShow.value = false; //显示http辅助输入
		}
		if (ipdizhi.value.length === 0) {
			clean.value = false;
		} else {
			throttle(() => {
				clean.value = false;
			}, 500, true)
		}

	}
	let cleanIp = () => {
		ipdizhi.value = "";
		ipInputState.value = true;
	}

	let userBlur = () => {
		inputColor.value = '#303133';
		showLogo.value = 1;
	}
	/**
	 * 	辅助输入Http /Https
	 * 	@param {check} Boolean 账号加密
	 * 	true:https
	 * 	false:http
	 */
	let cupHead = (check : Boolean) => {

		cueShow.value = false; //关闭http辅助输入
		let reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
		if (reg.test(ipdizhi.value.toString())) { //http开头
			let reg = /^(https?:\/\/)([0-9a-z.]+)(:[0-9]+)?([/0-9a-z.]+)?(\?[0-9a-z&=]+)?(#[0-9-a-z]+)?/i
			if (check) {
				ipdizhi.value = ipdizhi.value.replace(reg, "https://$2$3$4$5$6");
				return;
			}
			ipdizhi.value = ipdizhi.value.replace(reg, "http://$2$3$4$5$6");
		} else { //不是http开头
			if (check) {
				ipdizhi.value = "https://" + ipdizhi.value;
				return;
			}
			ipdizhi.value = "http://" + ipdizhi.value;
		}
		ipInputState.value = true
	}
	function navigeAgreement(index : Number) {
		uni.navigateTo({
			url: '/pages/subpkg/agreement?index=' + index
		})
	}
	function agreeConfirm() {
		agree.value = true;
		showAgreeModal.value = false;
		btnLogin()
	}
	function agreeCancel() {
		showAgreeModal.value = false;
	}
</script>

<style lang="scss" scoped>
	input:-internal-autofill-selected {
		-webkit-text-fill-color: #FFFFFF !important;
		transition: background-color 5000s ease-in-out 0s !important;
	}

	.cu-modal {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 1110;
		opacity: 0;
		outline: 0;
		text-align: center;
		-ms-transform: scale(1.185);
		-webkit-transform: scale(1.185);
		transform: scale(1.185);
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
		-webkit-perspective: 1104px;
		perspective: 1104px;
		background: rgba(0, 0, 0, 0.6);
		transition: all 0.3s ease-in-out 0s;
		pointer-events: none;
	}

	.cu-modal.show {
		opacity: 1;
		transition-duration: 0.3s;
		-ms-transform: scale(1);
		-webkit-transform: scale(1);
		transform: scale(1);
		overflow-x: hidden;
		overflow-y: auto;
		pointer-events: auto;
	}

	.cu-modal::before {
		content: "\200B";
		display: inline-block;
		height: 100%;
		vertical-align: middle;
	}

	.bg-white {
		background-color: #ffffff;
	}

	.justify-end {
		justify-content: flex-end;
	}

	.cu-bar {
		display: flex;
		position: relative;
		align-items: center;
		min-height: 55px;
		justify-content: space-between;
	}

	.padding-xl {
		padding: 27px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;

		.value-cue {
			transition: all .5s ease;
			width: 100%;
			background-color: rgba(17, 17, 17, 0.15);
			display: flex;
			align-items: center;
			position: absolute;
			bottom: -72%;
			left: -100%;
			z-index: 1;

			.value-https {
				padding: 20rpx 0rpx;
			}

			.value-http {
				padding: 20rpx 10rpx;
			}
		}
	}

	.cu-bar {
		display: flex;
		position: relative;
		align-items: center;
		min-height: 55px;
		justify-content: space-between;
	}

	.justify-end {
		justify-content: flex-end;
	}

	.bg-white {
		background-color: #ffffff;
	}

	.cu-bar .content {
		position: absolute;
		text-align: center;
		width: calc(100% - 187px);
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		margin: auto;
		height: 33px;
		font-size: 17px;
		line-height: 33px;
		cursor: none;
		pointer-events: none;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.cu-dialog {
		position: relative;
		display: inline-block;
		vertical-align: middle;
		margin-left: auto;
		margin-right: auto;
		width: 353px;
		max-width: 100%;
		background-color: #f8f8f8;
		border-radius: 5px;
		overflow: hidden;
	}

	.cu-modal .cu-dialog>.cu-bar:first-child .action {
		min-width: 55px;
		margin-right: 0;
		min-height: 55px;
	}

	.cu-bar .action:last-child {
		margin-right: 16px;
	}

	.action {
		display: flex;
		align-items: center;
		justify-content: space-between;

	}

	.action .action_Btn::after {
		border: none;
	}

	.cu-bar .action {
		display: flex;
		align-items: center;
		height: 100%;
		justify-content: center;
		max-width: 100%;

		.margin-left {
			margin-left: 16px;
		}
	}

	.text-red,
	.line-red,
	.lines-red {
		color: #e54d42;
	}

	.Btn_div {
		margin: 18% 10% 0% 10%;
	}

	.line-green::after,
	.lines-green::after {
		border-color: #39b54a;
	}

	.bg-green {
		background-color: #39b54a;
		color: #ffffff;
	}

	.bg-orange {
		background-color: #ff9900c8;
		color: #ffffff;
	}

	.margin-left {
		margin-left: 16px;
	}

	.cu-btn[class*="line"] {
		background-color: transparent;
	}

	.text-green,
	.line-green,
	.lines-green {
		color: #39b54a;
	}

	.cu-btn {
		position: relative;
		border: 0px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		padding: 0 16px;
		font-size: 15px;
		height: 35px;
		line-height: 1;
		text-align: center;
		text-decoration: none;
		overflow: visible;
		margin-left: initial;
		-webkit-transform: translate(0px, 0px);
		transform: translate(0px, 0px);
		margin-right: initial;

	}

	.logo_Top {
		margin-top: 25%;
		text-align: center;
	}

	.logo_Top>.Font {
		color: #177fc7;
		font-weight: bold;
		margin-top: 2%;
		font-size: 48upx !important;
		padding-bottom: 22px;
	}

	.Backstage_Data,
	.Other {
		width: 85%;
		margin: auto;

	}

	.inputUser {
		::-webkit-input-placeholder {
			/* WebKit browsers */
			direction: rtl;
		}

		:-moz-placeholder {
			/* Mozilla Firefox 4 to 18 */
			direction: rtl;
		}

		::-moz-placeholder {
			/* Mozilla Firefox 19+ but I'm not sure about working */
			direction: rtl;
		}

		:-ms-input-placeholder {
			/* Internet Explorer 10+ */
			direction: rtl;
		}
	}


	.Btn_div {
		margin: 18% 10% 0% 10%;
	}

	#Btn {
		border-radius: 17px;
	}

	.sz_server {
		width: 50%;
		padding-left: 10%;
		font-size: 20upx;
		letter-spacing: 5rpx;
		color: #fff;
	}

	.Corporate_name,
	.url {
		position: relative;
		padding: 2px 6px;
		margin: 11px 9px;
		font-family: 微软雅黑;
		font-size: 24rpx;
		margin: auto;
		text-align: center;
		color: #aaacb8;
	}

	.bk {
		padding: 2% 140rpx;
		border-bottom: 1px solid #fff;
		display: flex;
		width: 90%;
		margin: auto;
		margin-top: 40upx;
		font-size: 36upx;
	}

	.uni-input-placeholder {
		color: #fff;
	}

	.thirdLogin {
		margin-top: 10%;
		color: #FFFFFF;
		text-align: center;
	}

	.thirdLogin-title {
		font-size: 12px;
	}

	.thirdLogin-icon {
		margin-top: 24upx;
		font-size: 12px;
		display: flex;
		justify-content: space-around;
	}

	.weixin-icon,
	.dingding-icon,
	.duanxin-icon {
		font-size: 30px;
		color: #fff;
	}

	.icon-title {
		margin-top: 10upx;
	}

	.slot-content {
		padding: 50rpx;
		font-size: 28rpx;
		color: $u-content-color;
	}

	.checkAgree {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>