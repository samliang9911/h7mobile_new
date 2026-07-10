// 推荐再App.vue中使用
const PACKAGE_INFO_KEY = '__package_info__'

export default function() {
	// #ifdef APP-PLUS
	return new Promise((resolve, reject) => {
		callCheckVersion().then(async (e) => {
			if (!e.result) return;
			const {
				code,
				message,
				is_silently, // 是否静默更新
				url, // 安装包下载地址
				platform, // 安装包平台
				type // 安装包类型
			} = e.result;

			// 此处逻辑仅为实例，可自行编写
			if (code > 0) {
				resolve(e)
				// 静默更新，只有wgt有
				if (is_silently) {
					uni.downloadFile({
						url: e.result.url,
						success: res => {
							if (res.statusCode == 200) {
								// 下载好直接安装，下次启动生效
								plus.runtime.install(res.tempFilePath, {
									force: false
								});
							}
						}
					});
					return;
				}

				/**
				 * 提示升级一
				 * 使用 uni.showModal
				 */
				// return updateUseModal(e.result)

				/**
				 * 提示升级二
				 * 官方适配的升级弹窗，可自行替换资源适配UI风格
				 */
				uni.setStorageSync(PACKAGE_INFO_KEY, e.result)
				uni.navigateTo({
					url: `/components/upgrade/upgrade?local_storage_key=${PACKAGE_INFO_KEY}`,
					fail: (err) => {
						console.error('更新弹框跳转失败', err)
						uni.removeStorageSync(PACKAGE_INFO_KEY)
					}
				})

				return
			} else if (code < 0) {
				//console.error(message)
				return reject(e)
			}
			return resolve(e)
		}).catch(() => {
			reject()
		})
	});
	// #endif
}

/**
 * 使用 uni.showModal 升级
 */
function updateUseModal(packageInfo) {
	const {
		title, // 标题
		contents, // 升级内容
		is_mandatory, // 是否强制更新
		url, // 安装包下载地址
		platform, // 安装包平台
		type // 安装包类型
	} = packageInfo;

	let isWGT = type === 'wgt'
	let isiOS = !isWGT ? platform.includes('iOS') : false;
	let confirmText = isiOS ? '立即跳转更新' : '立即下载更新'

	return uni.showModal({
		title,
		content: contents,
		showCancel: !is_mandatory,
		confirmText,
		success: res => {
			if (res.cancel) return;

			// 安装包下载
			if (isiOS) {
				plus.runtime.openURL(url);
				return;
			}

			uni.showToast({
				title: '后台下载中……',
				duration: 1000
			});

			// wgt 和 安卓下载更新
			downloadTask = uni.downloadFile({
				url,
				success: res => {
					if (res.statusCode !== 200) {
						console.error('下载安装包失败', err);
						return;
					}
					// 下载好直接安装，下次启动生效
					plus.runtime.install(res.tempFilePath, {
						force: false
					}, () => {
						if (is_mandatory) {
							//更新完重启app
							plus.runtime.restart();
							return;
						}
						uni.showModal({
							title: '安装成功是否重启？',
							success: res => {
								if (res.confirm) {
									//更新完重启app
									plus.runtime.restart();
								}
							}
						});
					}, err => {
						uni.showModal({
							title: '更新失败',
							content: err
								.message,
							showCancel: false
						});
					});
				}
			});
		}
	});
}


