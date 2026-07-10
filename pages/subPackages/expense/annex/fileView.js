/**********************************************/
/*****************  附件相关  *****************/
/**********************************************/
// #region 附件相关

// #region 附件预览功能

import {getUrlType} from '@/utils/instrumentType.js' 
import {useGlobalStoreHook} from '@/store/modules/autoPage'
import { http_request } from '../../../../api/api'


/** 附件预览 
 * @param {any} e 附件信息
 * @param {any} Config 附件配置
 * @param {string} [pathField='FilePath'] 路径字段名 | 可能具有不同的字段名
 * @param {string} [typeField='FileType'] 后缀字段名 | 可能具有不同的字段名
 */
export function previewFile(e, Config = {}, pathField = 'FilePath', typeField = 'FileType') {
	// console.log('previewFile', e, Config, pathField, typeField)
	if (['mp4', 'mov', 'wmv', 'avi', 'flv', 'mkv', 'ogv', 'webm'].includes(e.FileType)) {
		// 视频文件
		preVideo(e[pathField])
	} else if (['dwg', 'dxf', 'dwf'].includes(e[typeField])) {
		//CAD文件
		preCAD(e[pathField])
	} else if (['pdf', 'ofd', 'doc', 'docx', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'et'].includes(e[typeField])) {
		//office的文件  et是wps的格式
		preOffice(e, Config)
	} else if (['md', 'markdown', 'txt', 'mkd', 'mdown', 'mkdn'].includes(e[typeField])) {
		// Markdown文件
		preMarkdown(e[pathField])
	} else if (['xmind'].includes(e[typeField])) {
		//xmind文件
		preXmind(e[pathField])
	} else if (["3dm", "3ds", "3mf", "amf", "bim", "brep", "dae", "fbx", "fcstd", "gltf", "ifc",
			"iges", "step", "stl", "obj", "off", "ply", "wrl"
		].includes(e[typeField])) {
		//3d模型文件
		preModel3d(e[pathField])
	} else {
		let org = getUrlType();
		const path = e[pathField];
		const replace = [
			'/Html/Custom/AutoPage',
		]
		replace.forEach(item => {
			if (org.includes(item)) org = org.replace(item, '');
		})
		//其他类型则打开新窗口
			// window.open(e[pathField])
		
		window.open(`${org}/${path}`)
	}
}
/**
 * 返回对应文件的img图标
 * @param {string} fileExtension 字段字符串 
 * @returns 
 */
export function getFileIconUrl(fileExtension) {
	if (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'gif' || fileExtension === 'jpeg' ||
		fileExtension === 'bmp' || fileExtension === 'webp') {
		return false
	} else if (fileExtension === 'mp3' || fileExtension === 'mpeg' || fileExtension === 'mp4' || fileExtension ===
		'ogg' || fileExtension === 'wav' || fileExtension === 'webm') {
		return '/Images/img_fileType/VIDEO.png'
	} else if (fileExtension === 'pdf') {
		return '/Images/img_fileType/PDF.png'
	} else if (fileExtension === 'doc' || fileExtension === 'docx') {
		return '/Images/img_fileType/WORD.png'
	} else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
		return '/Images/img_fileType/ECEL.png'
	} else if (fileExtension === 'ppt' || fileExtension === 'pptx') {
		return '/Images/img_fileType/PPT.png'
	} else if (fileExtension === 'zip' || fileExtension === 'rar') {
		return '/Images/img_fileType/ZIP.png'
	} else if (fileExtension === 'txt') {
		return '/Images/img_fileType/TET.png'
	} else if (fileExtension === 'csv') {
		return '/Images/img_fileType/CSV.png'
	} else if (fileExtension === 'dwg') {
		return '/Images/img_fileType/PUB.png'
	} else if (fileExtension === 'xmind') {
		return '/Images/img_fileType/XMIND.png'
	} else if (fileExtension === 'md') {
		return '/Images/img_fileType/MD.png'
	} else if (["3dm", "3ds", "3mf", "amf", "bim", "brep", "dae", "fbx", "fcstd", "gltf", "ifc",
			"iges", "step", "stl", "obj", "off", "ply", "wrl"
		].includes(fileExtension)) {
		return '/Images/img_fileType/3D.png'
	} else {
		return '/Images/img_fileType/none.png'
	}
}



/**
 * 判断当前IP是否内网
 * @param {站点ip} ip 
 * @returns 
 */
