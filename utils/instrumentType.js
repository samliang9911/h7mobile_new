/**获取IP地址*/
/* export const getUrlType = ()=>uni.getStorageSync('serverUrl')||"https://new.pcm77.com:4481"; */
export const getUrlType = ()=>uni.getStorageSync('serverUrl')||window.location.origin

//获取IP地址
function getUrlTypes(proxy) {
	let urlType = proxy.serverUrlTypeSwitch;
	let serverUrl = uni.getStorageSync('serverUrl'); //读取查看用户是否修改url
	if (!serverUrl) {
		/* serverUrl = urlType === "demo" ? "http://192.168.0.71" : "https://new.pcm77.com:4481" */
		serverUrl = urlType === "demo" ? "http://192.168.0.71" : window.location.origin
		return serverUrl;
	} else {
		// console.log('instance???', proxy)
		let urlType = proxy.serverUrlTypeSwitch;
		if (urlType === "demo") //演示
		{
			let serverUrl = "http://192.168.0.71";
			return serverUrl;
		}
		if (urlType === "production") //生产
		{
			let serverUrl = uni.getStorageSync('serverUrl');
			if (!uni.getStorageSync('serverUrl')) {
				/* serverUrl = "https://new.pcm77.com:4481"; */
				serverUrl = window.location.origin
			}
			return serverUrl;
		}
	}
}

//浏览附件url sass
function checkFileSass(proxy) {
	let urlType = proxy.serverUrlTypeSwitch;
	if (urlType === "demo") //演示
	{
		let serverUrl = "http://192.168.0.81:777";
		return serverUrl;
	}
	if (urlType === "production") //生产
	{
		let serverUrl = "https://auth.pcm77.com/AskforPage.html";
		return serverUrl;
	}
}

let getInputDefaultValue = storageKey => {
	// return uni.getStorageSync(storageKey)
	let flag = storageKey;
	if (uni.getStorageSync(storageKey)) {
		flag = uni.getStorageSync(storageKey)
	}
	if (storageKey == 'datatime') {
		flag = dateTime();
	}
	return flag;
}

//静态资源链接
function startUserImage() {
	let state = {
		//---------默认图片Url地址,当图片获取失败或者没有时会调用此链接-----------
		defultImage: '../../static/user-image/HRM.png',
		defultImageMan: '../../static/user-image/man.png',
		defultImageGirl: '../../static/user-image/girl.png',
		defultImageChineseNewYear: '../../static/user-image/ChineseNewYear.png',
		listSex: [{
				value: 1,
				label: '男'
			},
			{
				value: 0,
				label: '女'
			}
		],
		//---------消息数量最大显示99条提示-----------
		messageIndex: "99",
		backGround: 'backg', //按钮颜色
		colour: '#4395ff',
		naviColor: 'naviColor' //导航滑动按钮颜色
	}
	return state
}
/**
 * @param {*} ArrayList 需要分类的数组
 * @param {*} objectKeyName 需要分类的对象键名称
 */
function classification(ArrayList, objectKeyName) {
	let newArrayPersevationKeyName = [];
	if (!ArrayList || ArrayList.lenght === 0) return;
	return ArrayList.reduce((oldData, newData, index) => {

		if (Object.prototype.toString.call(newData) === "[object Array]") { //newData.constructor === Array
			newArrayPersevationKeyName.push(...newData);
			if (ArrayList.length - 1 === index) {
				oldData.push(...classification(newArrayPersevationKeyName, objectKeyName));
				return oldData;
			}
			return oldData;

		} else if (Object.prototype.toString.call(newData) ===
			"[object Object]") { // newData.constructor === Object
			if (newArrayPersevationKeyName.length === 0) {
				oldData.push([newData]);
				newArrayPersevationKeyName.push(newData[objectKeyName]);
				return oldData;
			}
			if (newArrayPersevationKeyName.indexOf(newData[objectKeyName]) != -1) {
				oldData[newArrayPersevationKeyName.indexOf(newData[objectKeyName])].push(newData);
			} else {
				oldData.push([newData]);
				newArrayPersevationKeyName.push(newData[objectKeyName]);

			}
			return oldData;
		}

	}, [])
}

let fileUrl = (
	function() {
		let accessoryUrl = ""; //附件浏览url
		return {
			getaccessoryUrl: function() {
				return accessoryUrl;
			},
			setaccessoryUrl: function(val) {
				accessoryUrl = val;
			}
		}
	}
)()


