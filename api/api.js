/**
 * 此文件为 登录功能,  获取token
 * 
 */
import { code } from 'uview-plus/libs/function/test';
import {JSEncrypt} from '/utils/encrypt/jsencrypt.ts'	//导入加密函数
import {getUrlType} from '@/utils/instrumentType.js' //导入url域名的函数，获取"http://192.168.0.81" : "https://new.pcm77.com:4481"


// Scope 登录的方式  Default 默认：账号密码；Guest：访客登录；Phone：手机号码；QQ：腾讯qq；WeChat：微信；WeWork：企业微信；DingDing：钉钉
const Scope = 'Default';
const accessTokenKey = 'Access-Token';
const refreshAccessTokenKey = `X-${accessTokenKey}`;

/**
 * 登录函数
 *
 * 当用户输入账号密码后加密并持久化存储,
 * 然后调用$http_LoginInt()登录函数
 * 登录函数里面去getStorage加密后的账号,
 * 密码进行发送请求,如果下次token过期需
 * 要重新获取token直接调用$http_LoginInt()
 * 登录函数即可 
 * @param {string} userName 账号加密
 * @param {string} password 密码加密
 */
async function logins(userName, password, loginUID, proxy) {
	uni.setStorageSync("UCML_UserName", getEncrypt(userName));//存储加密的账号
	uni.setStorageSync("UCML_UserPassword", getEncrypt(password));//存储加密的密码
	await $http_LoginInt(loginUID, proxy)	//获取token
}
export function navigateTo(url){
  const obj = {url: '/pages/index/items?t=' + Date.now()}
  const path = atob(url.replace(/-/g, '+').replace(/_/g, '/')).replace(/^([^\/])/,e=>'/'+e)
  if(/^(?!\/?pages\/index\/items)/i.test(path)){
    obj.success = ()=>uni.navigateTo({url:path})
  }
  uni.reLaunch(obj)
}
///获取token
function $http_LoginInt(loginUID, proxy){
	return new Promise((resolve,reject) => {
		let user_name = uni.getStorageSync("UCML_UserName"); //读取加密账号
		let user_password = uni.getStorageSync("UCML_UserPassword"); //读取加密密码
		let timestamp = getEncrypt(String(new Date().getTime())); //获取加密时间戳
		let sendUrl = getUrl('LoginURL', proxy); //获取url http://192.168.0.71/api/sysAuth/login

		// 封装请求需要的加密data
		let json = {
			Account: user_name,
			Password: user_password,
			TimeStamp: timestamp,
			DeviceId:uni.getDeviceInfo().deviceId
		};
		
		//获取token请求
		http_request(proxy, json, sendUrl, (response, header) => {
			let res = response.data;
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
			// 加延时是因为里面异步等上面存储完成在进行跳转,或者用async,wait
			setTimeout(() => {
				// if (uni.getStorageSync("toPage")) {
				// 	let keyName = toPage.split("?")[1].split("=")[0];
				// 	let keyValue = new URLSearchParams(toPage.split("?")[1]);
				// 	uni.switchTab({
				// 		url: '/pages/index/items?t=' + Date.now(),
				// 		success: () => {
				// 			uni.navigateTo({
				// 				url: `${toPage.split("?")[0]}?${keyName}=${JSON.parse(keyValue.get(keyName))}&t=${Date.now()}`
				// 			});
				// 		}
				// 	});
				// 	resolve(true);
				// } 
        const toPage = uni.getStorageSync("toPage"); //获取后端返回的跳转链接如果有, 则代表跳转到后台指定路径
        if(toPage){
          navigateTo(toPage)
        }
        else {
					if (uni.getStorageSync("first")) { //首次进入					
						uni.switchTab({
							url: '/pages/index/items?t=' + Date.now()
						});
						uni.removeStorageSync('first');
						return;
					}
					let pages = getCurrentPages(); //判断当前在哪个页面
					let pagesList;
					try {
						pagesList = pages[0].route.split("/")
					} catch (e) {
						//TODO handle the exception
					}
					
					if (!pagesList || pagesList[pagesList.length - 1] === "login" || pagesList[pagesList.length - 1] === "home") {
						uni.switchTab({
							url: '/pages/index/items?t=' + Date.now()
						});
					}
				}
        resolve(true)
			}, 50)
		}, (res) => {
			if (res.code != '2203') {				
				uni.showToast({
					title: '未能成功获取到有效的Token，请联系系统管理员！出错消息:' + JSON.stringify(res), //内容
					icon: 'none',
					duration:3000
				});				
			}
			resolve(false);
		}, false, () => {
			uni.$emit('showloginLoading', false)
		})
	})
}
/**
 * 数据请求
 * @param {Array<{
 * tag:string, 
 * tb: string,
 * field: string,
 * wh?:{Filter:string,Param:{[key:string]:any}}
 * }} post 请求sql
 * @returns {Promise<{[key:string]:{Items:Object[]}}>} 请求结果
 */