function isPrivateIP(ip) {
	const privateRanges = [
		/^10\./, // 10.0.0.0 – 10.255.255.255
		/^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0 – 172.31.255.255
		/^192\.168\./ // 192.168.0.0 – 192.168.255.255
	];

	return privateRanges.some((range) => range.test(ip));
}



/**
 * 预览视频
 * @param {*} FilePath 文件地址
 */
export function preVideo(FilePath) {
	const body = document.body
	// 创建遮罩层
	const mask = document.createElement('div')
	mask.style.position = 'fixed'
	mask.style.top = '0'
	mask.style.left = '0'
	mask.style.width = '100%'
	mask.style.height = '100%'
	mask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
	mask.style.display = 'flex'
	mask.style.justifyContent = 'center'
	mask.style.alignItems = 'center'
	mask.style.zIndex = 99999
	// 创建 video 元素
	const video = document.createElement('video')
	let org = getUrlType();
	video.src = `${org}/${FilePath}`
	// video.src = `${FilePath}`

	// 判断前面4位是不是http
	// if (FilePath.substr(0, 4).toLowerCase() == 'http') {
	//   video.src = FilePath
	// } else {
	//   video.src = window.location.origin + '/' + FilePath
	// }
	/*    video.muted = true  // 静音播放
	    video.autoplay = true */

	video.controls = true
	video.style.maxWidth = '75%'
	video.style.maxHeight = '75%'

	// 创建关闭按钮
	const closeBtn = document.createElement('button')
	closeBtn.innerHTML = '&times;'
	closeBtn.style.position = 'absolute'
	closeBtn.style.top = '-20px'
	closeBtn.style.right = '-20px'
	closeBtn.style.fontSize = '2rem'
	closeBtn.style.padding = '0.5rem'
	closeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
	closeBtn.style.border = 'none'
	closeBtn.style.color = 'white'
	closeBtn.style.borderBottomLeftRadius = '100%'
	closeBtn.style.width = '80px'
	closeBtn.style.height = '80px'
	closeBtn.style.cursor = 'pointer'

	// 关闭按钮点击事件
	closeBtn.addEventListener('click', function() {
		mask.remove()
		video.pause()
	})

	// 遮罩层点击事件
	mask.addEventListener('click', function(event) {
		if (event.target === mask) {
			mask.remove()
			video.pause()
		}
	})

	// 添加 video 和关闭按钮到遮罩层中
	mask.appendChild(video)
	mask.appendChild(closeBtn)

	// 将遮罩层添加到 body 中
	body.appendChild(mask)

	// 播放视频
	video.play()
}


/**
 * 预览office文件
 * @param {any}  e
 * @param {any}  Config 附件配置，
 */