let personalInfo = (
	function() {
		let personalDataTitle = [{
				title: "性别",
				name: "男",
			},
			{
				title: "出生日期",
				name: "2005-10-13",
			}, {
				title: "手机",
				name: "13078875166",
			}, {
				title: "公司",
				name: "中国海洋集团有限公司",
			},
			{
				title: "账号",
				name: "林工",
			},
			{
				title: "部门",
				name: "龙虾部",
			},
			{
				title: '职务',
				name: "岗位",
			}, {
				title: "邮箱",
				name: "14253@qq.com"
			}
		];
		return {
			getpersonal: function() {
				return personalDataTitle;
			},
			setpersonal: function(value) {
				personalDataTitle[0].name = value[0].Sex == 1 ? "男" : "女"
				personalDataTitle[1].name = value[0].Birthday || '未设置出生日期'; //出生日期
				personalDataTitle[2].name = value[0].MobilePhone || '未设置公手机号'; //手机号
				personalDataTitle[3].name = value[0].OrgName || '未设置公司名称'; //公司名称
				personalDataTitle[4].name = value[0].PersonName || '未设置用户名称'; //用户名称
				personalDataTitle[5].name = value[0].Division || '未设置部门'; //部门
				personalDataTitle[6].name = value[0].PostName || '未设置职务'; //职务
				personalDataTitle[7].name = value[0].CON_EMAIL_ADDR || '未设置邮箱'; //邮箱
			}
		}
	}
)()
//获取当前时间
const dateTime = function(type) {
	// 无参数时默认返回：年-月-日 时:分:秒 (2020-10-13 23:10:35)
	// 参数为true时返回：年-月-日（2020-10-13）

	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var hours = date.getHours();
	if (hours >= 0 && hours <= 9) {
		hours = "0" + hours;
	}
	var minutes = date.getMinutes();
	if (minutes >= 0 && minutes <= 9) {
		minutes = "0" + minutes;
	}
	var seconds = date.getSeconds();
	if (seconds >= 0 && seconds <= 9) {
		seconds = "0" + seconds;
	}
	let currentdate = null

	currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + hours + seperator2 + minutes +
		seperator2 + seconds;
	if (type) {
		currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
	}
	return currentdate;
}

function timeFormate(timeStamp) {
	let year = new Date(timeStamp).getFullYear(); //年
	let month = new Date(timeStamp).getMonth() + 1 < 10 ? "0" + (new Date(timeStamp).getMonth() + 1) : new Date(
		timeStamp).getMonth() + 1; //月
	let day = new Date(timeStamp).getDate() < 10 ? "0" + new Date(timeStamp).getDate() :
		new Date(timeStamp).getDate(); //日
	let hh = new Date(timeStamp).getHours() < 10 ? "0" + new Date(timeStamp).getHours() :
		new Date(timeStamp).getHours(); //时
	let mm = new Date(timeStamp).getMinutes() < 10 ? "0" + new Date(timeStamp).getMinutes() :
		new Date(timeStamp).getMinutes(); //分
	let ss = new Date(timeStamp).getSeconds() < 10 ? "0" + new Date(timeStamp).getSeconds() :
		new Date(timeStamp).getSeconds(); //秒
	let week = new Date(timeStamp).getDay(); //星期几
	let weeks = ["日", "一", "二", "三", "四", "五", "六"];
	let getWeek = "星期" + weeks[week]; //根据星期几去获取相对应数组值
	return {
		year: year,
		month: month,
		week: getWeek,
		day: day,
		hh: hh,
		mm: mm,
		ss: ss
	}
}