export function request(post=[{}]){
  return http_request('',{json:post})
}

//数据请求
/**
 * @param {*} proxy 域名
 * @param {*} json_data 加密后的账号密码。 如果str_url为空的话,默认为发送数据url
 * @param {*} str_url 传入完整的URL, 获取token的地址
 * @param {*} prosperity 成功回调函数 请求成功code为1000才能调用
 * @param {*} lose 失败回调 空为默认读取
 * @param {*} isthrottle 是否启动防抖
 * @param {*} funendtime 函数执行完成
 * 默认异步,同步可以参考:syncdemo.md文件
 */
function http_request(proxy="没有用不用传", json_data, str_url, prosperity=()=>{}, lose, isthrottle) {
	return new Promise((resolve) => {
		let serverUrl = getUrlType(); //获取地址
		if (serverUrl.substr(0, 4) != "http") serverUrl = "http://" + serverUrl;
		if(!str_url)str_url = serverUrl + '/api/pubData/synthesis';
		let headItem = {
			sign:getSign(),
			Authorization: 'Bearer ' + uni.getStorageSync(accessTokenKey),
			'X-Authorization': 'Bearer ' + uni.getStorageSync(refreshAccessTokenKey),
		}
		if(uni.getStorageSync('optionData')){
			const optionData = JSON.parse(uni.getStorageSync('optionData'))
			if(optionData.code) headItem.Code = optionData.code
			if(optionData.Scope) headItem.Scope = optionData.Scope
		}
		const data = json_data instanceof FormData ? json_data : JSON.stringify(json_data);
		if(data instanceof FormData){
			convertFormDataForUniRequest(json_data, headItem)
			return;
		}
		// 添加转换函数
		function convertFormDataForUniRequest(formData, headItem) {
		  // 第一步： 创建xhr对象
		  let xhr = new XMLHttpRequest();
		  // 第二步： 调用open函数
		  xhr.open('POST', 'http://192.168.0.81:18/api/sysFile/fileSave')
		  // 第三步： 设置Content-Type属性 （这一步是固定的写法）
		  Object.keys(headItem).forEach(key => {
		    // 如果是 FormData，让浏览器自动设置 Content-Type
		      xhr.setRequestHeader(key, headItem[key]);
		  });
		  // 第四步： 调用send（）函数，同时将数据以查询字符串的形式，提交给服务器
		  xhr.send(formData)
		  // 第五步：监听onreadystatechange事件
		  xhr.onreadystatechange = function() {
			  const response = JSON.parse(xhr.responseText);
				if(response.code == '1000'){
					resolve(response.data)
					prosperity(response);
				}else{
					uni.showToast({
						title:'失败',
						icon:'none',
						duration:2000
					})
				}
		  }
			
		}
		
		
		throttle(() => {
			uni.request({
				url: str_url,
				method: "POST",
				header: headItem,
				data: data,	
				success: async (res) => {
				
          const {'access-token':accessToken,'x-access-token':refreshAccessToken} = res.header
          if(accessToken!='invalid_token'&&accessToken&&refreshAccessToken){
            uni.setStorageSync(accessTokenKey,accessToken)
            uni.setStorageSync(refreshAccessTokenKey,refreshAccessToken)
          }
					let Code = res.data.code;
					// 成功回调
					if (Code == '1000') {
						resolve(res.data.data)
						prosperity(res, res.header);
					} else if (Code == '3802') {
						uni.showToast({
							title: "账号不存在！",
							icon: "none",
							duration: 2000
						})
					} else if (Code == '4000') {
						uni.showToast({
							title: "密码错误!",
							icon: "none",
							duration: 2000
						})
					}
					// 判断token是否过期
					else if (Code == '401' || Code == '2010' || Code == '2011' || Code ==
						'2012' || Code == '2013' || Code == '2014' || Code == '2220') {
						const getAccessToken = uni.getStorageSync('AccessToken');
						if (getAccessToken) {
							if (isTokenExpired() || res.data.msg === "Token令牌不存在!") {
								let oldServerUrl = uni.getStorageSync('serverUrl');
								uni.clearStorageSync(); // 清除缓存							
								uni.setStorageSync('serverUrl', oldServerUrl);
								uni.showToast({
									title: "token失效, 请重新登录",
									icon: "error",
									mask: true,
									duration: 2000
								})
								uni.reLaunch({
									url: '/pages/login/login'
								})
								return;
							} else {
								uni.reLaunch({
									url: '/pages/login/login'
								})
							}
						} else {
							uni.showToast({
								title: "请先登录",
								icon: 'none',
								duration: 2000,
								success: () => {
									uni.reLaunch({
										url: '/pages/login/login'
									})
								}
							})

							return;
						}
					} else {
						const error = (res.data?.msg)? res.data?.msg : JSON.stringify(res.data)
						uni.showModal({
							title: "提示",
							content: "发生错误！请联系系统管理员！" + "错误信息：" + error,
							showCancel: false,
							success: (result) => {
							    if (result.confirm) {
							        // 跳转到账号密码登录/绑定页，并携带第三方授权信息
							        uni.reLaunch({
							            url: `/pages/login/login?Scope=${json_data.Scope}&code=${json_data.code}`
										// url: '/pages/login/login'
							        })
							    }
							}
						})
					}
				},
				fail: (res) => {
					// alert('res', JSON.stringify(res))
					uni.showModal({
						title: "提示",
						content: "Fail错误！请联系系统管理员！" + "错误信息：" + JSON.stringify(res),
						showCancel: false,
					})
					console.log("Fail发生错误！请联系系统管理员！", "错误信息：", res)
					lose(res)
				}
			})
		}, 200, isthrottle)
	})
}
// 检查token是否过期
function isTokenExpired() {
	const TokenExpired = parseInt(uni.getStorageSync("Token_Time_End"),10); //parseInt 函数, 用于将字符串转换为整数。第一个参数是要转换的字符串，第二个参数是基数（radix），这里是 10，表示使用十进制。
	return TokenExpired < Date.now(); // 比较当前时间与过期时间
}
/**
 * @param {*} urlName 输入参数'LoginURL'为登录链接,输入参数'getDataURL'为查询等链接
 */