export function preOffice(e, Config = {}) {
	let panel = !!e.panel //面板是否启用
	let fileSize = e.FileSizeKb * 1024
	let permission = 'write'
	const globalStore = useGlobalStoreHook()
	const PrimaryKey = Config.BusinessDataTable ? Config.BusinessDataTable + 'OID' : 'Pub_BusinessFileOID';
	const OID = e[PrimaryKey]
	if (globalStore.IsBusinessPage) {
		let BusinessState = null
		const IsAdmin = uni.getStorageSync('IsAdmin') == "true" ? true : false
		// const ActivityID = getURLParameters('ActivityID')
		const ActivityID = ''
		try {
			/* BusinessState = globalStore.refList[globalStore.Dev_PageComponent.find(item => item.Component == 'Form')
				.Name].model.BusinessState */
			BusinessState = 1
			if (IsAdmin) {
				permission = "write"
			} else if ((BusinessState == 1 || BusinessState == 3)) {
				permission = 'write'
			} else if (ActivityID && Config.CanModifyNode) {
				const CanModifyNode = Config.CanModifyNode.split(',')
				if (CanModifyNode.includes(ActivityID)) permission = 'write'
				else permission = 'read'
			} else {
				permission = "read"
			}
		} catch (error) {
			permission = "read"
		}
	}
	// 第三方链接
	const H7_Office = uni.getStorageSync('H7_Office')
	let UserOID = uni.getStorageSync('UserOID')
	let RealName = uni.getStorageSync('RealName')
	let jsonData = {
		"fileID": OID , //文件ID
		"fileName": e.FileName, //文件名称
		"permission": permission, //权限 read 预览 write 编辑
	};
	
	debugger
	console.log('jsonData',jsonData)
	if (/^http/i.test(H7_Office)) {
		
		const jsonData2 = {
			"filePath": getUrlType() +'/api/sysFile/stream?url='+ e.FilePath, //文件路径
			"uid": UserOID, //登录用户ID
			"uname": RealName, //登录用户名称
			"size": fileSize, //文件大小 单位 B 字节 
			"source": getUrlType(), // 文件来源
			"panel": panel, //OnlyOffice 模板预览
			"tb": e.tb ? e.tb : Config.BusinessDataTable ? Config.BusinessDataTable : '', //业务表名
			"version": e.Version ?? 0, //版本号
		}
		jsonData = { ...jsonData, ...jsonData2 };
		var tempForm = document.createElement("form");
		openOfficePage(H7_Office, jsonData)
	}
	// 本地
	else{
		let serverUrl = getUrlType(); //获取地址
		if (serverUrl.substr(0, 4) != "http") serverUrl = "http://" + serverUrl;
		let str_url = serverUrl + H7_Office
		http_request('', jsonData, str_url, (res) => {			
			if(res.data.code == '1000'){
				openOfficePage(res.data.data,jsonData)
			} else {
				alert('res.msg',res.msg)
			}
		})	
	}
}
//判断哪个设备
function openOfficePage(H7_Office, jsonData) {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        // iOS 设备：使用 iframe 方式
        openOfficeForIOS(H7_Office, jsonData);
    } else {
        // 非 iOS 设备：使用原来的表单方式
        openOfficeWithForm(H7_Office, jsonData);
    }
}
//安卓
function openOfficeWithForm(url, data) {
    const tempForm = document.createElement("form");
    tempForm.action = url;
    tempForm.target = "_blank";
    tempForm.method = "post";
    tempForm.name = "look";
    tempForm.style.display = "none";
    
    for (var x in data) {
        var opt = document.createElement("textarea");
        opt.name = x;
        opt.value = data[x];
        tempForm.appendChild(opt);
    }
    
    document.body.appendChild(tempForm);
    tempForm.submit();
    
   setTimeout(() => {
        if (tempForm.parentNode) {
            document.body.removeChild(tempForm);
        }
    }, 1000);
}
//苹果
function openOfficeForIOS(url, data) {    
    // 创建表单，但不指定target或使用_self
    const tempForm = document.createElement("form");
    tempForm.action = url;
    tempForm.method = "post";
    tempForm.style.display = "none";
    // 使用input而不是textarea（更标准）
    for (var x in data) {
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = x;
        input.value = data[x];
        tempForm.appendChild(input);
    }
    document.body.appendChild(tempForm);
    tempForm.submit();  // 在当前页面提交
    // 可选：提交后重定向回原页面（如果需要）
    setTimeout(() => {
        if (tempForm.parentNode) {
            document.body.removeChild(tempForm);
        }
        // 如果用户需要返回，可以在这里处理
    }, 1000);
}

/**
 * 预览CAD文件
 * @param {string} filePath 文件地址
 */
export function preCAD(filePath) {
	let org = getUrlType();
	const jsonData = {
		"urlLink": `${org}/${filePath}`
	};
	const tempForm = document.createElement("form");

	if (isPrivateIP(location.hostname)) {
		const H7_CADUrl = new URL(localStorage.H7_CAD);
		//转换内网地址
		tempForm.action = `http://192.168.0.71:805${H7_CADUrl.pathname}`
	} else {

		tempForm.action = localStorage.H7_CAD || `http://${location.hostname}:805`
	}

	tempForm.target = "_blank";
	tempForm.method = "post";
	tempForm.name = "look";
	tempForm.style.display = "none";

	for (const x in jsonData) {
		const opt = document.createElement("textarea");
		opt.name = x;
		opt.value = jsonData[x];
		tempForm.appendChild(opt);
	}
	document.body.appendChild(tempForm);
	tempForm.submit();
}

/**
 * 预览3d模型文件
 * @param {string} filePath 文件地址
 */
