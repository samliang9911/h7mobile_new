<script setup lang="ts">
import {onLaunch, onShow} from '@dcloudio/uni-app'
// #ifdef APP-PLUS
plus.navigator.closeSplashscreen()
// @ts-ignore
plus.globalEvent.addEventListener('message', (event) => {
  if (event.data.type === "navigateTo") {
    uni.navigateTo({
      url: event.data.data + "?" + event.data.Param
    })
  }
})

onShow(()=>{
/*  const url = (plus.runtime.arguments||'').replace(/gzhr:\//,'')
  console.log('url', url)
  if(url){
    plus.runtime.arguments = ''
    uni.navigateTo({
			url:"/pages/Guide/splash?redirect="+btoa(url).replace(/\+/g, '-').replace(/\//g, '_')
		})
  } */
    const args = (plus.runtime.arguments||'').replace(/gzhr:\//,'')
	console.log('args', args)
	console.log('ccc')
    if (args) {
      plus.runtime.arguments = '' // 立即清空，防止重复处理
      
      // 只处理一种情况：包含 code 和 Scope 的第三方授权链接
      // 例如: http://192.168.0.107:5173/#/pages/Guide/splash?Scope=gdhwater&code=TCP09bA06EcWTmhOw3sSkkDHu3OSNnmu1_hlZl5p75I&state=70aef03bc06045b095ab6076380e8116
      if (args.includes('code=') && args.includes('Scope=') && args.includes('state=')) {
        // 解析参数
	    const questionMarkIndex = args.indexOf('?');
		// 如果存在 ?，截取其后的部分；否则返回空字符串
		const queryString = questionMarkIndex > -1 ? args.substring(questionMarkIndex + 1) : '';
		
		const params = new URLSearchParams(queryString);
        const code = params.get('code')
        const Scope = params.get('Scope')
		const state = params.get('state')
        
        if (code && Scope && state) {
          // 直接跳转到 splash.vue 并传递原始参数
          uni.navigateTo({
            url: `/pages/Guide/splash?code=${code}&Scope=${Scope}&state=${state}`
          })
        }
      }
	}
})
// #endif




/*
	import {onLaunch,onShow,onHide} from '@dcloudio/uni-app'
	import {startUserImage} from '@/utils/instrumentType.js'
	import { isTokenExpired } from '@/api/api.js';
  
	onLaunch(() => {		
		// #ifdef H5 || APP-PLUS
		uni.reLaunch({
			url:"pages/Guide/splash"
		})
		// #endif
		const getAccessToken = uni.getStorageSync('AccessToken');
		//token过期时间
		// 如果token过期, 则重新登录, 否则自动登录		
		const isToken = ()=>{
			if (!getAccessToken || isTokenExpired()) {
				uni.clearStorageSync(); // 清除缓存
						uni.reLaunch({
							url: '/pages/login/login'
						})
			} else {
          uni.switchTab({
            url: '/pages/index/items'
          })
      }
		}			
		setTimeout(isToken,1200)
		// #ifdef APP-PLUS
		plus.navigator.closeSplashscreen();
		uni.setStorageSync("isRefreshing",false)//token刷新状态
		//监听webview发送的消息
		plus.globalEvent.addEventListener('message', (event) => {
			if (event.data.type === "navigateTo") {
				uni.navigateTo({
					url: event.data.data + "?" + event.data.Param
				})
			}
			// 处理接收到的消息  
		})
		//监听系统通知栏消息点击事件  
		plus.push.addEventListener('click',async function(msg:any){
			// console.log("监听系统通知栏消息点击事件：",msg);
			setTimeout(()=>{
				uni.navigateTo({
				  url: `/${msg.payload.path}`
				})
			},1000)
		    //处理点击消息的业务逻辑代码
		}, false);  
		// //监听接收透传消息事件  
		plus.push.addEventListener('receive', function(msg:any){
			// console.log("监听接收透传消息事件：",msg);
			try{
				let platform = uni.getSystemInfoSync().platform
				if(platform === 'ios'){
					if(typeof msg.payload == 'string'){
						msg.payload = JSON.parse(msg.payload)
					}
					let options = { cover: false, title: msg.title }
					//参数1 消息显示的内容，在系统通知中心中显示的文本内容。
					//参数2 消息承载的数据，可根据业务逻辑自定义数据格式。
					//参数3 创建消息的额外参数，参考MessageOptions。
					plus.push.createMessage(msg.content, msg.payload, options)
				}else if(platform === 'android'){
					let options = { cover: false, title: msg.title }
					plus.push.createMessage(msg.content, msg.payload, options)
				}
			}catch(e){
				
			}
		    //处理透传消息的业务逻辑代码 
		}, false);
		// #endif
		
		// 监听
		// #ifdef H5
		window.addEventListener('message', (event) => {
			console.log("addEventListener:",event)
			let data
			if(event.data.data && event.data.data.arg){
				data = event.data.data.arg
			}else{
				data = event.data
			}
			if (data.type === "navigateTo") {
				uni.navigateTo({
					url: data.data + "?" + data.Param
				})
			}
			// 处理接收到的消息  
		});
		let root : any = document.querySelector(":root");
		root.style.setProperty("--backGround", startUserImage().colour);

		let linkList = document.getElementsByTagName('link')
		let scriptList = document.getElementsByTagName('script')
		let versionNum = Date.now();

		function changeVersion(arr, flag) {
			if (flag == 'css') {
				for (let item of arr) {
					item.href = item.href + '?version=' + versionNum + '&time=' + versionNum
				}
			} else if (flag == 'script') {
				for (let item of arr) {
					if (item.src) item.src = item.src + '?version=' + versionNum + '&time=' + versionNum
				}
			}
		}
		changeVersion(linkList, 'css')
		changeVersion(scriptList, 'script')
		// #endif
		
		uni.setStorageSync("first", "first"); //记录首次进入
		
		//#ifdef MP-WEIXIN
		const updateManager = uni.getUpdateManager(); //本API返回全局唯一的版本更新管理器对象： updateManager，用于管理小程序更新。
		updateManager.onCheckForUpdate((res) => { //当向小程序后台请求完新版本信息，进行回调方法
			if (res.hasUpdate) {
				updateManager.onUpdateReady(() => { //当新版本下载完成，会进行回调
					uni.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success(res) {
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate();
							}
						}
					});
				});
				updateManager.onUpdateFailed(() => {
					// 新的版本下载失败
					uni.showModal({
						title: '更新提示',
						content: '检查到有新版本，但下载失败，请检查网络设置',
						success(res) {
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate();
							}
						}
					});
				});
			}
		})
		// #endif
	})
	onShow(() => { })
	onHide(() => { })
  */
</script>


<style lang="scss">
	/* #ifdef H5 */
	@import "https://www.pcm77.com/font/h7_App/iconfont.css";
	/* #endif */
	/* #ifdef MP-WEIXIN || APP-VUE */
	@import "/static/font/iconfont.css";
	/* #endif */
	/* #ifdef APP-PLUS */
	@import "uview-plus/index.scss";
	@font-face {
		font-family: 'PingFang-SC-Regular';
		src: url("https://www.pcm77.com/font/h7_App/H5/PingFang SC Regular.ttf");
	}
	body,
	html,
	input,
	view,
	textarea,
	text {
		font-family: PingFang-SC-Regular;
	}

	// 网络加载样式
	.uni-toast {
		background: transparent;
		color: #33333396;
	}

	.icon {
		width: 1em;
		height: 1em;
		vertical-align: -0.15em;
		fill: currentColor;
		overflow: hidden;
	}

	.uni-modal {
		z-index: 10077;
	}
	
	// 开启会导致性别选择器会被覆盖
	// .uni-mask {
	// 	z-index: 10076;
	// }

	uni-modal {
		z-index: 10078;
	}

	.backg {
		background-color: #4395ff !important;
	}

	.naviColor {
		background-color: #4395ff !important;
	}

	.writtenWords {
		//文字两行自动省略
		word-break: break-all;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		/* 这里是超出几行省略 */
		-webkit-line-clamp: 2;
		overflow: hidden;
		line-height: 40rpx;
	}

	.Q_loading_Box {
		background-color: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		position: fixed;
		top: 0;
		width: 100%;

		.Q_loading {
			position: relative;
			width: 100%;
			left: 43%;
			&::before {
				width: 32rpx;
				height: 32rpx;
				border-radius: 32rpx;
				background: blue;
				content: '';
				position: absolute;
				background: #9b59b6;
				animation: loading_before 1.5s infinite ease-in-out;
			}

			&::after {
				width: 32rpx;
				height: 32rpx;
				border-radius: 32rpx;
				background: blue;
				content: '';
				position: absolute;
				background: #2ecc71;
				left: 44rpx;
				animation: loading_after 1.5s infinite ease-in-out;
			}

			@keyframes loading_before {
				0% {
					transform: translateX(0rpx) rotate(0deg)
				}

				50% {
					transform: translateX(100rpx) scale(1.2) rotate(260deg);
					background: #2ecc71;
					border-radius: 0rpx;
				}

				100% {
					transform: translateX(0rpx)rotate(0deg);
				}
			}

			@keyframes loading_after {
				0% {
					transform: translateX(0rpx)
				}

				50% {
					transform: translateX(-100rpx) scale(1.2) rotate(-260deg);
					background: #9b59b6;
					border-radius: 0rpx;
				}

				100% {
					transform: translateX(0rpx);
				}
			}
		}
	}

	.Q_shake:hover {
		animation: Q_shake 800ms ease-in-out;
		background: radial-gradient(rgba(0, 0, 0, 0.03), transparent);
		color: DarkGray;
		border-radius: 10px;
		transition: .3s ease-in-out;
	}

	@keyframes Q_shake {

		/* 垂直抖动，核心代码 */
		10%,
		90% {
			transform: translate3d(0, -1px, 0);
		}

		20%,
		80% {
			transform: translate3d(0, +2px, 0);
		}

		30%,
		70% {
			transform: translate3d(0, -4px, 0);
		}

		40%,
		60% {
			transform: translate3d(0, +4px, 0);
		}

		50% {
			transform: translate3d(0, -4px, 0);
		}
	}

	/* #endif */
</style>