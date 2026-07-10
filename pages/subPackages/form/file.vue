<template>
	<view class="contentBox">

		<view v-for="(item,index) in fileList" :key="index">
			<view class="bodyBox" v-for="(childItem,idx) in item" :key="idx"
				@click="fuBtn(childItem.FilePath,childItem.FileType,childItem.PersonName,childItem.FileSize,item,childItem)">
				<view class="fileImage">
					<img style="width: 96rpx;height: 96rpx;" :src="switchIcon(childItem.FileType)" />
				</view>

				<view class="fileListBox">
					<view class="fileName">
						<text>{{childItem.FileName}}</text>
					</view>
					<view style="direction: rtl;">
						<text :style="'background: radial-gradient('+startUserImage().colour+'52, #cc1b1b00);'"
							style="margin-right: 20rpx;">{{childItem.FileType==='jpg'|| childItem.FileType==='JPG'|| childItem.FileType==='png'|| childItem.FileType==='PNG'|| childItem.FileType==='gif'|| childItem.FileType==='GiF'? '图片' : childItem.FileType==='VIDEO' || childItem.FileType==='mp4'?'影视':'文档文件'}}</text>
					</view>
					<view class="fileTime">
						<view>
							<text>{{childItem.PersonName}}</text>
						</view>
						<view style="margin-right: 20rpx;">
							<text>{{childItem.SYS_Created}}</text>
						</view>
					</view>
					
				</view>
			</view>
		</view>
		<view v-if="fileList.length > 0 ? false :true"
			style="width: 820rpx;height: 800rpx;display: flex;justify-content: center;align-items: center;">
			<up-empty icon-color="#333333" color="#333333" :text="errText" mode="list"></up-empty>
		</view>
		<view @tap="showVideoFunc"
			:style="showVideo ? 'position: fixed;display: flex;align-items: center; justify-content: center; fixed;width: 100%;height: 100%;background-color: #333333b4;z-index: 130;top: 0;' : 'display:none;'">
			<view style="width: 100%;" @tap.stop>
				<video id="myVideo" style="width: 100%;z-index: 131;" :direction="90" :autoplay="true" :src="videoSrc"
					@pause=""></video>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import {ref, onMounted, computed, onUnmounted} from "vue";
	import {fileUrl, startUserImage, getloc} from "@/utils/instrumentType.js";
	
	interface Props {
		fileList: Array < any > ,
		naviBtnShow: Number,
		isEdit: Array < any > ,
		nodeID: String
	};
	
	const props = withDefaults(defineProps < Props > (), {
		fileList: () => [],
		naviBtnShow: () => 2,
		isEdit: () => [],
		nodeID: () => ""
	});
	
	let videoSrc = ref();
	let showVideo = ref(false);
	let videoContext = null; //视频标签指向
	let fileIconList = ref({
		jpg: 'https://pcm77.com/font/images/img_fileType/JPG.png',
		jpeg: 'https://pcm77.com/font/images/img_fileType/JPG.png',
		png: 'https://pcm77.com/font/images/img_fileType/PNG.png',
		gif: 'https://pcm77.com/font/images/img_fileType/GIF.png',
		txt: 'https://pcm77.com/font/images/img_fileType/TET.png',
		xlsx: 'https://pcm77.com/font/images/img_fileType/ECEL.png',
		pdf: 'https://pcm77.com/font/images/img_fileType/PDF.png',
		ppt: 'https://pcm77.com/font/images/img_fileType/PPT.png',
		pptx: 'https://pcm77.com/font/images/img_fileType/PPT.png',
		docx: 'https://pcm77.com/font/images/img_fileType/WORD.png',
		doc: 'https://pcm77.com/font/images/img_fileType/WORD.png',
		zip: 'https://pcm77.com/font/images/img_fileType/ZIP.png',
		video: 'https://pcm77.com/font/images/img_fileType/VIDEO.png',
		mp4: 'https://pcm77.com/font/images/img_fileType/VIDEO.png',
		xls: 'https://pcm77.com/font/images/img_fileType/ECEL.png',
	});
	let errText = ref('没有文件');
	
	let filterFileList = computed(()=>{
		if(props.fileList.length === 0){
			return props.fileList
		}
		else {
			if(Object.prototype.toString.call(props.fileList[0]) === '[object Array]') return props.fileList
			else if(Object.prototype.toString.call(props.fileList[0]) === '[object Object]') return [props.fileList]
			else return []
		}
	});
	
	
	onMounted(() => {
		videoContext = uni.createVideoContext('myVideo'); //创建视频实例指向video
	});

  function fuBtn(...args){
    const {FilePath,FileType,FileName,Pub_BusinessFileOID,FileSize} = args[5]
    const store = {
      H7_Xmind:['xmind'],
      H7_Markdown:['md', 'markdown', 'txt', 'mkd', 'mdown', 'mkdn'],
      H7_Office:['pdf', 'ofd', 'doc', 'docx', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'et']
    }
    let keyStr;
    for(let key in store){
      if(store[key].includes(FileType)){
        keyStr = key
        break
      }
    }
    const origin = uni.getStorageSync('serverUrl')+'/'

    const params = JSON.stringify({
      _action: uni.getStorageSync(keyStr),
      urlLink: origin + FilePath,
      "fileName": FileName,				                    //文件名称
      "filePath": origin + FilePath,                  //文件路径
      "uid": uni.getStorageSync('UserOID'),           //登录用户ID
      "uname": uni.getStorageSync('RealName'),	      //登录用户名称
      "fileID": Pub_BusinessFileOID,					        //文件ID
      "size": FileSize,					                      //文件大小 单位 B 字节 
      "permission": 'write',			                    //权限 read 预览 write 编辑
      "source": origin,                               // 文件来源
      "panel": false,                                 //OnlyOffice 模板预览
      "tb": '',                                       //业务表名
      "version":  0,                                  //版本号
    })
    // console.log(args[5]);
    const demo = JSON.stringify({
      _action: uni.getStorageSync(keyStr),
      urlLink: origin + FilePath,
      "fileName": "物料统计.xlsx",
      "filePath": origin+"File/Business/202507/d6d0369c-17e9-4708-aa48-739a46492df6.xlsx",
      "uid": "00000000-0000-0000-0000-000000000001",
      "uname": "超级管理员",
      "fileID": "d6d0369c-17e9-4708-aa48-739a46492df6",
      "size": 8622.08,
      "permission": "write",
      "source": origin,
      "panel": false,
      "tb": "Pub_BusinessFile",
      "version": 0
    })
    uni.navigateTo({
      url: `/pages/subPackages/form/accessory?params=${params}`
    })
  }
	let switchIcon = (type: string) => {
		// type = type.toLowerCase();
		switch (type) {
			case 'jpg':
				return fileIconList.value.jpg;
				// break;
			case 'jpeg':
				return fileIconList.value.jpg;
				// break;
			case 'png':
				return fileIconList.value.png;
				// break;
			case 'gif':
				return fileIconList.value.gif;
				// break;
			case 'txt':
				return fileIconList.value.txt;
				// break;
			case 'xlsx':
				return fileIconList.value.xlsx;
				// break;
			case 'xls':
				return fileIconList.value.xlsx;
				// break;
			case 'pdf':
				return fileIconList.value.pdf;
				// break;
			case 'ppt':
				return fileIconList.value.ppt;
				// break;
			case 'pptx':
				return fileIconList.value.ppt;
				// break;
			case 'docx':
				return fileIconList.value.docx;
				// break;
			case 'doc':
				return fileIconList.value.docx;
				// break;
			case 'mp4':
				return fileIconList.value.mp4;
				// break;
			case 'zip':
				return fileIconList.value.zip;
				// break;
			case 'video':
				return fileIconList.value.video;
				// break;
			default:
				return fileIconList.value.txt;
				// break;

		}
	};
	/**
	 * @param {String} url 链接
	 * @param {String} type 类型
	 * @param {String} name 创建人
	 * @param {String} fileSize 文件大小
	 * @param {Object} childItem URL参数 
	 * 
	 * childItem对象key为permission 
	 * 表单状态为 1 和 3 可以编辑
	 */
	let fuBtns = (url: string, type: string, name: string, fileSize: any, item: any, childItem: any) => {
		// console.log("file里的 fileList",props.fileList)
		// console.log("fileURL",url)
		
		type = type.toLowerCase();
		childItem.UserName = uni.getStorageSync("UserName"); //登录人名称
		childItem.UserOID = uni.getStorageSync("UserOID"); //当前登录人OID
		
		//office
		if (['pdf', 'ofd', 'doc', 'docx', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'et'].includes(type)) {
		    let Type = "Office";
			let panel = 'false'; //面板是否启用
			let permission = 'write';
			// const globalStore = useGlobalStoreHook();
			const PrimaryKey = childItem.tableName ? childItem.tableName + 'OID' : '';
			const OID = childItem[PrimaryKey];
			const serverUrl = uni.getStorageSync("serverUrl");
			const H7_TypeUrl = uni.getStorageSync("H7_Office");
			
			fileSize = childItem.FileSizeKb * 1024;
			childItem.FileSize = parseFloat(childItem.FileSize);
			
			const jsonData = {
			  "fileName": childItem.FileName,				                    //文件名称
			  "filePath": childItem.FilePath,         //文件路径
			  // "filePath": "http://pcm.tpddns.cn:81" + childItem.FilePath,    //公网文件路径 方便测试
			  "uid": childItem.UserOID,	                    //登录用户ID
			  "uname": childItem.UserName,	                  //登录用户名称
			  "fileID": OID ? OID : childItem.Key,					            //文件ID
			  "size": fileSize,					                        //文件大小 单位 B 字节 
			  "permission": permission,			                    //权限 read 预览 write 编辑
			  "source": serverUrl,                     // 文件来源
			  "panel": panel,                                //OnlyOffice 模板预览
			  "tb": childItem.tableName //业务表名
			};
			
			showFile(Type,jsonData,H7_TypeUrl);
			console.log("file的jsonData",jsonData)
			
		} else if (['jpg','jpeg','png','gif'].includes(type)){
			showImgae(url);
			
		} else if (['video','mp4'].includes(type)){
			watchVideos(url);
			
		}else if (['md', 'markdown', 'txt', 'mkd', 'mdown', 'mkdn'].includes(type)) {
			// Markdown文件
			let Type = "Markdown";
			const H7_TypeUrl = uni.getStorageSync("H7_Markdown");
			const jsonData = {
				"urlLink": childItem.FilePath
			};
			showFile(Type,jsonData,H7_TypeUrl);
			
		}else if (['xmind'].includes(type)){
			//xmind文件
			let Type = "Xmind";
			const H7_TypeUrl = uni.getStorageSync("H7_Xmind");
			const jsonData = {
				"filePath": uni.getStorageSync('serverUrl')+'/'+childItem.FilePath,
        "urlLink":uni.getStorageSync('serverUrl')+'/'+childItem.FilePath
			};
			showFile(Type,jsonData,H7_TypeUrl);
		};
	};
	
	let downLoadFile = (url) => {
		// #ifdef MP
		uni.downloadFile({
			url: url,
			success: (data) => {
				if (data.statusCode === 200) {
					uni.saveFile({
						tempFilePath: data.tempFilePath, //临时路径
						success: (res) => {
							uni.showToast({
								icon: 'none',
								mask: true,
								title: '文件已保存：' + res.savedFilePath, //保存路径
								duration: 3000,
							});
						},
						fail: (err) => {
							uni.showToast({
								icon: 'none',
								mask: true,
								title: '失败请重新下载',
							});
						},
					})
				}
			}
		})
		// #endif
		// #ifdef H5
		let dload = document.createElement("a");
		dload.download = ''; // 设置下载的文件名，默认是'下载'
		dload.href = url;
		document.body.appendChild(dload);
		dload.click();
		dload.remove(); // 下载之后把创建的元素删除
		uni.showToast({
			title: "正在下载",
			icon: "success"

		});
		// #endif
	};
	let showImgae = (url) => //显示图片
		{
			let imgArr = [];
			imgArr.push(url);
			uni.previewImage({
				urls: imgArr,
				current: imgArr[0]
			})
		};
	let watchVideos = (url) => { //显示视频
		videoSrc.value = url;
		showVideo.value = true;
		videoContext.play(); //播放
	}
	let showFile = (type,jsonData,H7_TypeUrl) => //显示文件
		{
			jsonData = JSON.stringify(jsonData);
      uni.navigateTo({
				url: `/pages/subPackages/form/accessory?type=${type}&jsonData=${jsonData}&H7_TypeUrl=${H7_TypeUrl}`
			})
			// uni.navigateTo({
			// 	url: `./accessory?type=${type}&jsonData=${jsonData}&H7_TypeUrl=${H7_TypeUrl}`
			// })
		};
	let showVideoFunc = () => {
		showVideo.value = !showVideo.value;
		videoContext.pause(); //暂停
	}
</script>

<style lang="scss" scoped>
	.contentBox {
		width: 100%;
		.bodyBox {
			padding: 15rpx 15rpx 0rpx 15rpx;
			display: flex;
			align-items: center;
			justify-content: center;
      width:100%;
      border-bottom:1rpx solid #bdbdbd;
			.fileImage {
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.fileListBox {
				width: 100%;
				display: flex;
				// margin: 0 3%;
				margin-left: 35rpx;
				flex-direction: column;
				justify-content: center;
				// justify-content: space-between;

				.fileName {
					color: #282828;
					margin-top: 15rpx;
					font-size: 30rpx;
					word-break: break-all;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					/* 这里是超出几行省略 */
					-webkit-line-clamp: 2;
					overflow: hidden;
					letter-spacing: 5rpx;
					line-height: 40rpx;
				}
			}

			.fileTime {
				display: flex;
				height: 20%;
				margin-top: 10rpx;
				// margin-left: 28%;
				justify-content: space-between;
				color: #9fa0a0;
			}
		}

	}
</style>