export function preModel3d(filePath) {
	const jsonData = {
		"urlLink": location.origin + filePath
		// "urlLink": "http://192.168.0.139:5005" + filePath  //测试

	};
	const tempForm = document.createElement("form");

	//判断当站点是否为内网
	if (isPrivateIP(location.hostname)) {
		const H7_Model3d = new URL(localStorage.H7_Model3d);
		//转换内网地址
		tempForm.action = `http://192.168.0.71:801${H7_Model3d.pathname}`
	} else {

		tempForm.action = localStorage.H7_Model3d || "http://192.168.0.139:5006/ViewerFile/View3D"
	}

	// tempForm.action = "http://192.168.0.139:5006/ViewerFile/View3D"  //测试
	tempForm.target = "_blank";
	tempForm.method = "post";
	tempForm.name = "look";
	tempForm.style.display = "none";

	for (const x in jsonData) {
		const opt = document.createElement("textarea");
		opt.name = x;
		opt.value = jsonData[x];
		tempForm.appendChild(opt);
	}
	document.body.appendChild(tempForm);
	tempForm.submit();
}
/**
 * 预览Markdown文件
 * @param {string} filePath 文件地址
 */
export function preMarkdown(filePath) {
	const jsonData = {
		"urlLink": location.origin + filePath
		// "urlLink": "http://192.168.0.139:5005" + filePath

	};
	const tempForm = document.createElement("form");

	//判断当站点是否为内网
	if (isPrivateIP(location.hostname)) {
		const H7_Markdown = new URL(localStorage.H7_Markdown);
		//转换内网地址
		tempForm.action = `http://192.168.0.71:801${H7_Markdown.pathname}`
	} else {

		tempForm.action = localStorage.H7_Markdown || "http://192.168.0.139:5006/ViewerFile/ViewMarkDown"
	}

	// tempForm.action = "http://192.168.0.139:5006/ViewerFile/ViewMarkDown"
	tempForm.target = "_blank";
	tempForm.method = "post";
	tempForm.name = "look";
	tempForm.style.display = "none";

	for (const x in jsonData) {
		const opt = document.createElement("textarea");
		opt.name = x;
		opt.value = jsonData[x];
		tempForm.appendChild(opt);
	}
	document.body.appendChild(tempForm);
	tempForm.submit();

}

/**
 * 预览Xmind文件
 * @param {string} filePath 文件地址
 */
export function preXmind(filePath) {
	const jsonData = {
		"urlLink": location.origin + filePath
		// "urlLink": "http://192.168.0.139:5005" + filePath
	};
	const tempForm = document.createElement("form");
	//判断当站点是否为内网
	if (isPrivateIP(location.hostname)) {
		const H7_Xmind = new URL(localStorage.H7_Xmind);
		//转换内网地址
		tempForm.action = `http://192.168.0.71:801${H7_Xmind.pathname}`
	} else {

		tempForm.action = localStorage.H7_Xmind || "http://192.168.0.139:5006/ViewerFile/ViewMinder"
	}

	// tempForm.action = "http://192.168.0.139:5006/ViewerFile/ViewMinder"
	tempForm.target = "_blank";
	tempForm.method = "post";
	tempForm.name = "look";
	tempForm.style.display = "none";
	for (const x in jsonData) {
		const opt = document.createElement("textarea");
		opt.name = x;
		opt.value = jsonData[x];
		tempForm.appendChild(opt);
	}
	document.body.appendChild(tempForm);
	tempForm.submit();

}
// #endregion 附件预览功能

// #region 文件类型相关

