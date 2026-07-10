<!-- 个人信息 -->
<template>
	<view class="layOut bg-color-gradient2">
		<topArea></topArea>
		<!-- <view class="backgroundImage">
			<image src="/static/user-image/sea.jpg" mode="aspectFill"></image>
		</view> -->
		
		<view class="headInfo">
			<view class="avatar">
				<image :src="photoPath[0]" mode="aspectFit" @click="navToEdit('HeadPhoto','头像')"></image>
			</view>
			<view class="nickName">
				<text>{{nickNameStorage}}</text>
			</view>
		</view>
		
		<!-- 昵称 -->
		<view class="section2">
			<view class="row" v-for="(item,key,index) in userNameList" :key="index" @click="navToEdit(key,item.infoTitle)">
				<view class="left">
					<text class="text">{{item.infoTitle}}</text>
				</view>
				<view class="middle">
					<text class="text" :class="{ 'textGrey': !item.infoValue, 'textBlack': item.infoValue}">
					{{item.infoValue ==='' ? '未设置' : item.infoValue}} 
					</text>
				</view>
				<view class="right">
					<up-icon name="arrow-right" color="#aaa"></up-icon>
				</view>
			</view>	
		</view>
		
		<!-- 性别、日期 -->		
		<view class="section2">			
			<view class="row" v-for="(item,key,index) in userSexList" :key="index" @click="getKey(key)">
				<view class="left">
					<text class="text">{{item.infoTitle}}</text>
				</view>
				<view class="middle">
					<picker :mode="key==='Sex'? 'selector': (key==='Birthday' ? 'date':'')"
					:range="sexList" range-key="name" :value="sexIndex" @change="changeSex">
						<text class="text" :class="{ 'textGrey': !item.infoValue, 'textBlack': item.infoValue}">
						{{item.infoValue ==='' ? '未设置' : item.infoValue}}
						</text>
					</picker>
					
				</view>
				<view class="right">
					<up-icon name="arrow-right" color="#aaa"></up-icon>
				</view>
			</view>	
		</view>	
		
		<!-- 单位 -->
		<view class="section2">
			<view class="row"  v-for="(item,key,index) in userUnitList" :key="index" @click="navToEdit(key,item.infoTitle)">
				<view class="left">
					<text class="text">{{item.infoTitle}}</text>
				</view>
				<view class="middle">
					<text class="text" :class="{ 'textGrey': !item.infoValue, 'textBlack': item.infoValue}">
					{{item.infoValue ==='' ? '未设置' : item.infoValue}} 
					</text>
				</view>
				<view class="right">
					<up-icon name="arrow-right" color="#aaa"></up-icon>
				</view>
			</view>	
		</view>	
		
		
		
	</view>
	
	
</template>