function callCheckVersion() {
	// #ifdef APP-PLUS
	return new Promise((resolve, reject) => {
		plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
			const info = {
				appid: plus.runtime.appid,
				appVersion: plus.runtime.version,
				wgtVersion: widgetInfo.version
			}
			let serverUrl = 'https://auth.pcm77.com'
			const platform = uni.getSystemInfoSync().platform === 'android' ? 'Android' : 'IOS'
			const versionUrl = serverUrl + '/v3/Other/AppInfo?appType=' + platform
			uni.request({
				url: versionUrl,
				method: 'GET',
				success: (res) => {
					res = res.data
					//远程版本号
					const version = res.data.Version ? res.data.Version : info.wgtVersion
					const data = {
						result: {
							version: version,
							code: compare(version, info.wgtVersion),
							message: res.msg,
							contents: res.data.contents || '', // 升级内容
							is_mandatory: res.data.ForceUpdate !== "false" && res.data.ForceUpdate ? true : false, // 是否强制更新
							is_silently: false, // 是否静默更新
							url: serverUrl + res.data.DownloadPath,
							platform: platform, // 安装包平台
							type: platform === 'Android' ? 'apk' : 'ipa', //wgt
							...info
						}
					}
					resolve(data)
				},
				fail: () => {
					reject()
				}
			})

		})
	})
	// #endif
	// #ifndef APP-PLUS
	return new Promise((resolve, reject) => {
		reject({
			message: '请在App中使用'
		})
	})
	// #endif
}


/**
 * 对比版本信息
 * @param {Object} newInfo 新版本信息
 * @param {Object} oldInfo 旧版本信息
 * @returns {Number} new大于old    				1
 * @returns {Number} new等于old    				0
 * @returns {Number} 小于或版本信息不符合标准      -1
 */
export function compareVersionInfo(newInfo, oldInfo) {
    //版本 日期 当天第几个包
    // V\d+(\.\d+)* 匹配以v开头的版本号 V1 V2 V2.1
    // \d{4}\.\d{1,2}\.\d{1,2} 匹配日期格式,月份，日期可省略0
    // \d+ 匹配至少1位数字
    const reg = /^V\d+(\.\d+)*-\d{4}\.\d{1,2}\.\d{1,2}-\d+$/i;
    if(!reg.test(newInfo) || !reg.test(oldInfo)) return -1
    let [newVersion, newDate, newNums] = newInfo.split('-');
    if (!newVersion || !newDate || !newNums) return -1
    let [oldVersion, oldDate, oldNums] = oldInfo.split('-');
    if (!oldVersion || !oldDate || !oldNums) return -1
    const compareResult = compare(newVersion.substring(1,newVersion.length), oldVersion.substring(1,oldVersion.length))
    if (compareResult === 1) {
        return 1;
    } else if (compareResult === 0) {
        newDate = new Date(newDate);
        oldDate = new Date(oldDate);
        if (newDate > oldDate) {
            return 1;
        } else if (newDate < oldDate) {
            return -1
        } else {
            newNums = Number(newNums);
            oldNums = Number(oldNums);
            if (newNums > oldNums) {
                return 1;
            } else if (newNums === oldNums) {
                return 0
            } else {
                return -1;
            }
        }
    } else {
        return -1
    }
}


/**
 * 对比版本号，如需要，请自行修改判断规则
 * 支持比对	("3.0.0.0.0.1.0.1", "3.0.0.0.0.1")	("3.0.0.1", "3.0")	("3.1.1", "3.1.1.1") 之类的
 * @param {Object} v1
 * @param {Object} v2
 * v1 > v2 return 1
 * v1 < v2 return -1
 * v1 == v2 return 0
 */
export function compare(v1 = '0', v2 = '0') {
	v1 = String(v1).split('.')
	v2 = String(v2).split('.')
	const minVersionLens = Math.min(v1.length, v2.length);

	let result = 0;
	for (let i = 0; i < minVersionLens; i++) {
		const curV1 = Number(v1[i])
		const curV2 = Number(v2[i])

		if (curV1 > curV2) {
			result = 1
			break;
		} else if (curV1 < curV2) {
			result = -1
			break;
		}
	}

	if (result === 0 && (v1.length !== v2.length)) {
		const v1BiggerThenv2 = v1.length > v2.length;
		const maxLensVersion = v1BiggerThenv2 ? v1 : v2;
		for (let i = minVersionLens; i < maxLensVersion.length; i++) {
			const curVersion = Number(maxLensVersion[i])
			if (curVersion > 0) {
				v1BiggerThenv2 ? result = 1 : result = -1
				break;
			}
		}
	}

	return result;
}