/** 基本文件类型 */
const BasicTypeList = {
	/** PDF */
	pdf: ['pdf'],
	/** 文本 */
	text: ['txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
	/** 图片 */
	image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'psd', 'raw', 'bmp', 'heic', 'heif',
		'indd', 'ai', 'drw', 'dxf', 'eps', 'ps', 'svgz', 'tif', 'tiff', 'cr2', 'nef', 'orf',
		'sr2', 'arw', 'srf', 'x3f', 'webp', 'jxr', 'hdp', 'wdp', 'jxr', 'jng', 'j2k', 'j2c',
		'jp2', 'jpf', 'jpm', 'mj2', 'jxr', 'jxs'
	],
	/** 音频 */
	audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'ape', 'alac', 'tta', 'm3u',
		'm3u8', 'pls', 'm3u', 'xspf', 'asx', 'wax', 'wvx', 'wma', 'wpl', 'ram', 'rm',
		'rmm', 'rmp', 'rmt', 'wav', 'wma', 'wmv', 'wmx', 'wvx', 'wpl', 'cda', 'mid',
		'midi', 'mp2', 'mp3', 'mpa', 'mpa', 'mpc', 'mpp', 'mpt', 'mpv2', 'oga', 'ogg',
		'opus', 'ra', 'ram', 'rm', 'rmm', 'rmp', 'rmt', 's3m', 'sid', 'wma', 'wpl',
		'xspf', 'aac', 'ac3', 'aif', 'aifc', 'aiff', 'amr', 'ape', 'au', 'awb', 'dct',
		'dss', 'dvf', 'flac', 'gsm', 'iklax', 'ivs', 'm4'
	],
	/** 视频 */
	video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'vob', 'm4v', 'mpg', 'mp2',
		'mpeg', 'mpe', 'mpv', 'mpg', 'mpeg', 'm2v', 'm4p', 'm4v', 'svi', '3gp', '3g2',
		'mxf', 'roq', 'nsv', 'f4v', 'f4p', 'f4a', 'f4b', 'mng', 'qt', 'rm', 'rmvb',
		'asf', 'amv', 'm2ts', 'mts', 'ts', 'm2t', 'm2ts'
	],
	/** 字体 */
	font: ['otf', 'ttf', 'woff', 'woff2'],
	/** 磁盘 */
	disk: ['ccd', 'dmg', 'iso', 'mdf', 'vdi', 'vhd', 'vmdk', 'wim'],
	/** 代码 */
	code: ['c', 'cpp', 'cs', 'css', 'go', 'h', 'html', 'java', 'js', 'json', 'kt', 'php', 'py', 'rb', 'rs', 'vue',
		'xml', 'yml'
	],
	/** 可执行 */
	executable: ['apk', 'bat', 'exe', 'jar', 'ps1', 'sh'],
	/** 包 */
	package: ['deb', 'msi', 'pkg', 'rpm'],
	/** 压缩 */
	compressed: ['7z', 'bz2', 'cab', 'gz', 'rar', 'tar', 'xz', 'zst'],

	/** 3D模型类型 - model3d */
	model3d: ['3dm', '3ds', '3mf', 'amf', 'bim', 'brep', 'dae', 'fbx', 'fcstd', 'gltf', 'ifc', 'iges', 'step',
		'stl', 'obj', 'off', 'ply', 'wrl'
	],
	/** CAD */
	cad: ["dwg", "dxf"],
	/** OFFICE 文档 */
	office: ["doc", "docx", "dot", "dotx", "xls", "xlsx", "xlsm", "ppt", "pptx", "pptm", "mdb", "accdb", "pst",
		"ost", "one", "pub", "vsd", "vsdx"
	],


}

/** 获取文件类型列表，如果传入类型则返回对应类型列表或空，否则返回所有类型列表 
 * @param {string} type 文件类型
 */
export function getTypeList(type = '') {
	if (type) return BasicTypeList[type] || []
	return BasicTypeList
}
/** 根据文件名返回文件类型
 * @param {string} name 文件名或路径或拓展名
 */
export function getFileType(name) {
	if (!name) return ''
	const ext = name.split('.').pop().toLowerCase();
	for (const type in BasicTypeList)
		if (BasicTypeList[type].includes(ext)) return type
	return ''
}

/** 根据拓展名或文件类型获取对应的 icon 样式(ClassName) 
 * 优先使用扩展名，没有则根据类型获取
 * @param {string} type 文件类型
 * @param {string} ext  文件扩展名
 */