// 随机获取OID 
const guid = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
//传入初始经纬度与结束经纬度计算距离多少m 		//计算距离，参数分别为第一点的经度,纬度；第二点的经度,纬度 - 默认单位m
function calculateLineDistance(startLongitude, startLatitude, endLongitude, endLatitude) {
	let d1 = 0.01745329251994329;
	let d2 = startLongitude;
	let d3 = startLatitude;
	let d4 = endLongitude;
	let d5 = endLatitude;
	d2 *= d1;
	d3 *= d1;
	d4 *= d1;
	d5 *= d1;
	let d6 = Math.sin(d2);
	let d7 = Math.sin(d3);
	let d8 = Math.cos(d2);
	let d9 = Math.cos(d3);
	let d10 = Math.sin(d4);
	let d11 = Math.sin(d5);
	let d12 = Math.cos(d4);
	let d13 = Math.cos(d5);
	let arrayOfDouble1 = [];
	let arrayOfDouble2 = [];
	arrayOfDouble1.push(d9 * d8);
	arrayOfDouble1.push(d9 * d6);
	arrayOfDouble1.push(d7);
	arrayOfDouble2.push(d13 * d12);
	arrayOfDouble2.push(d13 * d10);
	arrayOfDouble2.push(d11);
	let d14 = Math.sqrt(
		(arrayOfDouble1[0] - arrayOfDouble2[0]) * (arrayOfDouble1[0] - arrayOfDouble2[0]) +
		(arrayOfDouble1[1] - arrayOfDouble2[1]) * (arrayOfDouble1[1] - arrayOfDouble2[1]) +
		(arrayOfDouble1[2] - arrayOfDouble2[2]) * (arrayOfDouble1[2] - arrayOfDouble2[2])
	);

	return Math.asin(d14 / 2.0) * 12742001.579854401;
}

function getloc(getItemName) {
	getItemName = String(getItemName).toLowerCase();
	let a = getItemName.split("@");
	let b = getItemName.split("＠");
	if (a.length === 2) {
		getItemName = a[1];
	} else if (b.length === 2) {
		getItemName = b[1];
	} else {
		getItemName = a[0];
	}
	if (getItemName === "datetime") { //返回现在创建时间
		return dateTime();
	} else if (getItemName === "employeename") //当前人的姓名
	{
		return uni.getStorageSync("EmployeeName");
	} else if (getItemName === "ucml_useroid") //当前人用户Key
	{
		return uni.getStorageSync("UCML_UserOID");
	} else if (getItemName === "ucml_divisionoid") //当前人的部门ｋｅｙ
	{
		return uni.getStorageSync("UCML_DivisionOID");
	} else if (getItemName === "division") //当前人的部门
	{
		return uni.getStorageSync("Division");
	} else if (getItemName === "ucml_organizeoid") //当前人的单位ｋｅｙ
	{
		return uni.getStorageSync("UCML_OrganizeOID");

	} else if (getItemName === "orgname") //当前人的单位
	{
		return uni.getStorageSync("OrgName");
	} else if (getItemName === "ucml_postoid") //当前人的岗位Ｋｅｙ
	{
		return uni.getStorageSync("UCML_PostOID");
	} else if (getItemName === "postname") //当前人的岗位
	{
		return uni.getStorageSync("PostName");
	} else if (getItemName === "ucml_postclassoid") //当前人的岗位分类Ｋｅｙ
	{
		return uni.getStorageSync("UCML_PostClassOID");
	} else if (getItemName === "costclass") //当前人的岗位分类
	{
		return uni.getStorageSync("PostClass");
	} else if (getItemName === "ucml_contactoid") //当前人的用户信息Ｋｅｙ
	{
		return uni.getStorageSync("UCML_CONTACTOID");
	} else if (getItemName === "headPortrait") //头像
	{
		return uni.getStorageSync("headPortrait");
	} else {
		return getItemName; //如果全部条件都不符合就返回
	}
}

/**
 * @param {Object} whereSentense where语句 正则通过## 替换掉里面内容返回一个新的
 * @param {Object} urlData URL数据
 * */
function whereHandle(whereSentense, urlData) {
	try {
		if (!urlData) urlData = {};
		return strReplace(whereSentense.replace(/#(.|\n)*#/gi, getloc(whereSentense.match(/#(\S*)#/) ? whereSentense
			.match(/#(\S*)#/)[1] : null)), urlData[whereSentense.match(/&(\S*)&/) ? whereSentense.match(
			/&(\S*)&/)[1] : null]);
	} catch (e) {
		return whereSentense;
		//TODO handle the exception
	}
}
/**
 * 替换内容为&替换&
 * @param {Object} str 需要替换的字符串
 * @param {Object} data 替换的内容
 */
function strReplace(str, data) {
	if (data) return str.replace(/&(.|\n)*&/gi, data);
	return str;
}
const chunkSplitor = (task, taskTime) => {
	setTimeout(() => {
		task((time) => time < 16);
	}, taskTime ? taskTime : 200)
}
export {
	startUserImage,
	personalInfo,
	fileUrl,
	checkFileSass,
	classification,
	timeFormate,
	guid,
	calculateLineDistance,
	// qqmapsdk,
	getInputDefaultValue,
	dateTime,
	getloc,
	whereHandle,
	chunkSplitor,
	strReplace
}