function getUrl(urlName, proxy) {

	// let serverUrl = getUrlType(proxy);
	const serverUrl = uni.getStorageSync('serverUrl')
	const LoginURL = '/api/sysAuth/login';
	const getDataURL = '/api/pubData/synthesis';
	if (urlName == 'LoginURL') {
		return serverUrl + LoginURL;
	} else if (urlName == 'getDataURL') {
		return serverUrl + getDataURL;
	} else {
		// console.error("url名称出错getToken文件第119行");
	}
}

// 公钥
const PublicKey =
	'qGSIb3DQEBAQUAA4GNADCBiQKBgQC91B4aZQamVZkTTsDndR01pfomKFS9g4Uh3L939MSNFEW8xOk7je2hiKw8fyUQxopD2Oxeha+VFBTZ2WVC3Ko5AmfCUzGkFegmw8Y9fm1PUK/NsogZV6jltMcst2GHGPBt4i0mMBadVjRCi0fYTYMlC/OuYievgpxhviW/NehLdQIDAQABMIGfMA0GCS';

//处理gy
function getKey() {
	var qian = PublicKey.substring(PublicKey.length - 10);
	var zhong = PublicKey.substring(0, PublicKey.length - 20);
	var hou = PublicKey.substring(PublicKey.length - 20, PublicKey.length - 10);
	var item = qian + zhong + hou;
	return item;
}

// 返回jm后的变量
function getEncrypt(param) {
	let encryptObj = new JSEncrypt(); // 加密方法
	let secretKey = getKey(); //gy
	encryptObj.setPublicKey(secretKey); // 设置密钥
	let flag = encryptObj.encrypt(param); // 变量加密后
	return flag;
}

//时间戳加密方法 
let timeEncryption = () => { 
	let encrypts = encryptFun(); //加密方法
	let timestamp = encrypts.encrypt(String(new Date().getTime())); //当前时间戳
	return timestamp;
}


/**
 * 获取Sign
 * 用于发送请求返回到head头部获取值
 * 参数1:校验是否重新读取token,如果有值则是重新读取token
 */
function getSign() {
	let AccessToken = uni.getStorageSync("AccessToken");//获取本地存储的token
	let timestamp = String(new Date().getTime()); //当前时间戳
	let sign = AccessToken + '＆' + timestamp;
	sign = getEncrypt(sign);
	return sign;
}


//节流对象
var throttleObj = {
	_timeName: null,
	get timeName() {
		return this._timeName;
	},
	set timeName(val) {
		this._timeName = val;
	}
}
/**
 * @param {Function} contentFn 节流内容
 * @param {int} time 节流时间默认500毫秒
 * @param {boolean} isthrottle 是否防抖,默认为false 不防抖
 */
function throttle(contentFn, time, isthrottle) {

	if (time == null || time == undefined || time == "") {
		time = 500;
	}
	if (isthrottle == null || isthrottle == undefined || isthrottle == '') {
		isthrottle = false;
		time = 0;
	}
	if (throttleObj.timeName && isthrottle) {
		clearTimeout(throttleObj.timeName);
	}
	throttleObj.timeName = setTimeout(() => {
		contentFn();
		throttleObj.timeName = null;
	}, time);
}

export {
	logins,
	http_request,
	throttle,
	getEncrypt,
	isTokenExpired,
}