export function getIcon(type = '', ext = '') {
	let icon = '';
	/** 根据类型获取对应的 icon ，没有类型则使用默认值 */
	switch (type) {
		case 'folder':
			icon = 'H7_PC-huabanfuben1';
			break;
		case 'audio':
			icon = 'H7_PC-audio';
			break;
		case 'image':
			icon = 'H7_PC-image1';
			break;
		case 'video':
			icon = 'H7_PC-video1';
			break;
		case 'pdf':
			icon = 'H7_PC-PDF2';
			break;
		case 'text':
		default:
			icon = 'H7_PC-description_24dp_E8EAED';
			break;
	}
	/** 如果有扩展名，则使用扩展名对应的 icon */
	if (ext) switch (ext) {
		/** 文档 */
		case 'doc':
		case 'docx':
		case "log":
		case "odt":
		case "rtf":
			icon = 'H7_PC-wendang-docx_doc';
			break;
			/** 表格，数据库 */
		case 'xls':
		case 'xlsx':
		case "ods":
		case "csv":
		case "db":
		case "odb":
			icon = 'H7_PC-biaoge-xlxs_xls';
			break;
			/** ppt */
		case 'ppt':
		case 'pptx':
		case "odp":
			icon = 'H7_PC-yanshiwendang-ppt_pptx';
			break;
			/** 代码  */
		case "c":
		case "cpp":
		case "cs":
		case "css":
		case "go":
		case "h":
		case "html":
		case "java":
		case "js":
		case "json":
		case "kt":
		case "php":
		case "py":
		case "rb":
		case "rs":
		case "vue":
		case "xml":
		case "yml":
			icon = 'H7_PC-code';
			break;
			/** 可执行 */
		case "apk":
		case "bat":
		case "exe":
		case "jar":
		case "ps1":
		case "sh":
			icon = 'H7_PC-yunpanlogo-';
			break;
			/** 包 */
		case "deb":
		case "msi":
		case "pkg":
		case "rpm":
			icon = 'H7_PC-install-line';
			break;
			/** 压缩 */
		case "7z":
		case "bz2":
		case "cab":
		case "gz":
		case "rar":
		case "tar":
		case "xz":
		case "zip":
		case "zst":
			icon = 'H7_PC-Compressed';
			break;
			/** 磁盘 */
		case "ccd":
		case "dmg":
		case "iso":
		case "mdf":
		case "vdi":
		case "vhd":
		case "vmdk":
		case "wim":
			icon = 'H7_PC-disk';
			break;
			/** 字体 */
		case "otf":
		case "ttf":
		case "woff":
		case "woff2":
			icon = 'H7_PC-font';
			break;
	}
	return (`#${icon}`);
}
// #endregion 

// #region 右键菜单相关

/** 附件下载 
 * @param {any} file 附件信息
 */
export function downFile(file) {
	// 创建一个a标签
	const a = document.createElement('a');
	// 设置文件路径
	a.href = `/api/sysFile/stream?url=${file.FilePath}&fileName=${file.FileName}`;
	// 设置下载文件的名称
	a.download = file.FileName;
	// 将a标签添加到body中
	document.body.appendChild(a);
	// 触发点击事件
	a.click();
	// 从body中移除a标签
	document.body.removeChild(a);
}

/** 附件分享 
 * @param {any} curConfig 当前配置
 * @param {any} curFile   当前文件
 * @param {any} businessState 业务状态 1,3 可写 之外只读
 */