<script setup>
	import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import { userHeadPhoto, userNameList, userSexList, userUnitList } from '../../index/userdata'; 
	import { http_request } from '../../../api/api';
	
	//性别选择器列表	
	let photoPath = ref([userHeadPhoto.value.HeadPhoto.infoValue])
	let nickNameStorage = ref(userNameList.value.nickName.infoValue)
	let sexShow = ref(false)
	let sexIndex = ref(0)
	let rowKey = ''
	const sexList = ref([
		{name:"男"},
		{name:"女"}
	])
	
	onMounted(()=>{		
		const keys = [...Object.keys(userNameList.value),...Object.keys(userSexList.value),...Object.keys(userUnitList.value)]
		keys.forEach((e)=>{
			const storageInfoValue = uni.getStorageSync(e)
			// const nickNameStorage = ref(uni.getStorageSync('nickName'))
			//从本地渲染页面数据
			if (storageInfoValue && userHeadPhoto.value[e] ){
				userHeadPhoto.value[e].infoValue = storageInfoValue;
			}else if (storageInfoValue && userNameList.value[e] ){
				userNameList.value[e].infoValue = storageInfoValue;
			}else if (storageInfoValue && userSexList.value[e] ){
				userSexList.value[e].infoValue = storageInfoValue;
			}else if (storageInfoValue && userUnitList.value[e] ){				
				userUnitList.value[e].infoValue = storageInfoValue;
			}else {
			}
			nickNameStorage.value = userNameList.value.nickName.infoValue
			
			//监听修改页面返回的数据并赋值		
			uni.$on("updateKeyName",(msg)=>{
				if (e = msg.keyName) {					
					uni.$on("updateKeyValue",(msg)=>{
						const newInfoValue = msg.keyValue;
						if (userNameList.value[e] ){
							userNameList.value[e].infoValue = newInfoValue;
						}else if (userSexList.value[e] ){
							userSexList.value[e].infoValue = newInfoValue;
						}else if (userUnitList.value[e] ){				
							userUnitList.value[e].infoValue = newInfoValue;
						}else {
							
						}
						nickNameStorage.value = userNameList.value.nickName.infoValue;
					})
				}else {}				
			})		
		})
	})
	
	onUnmounted(()=>{
		uni.$off("updateKeyName");
	})
	const navToEdit = (key,title)=>{
		if (key === 'HeadPhoto'){
			console.log("keyppp:",key)
			uni.chooseImage({
				count:1,
				sourceType:'album',
				success: (res) => {
					console.log("头像：",res)
					// http_request();
					photoPath.value = res.tempFilePaths;
					uni.setStorageSync(key,photoPath.value);
					console.log("photoPath后: ",photoPath.value)
				}
			})
		}else if (key) {
			jump('userDataUpdate',key,title);
		}
	}
	// const previewImage = ()=>{
	// 	uni.previewImage({
	// 		urls:photoPath.value[0]
	// 	})
	// }
	const jump = (pageName,key,title) => {
		/**跳转 */
		uni.navigateTo({
			url: `../user-personalInfo/${pageName}?key=${key}&title=${title}`
		});
	}
	
	
	
	//获取行的键名
	const getKey = (key)=>{
		rowKey = key		
	}
	const changeSex = (e)=>{
		console.log("e:",e.detail.value)
		if (rowKey==="Sex"){
			sexIndex.value = e.detail.value
			userSexList.value[rowKey].infoValue = sexList.value[sexIndex.value].name
		}else if (rowKey==="Birthday"){				
			userSexList.value[rowKey].infoValue = e.detail.value
		}
		let pickerValue = userSexList.value[rowKey].infoValue
		uni.setStorageSync(rowKey,pickerValue)
	}
	
</script>

<style lang="scss" scoped>
	@import '../../../common/style/commonStyle.css';
	// .layOut{
	// 		min-height: 100vh;
	// 		background-color: rgb(250, 250, 250);
	// 	}	
	.textBlack{
		color: #111;
	}
	.textGrey{
		color: #aaa;
	}
	
	.headInfo{
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding: 40rpx 0 30rpx 0;
			.avatar{
				width: 180rpx;
				height: 180rpx;
				border-radius: 50%;
				overflow: hidden;
				image{
					width: 100%;
					height: 100%;
				}
			}
			.nickName{
				font-size: 38rpx;
				padding: 10rpx 0;
			}			
		}
	
	.section2{
		width: 700rpx;
		height: auto;
		border: 1rpx solid #eee;
		border-radius: 25rpx;
		// box-shadow: 0 0 20rpx rgba(0,0,0,0.5);
		background-color: #fff;
		margin: 25rpx 25rpx 0 25rpx ;
		.row{
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 30rpx;
			height: 100rpx;
			border-bottom: 1rpx solid #eee;
			&{
				.row:last-child{border-bottom: 0;}
			}
			.left{
				flex: 3;
				.text{
					color: $row-text-color;
				}
			}
			.middle{
				flex: 7;
				.text{
					// color: #aaa;				
				}
				image{
					width: 100rpx;
					height: 100rpx;
					border-radius: 10rpx;
					margin-top: 9rpx;
				}
			}
			.right{
			}
			
		}
		
	}
	
	
	.sexPicker{
		width: 300rpx;
		height: 200rpx;
		border: 1rpx solid red;
	}
</style>