export function shareFile(curConfig, curFile, businessState = '1') {
	//创建人
	var SYS_CreatedBy = curFile.SYS_CreatedBy;
	//节点ID
	var activityID = 1
	//允许编辑的节点
	var canmodifynode = curConfig.AllowUploadNode;
	//业务状态
	var state = businessState;
	//权限
	let permission = "read";
	//ID
	var admin = "00000000-0000-0000-0000-000000000001"

	if (
		localStorage.UserOID == admin ||
		(localStorage.UserOID == SYS_CreatedBy && (state == "1" || state == "3")) ||
		(activityID && canmodifynode.indexOf(activityID) != -1)
	) {
		permission = "write"; //编辑
	}
	var clickCount = 0;

	// var url = `http://192.168.0.81/../../../html/plugin/Share.html`;  
	var url = `${location.origin}/../../../html/plugin/Share.html`;
	if (permission == "write") url += "?mode=1";
	layer.open({
		type: 2, //窗口类型
		resize: false, //是否允许拉伸
		area: ['400px', '500px'], //窗口宽、高
		anim: 2, //弹出动画 默认0平滑方法 2从最底部往上滑入
		maxmin: false, //是否开启标题栏的最大化和最小化图标。
		zIndex: 999, //弹层的初始层叠顺序值。
		scrollbar: false, //打开弹层时，是否允许浏览器出现滚动条。
		title: '<b>分享</b>', //标题
		content: url, //内容
		btn: ["创建链接"], //按钮
		btn1: function(index, layero, that) {
			if (clickCount != 0) {
				return;
			}
			clickCount++;
			// 获取 iframe 的窗口对象
			var iframeWin = window[layero.find('iframe')[0]['name']];

			//分享权限
			var accessRequirementDoc = iframeWin.document.querySelector(
				'input[name=accessRequirement]:checked')
			var accessRequirement = accessRequirementDoc.value

			//分享形式
			var wayDoc = iframeWin.document.querySelector('input[name=way]:checked');
			if (!wayDoc) return;

			var way = wayDoc.value;
			var mark = "";

			//自定义提取码
			if (way != "") {
				mark = iframeWin.document.getElementById("mark").value;
				if (mark.length != 6) {
					clickCount--;
					layer.msg("请输入6位数字或字母");
					return;
				}
			}
			//查阅权限
			var permissionsDoc = iframeWin.document.querySelector('input[name=permissions]:checked');
			var permissions = permissionsDoc.value;
			// el.permissions = permissions;

			//有效期
			var validityDoc = iframeWin.document.querySelector('input[name=validity]:checked');
			if (!validityDoc) {
				clickCount--;
				layer.msg("请选择有效期");
				return;
			}
			var validity = validityDoc.value;

			//备注
			var remark = iframeWin.document.getElementById("remark").value;
			//获取打开文件的路径
			// var url = `https://auth.pcm77.com/Office?fileID=${curFile.Pub_BusinessFileOID}&name=系统管理员&permission=${permissions}`  //"https://auth.pcm77.com/Office?fileID=0006684f-0000-0000-0000-000093ec6df3&name=系统管理员&permission=read"
			var url =
				`${localStorage.H7.H7_ThirdService}/Office/Index2?fileID=${curFile.Pub_BusinessFileOID}&permission=${permissions}&filePath=http://ddns.h7oa.com:81/${curFile.FilePath}&fileName=${curFile.FileName}&size=${curFile.FileSizeKb * 1024}&uid=${localStorage.UserOID}&uname=${localStorage.RealName}&source=${location.origin}&SharePermission=${accessRequirement}` //"https://auth.pcm77.com/Office?fileID=0006684f-0000-0000-0000-000093ec6df3&name=系统管理员&permission=read"
			var requestUrl = localStorage.H7_ThirdService + "v3/Other/CreateShortLink";
			// var requestUrl = "https://auth.pcm77.com/v3/Other/CreateShortLink";
			requestUrl += `?url=${encodeURIComponent(url)}&shareTime=${validity}`;
			if (mark) {
				requestUrl += "&pwd=" + mark;
			}

			$.ajax({
				url: requestUrl,
				type: 'GET',
				async: false,
				dataType: 'json',
				statusCode: {
					404: function() {
						layer.alert('page not found');
					},
				},
				success: function(res) {
					if (res.code == '200') { //成功
						var links =
							`${localStorage.H7_ThirdService}v3/Other/GotoLongLink?type=share&vcode=${res.data}`; // 生成短连接
						// var links = "https://auth.pcm77.com/v3/Other/GotoLongLink?type=share&vcode=" + res.data; // 生成短连接
						var content = (remark ? remark + "\n" : "") + "链接：" + links + "\n" + (
							mark && way ? "提取码：" + mark : "");
						iframeWin.document.getElementById("shareLink").value = content
						iframeWin.document.getElementById("linkDiv").style.removeProperty(
							"display");
						iframeWin.document.getElementById("remark").setAttribute("disabled",
							"disabled");
						iframeWin.document.querySelectorAll("input[type=radio]").forEach(
							function(e) {
								e.setAttribute("disabled", "disabled");
							});
						var mm = validity == "2h" ? 120 : validity == "12h" ? 720 : validity ==
							"1d" ? 1440 : validity == "7d" ? 10080 : validity == "30d" ? 43200 :
							0;
						var dateTime = new Date();
						var na = new Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
							'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
							'X', 'Y', 'Z');
						var random1 = Math.round(Math.random() * 25) + 0;
						var deadline = dateTime.setMinutes(dateTime.getMinutes() + mm) + '' +
							na[random1];
						// var json = {
						//     Pub_Share: [{
						//         tag: "add",
						//         tb: "Pub_Share",
						//         Pub_ShareOID: getRootTable().TimeToGuid(),
						//         BusinessKey: fileID,
						//         TableLX: tableName,
						//         Sharer: localStorage.EmployeeName,
						//         SharerFK: localStorage.UCML_UserOID,
						//         ShareTimeStamp: M_TimeStamp(),
						//         Prescription: mm,
						//         DeadlineTimeStamp: deadline,
						//         ShareTim: dateTime.toLocaleString(),
						//         DeadlineTime: new Date(dateTime.setMinutes(dateTime.getMinutes() + mm)).toLocaleString(),
						//         Permissions: permission,
						//         ShareContent: content,
						//         ShareLink: links,
						//         Extraction: mark
						//     }]
						// }
						// P_Ajax('', json, '', function (res) {
						//     console.log(res);
						// });
					} else {
						layer.alert(res.msg);
					}
				},
				error: function(res) {
					layer.alert("获取分享链接错误，请联系管理员！");
					clickCount--;
				}
			});
		}
	});
}
/** 面板协作 
 * @param {any} curConfig 附件配置
 * @param {any} curFile 附件信息
 */
export function panelCollaboration(curConfig, curFile) {
	curFile.panel = true
	//执行预览
	previewFile(curFile, curConfig)
}
/** 示范文本打开
 * @param {any} curConfig 附件配置
 * @param {any} curFile   附件信息
 */
export function stowageOpen(curConfig, curFile) {

	const path = curFile.FilePath
	const controlMap = curConfig.controlMap
	const jsonData = {
		"path": path,
		"controlMap": controlMap
	}
	P_Ajax('/api/sysOffice/FieldSetControlVal', jsonData, true, (res) => {
		if (res.code == "1000") {
			//执行预览
			previewFile(curFile, curConfig)
		}
	}, (err) => {
		console.log(err);
	})

}

// #endregion

/**
 * 文件对象转base64
 * @param {File} file 文件对象 
 * @returns base64字符串
 */
export function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
		reader.readAsDataURL(file);
	});
}

/** 将文件转为字节数组
 * @param file 
 */
export async function fileToByteArray(file) {
	const arrayBuffer = await file.arrayBuffer(); // 获取 ArrayBuffer
	const byteArray = new Uint8Array(arrayBuffer); // 转换为 Uint8Array
	return Array.from(byteArray);
}

/**
 * 解析Ofd文件
 * @param {Object} parsedData 
 */
export function handleFileParsed(parsedData) {

	// 将文件解析后的数据更新到 model 中
	function parseCustomDate(dateString) {
		const dateParts = dateString.match(/(\d{4})年(\d{2})月(\d{2})日/);
		if (dateParts) {
			const [_, year, month, day] = dateParts;
			return `${year}-${month}-${day}`; // 返回标准日期格式
		}
		return dateString; // 如果格式不匹配，返回原始字符串
	}
	this.model.InvoiceCode = parsedData.InvoiceCode //发票代码
	this.model.Certification = parseCustomDate(parsedData.IssueDate) //发票日期
	this.model.InvoiceNumber = parsedData.InvoiceNo //发票号码
	this.model.TaxRate = parsedData.TaxScheme.replace("%", ""); //税率
	this.model.Seller = parsedData.SellerName //销方
	this.model.TaxNumber_Seller = parsedData.SellerTaxID //销方税号
	this.model.Buyer = parsedData.BuyerName //买方
	this.model.TaxNumber_Buyer = parsedData.BuyerTaxID //买方税号
	this.model.ExcludingTax = parsedData.Price //金额
	this.model.Tax = parsedData.TaxTotalAmount //税额
	this.model.Total = parsedData.TaxInclusiveTotalAmount //税额合计
	this.model.IsElectron = true //全电发票

	//销方信息
	this.model.SellerInfo =
		`名称：${parsedData.SellerName}\n纳税人识别号：${parsedData.SellerTaxID}\n地址、电话：${parsedData.SellerAddrTel ?? ""}\n开户行及账号：${parsedData.SellerFinancialAccount ?? ""}`

	//购方信息
	this.model.BuyerInfo =
		`名称：${parsedData.BuyerName}\n纳税人识别号：${parsedData.BuyerTaxID}\n地址、电话：${parsedData.BuyerAddrTel ?? ""}\n开户行及账号：${parsedData.BuyerFinancialAccount ?? ""}`

	//备注
	this.model.Remark = parsedData.Note
}

/**
 * 解析自定义代码 (支持js代码、函数、箭头表达式)
 * @param {string} code  自定义代码
 * @param {Object} thisObj  组件实例对象
 */
export function ParseFuntionCode(code, ...param) {
	return code ? (function() {
		let cleanCode = "\n" + code + "\n"
		//判断是否是函数
		let isFunc = /^(async\s+)?function\s*\w*\s*\([^)]*\)\s*\{|\(?[\w\s,]*\)?\s*=>\s*(\{?.+\}?)$/.test(
			cleanCode.trim())
		let func = isFunc ? eval(`(${cleanCode})`) :
			eval(`(function(${(this?.['_paramLabel'] || []).join()}){${cleanCode}})`);
		return func.call((this), ...param)
	}).call((this)) : code
}

// #endregion 附件相关