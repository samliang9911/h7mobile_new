<!-- 我的页面 -->
<template>
	<view class="layout">			
		<navigateBar-user :moreServices="moreServices" :setting="setting"></navigateBar-user>
		<!-- <topArea></topArea> -->
		<view class="headSection">
			<view class="userInfo">
				<view class="headPortrait">
					<image @click="headPortrait"  src="/static/108.png" mode="aspectFit" class="iamgeUser"></image>
				</view>
				
				<view class="headName">
					<text class="headText" decode="true">{{nickName}}</text>
					<view class="userName">
						<text class="headText2" decode="true">账号名: {{userName}}</text>
					</view>
				</view>
				
			</view>
			<view class="other">
				<view class="otherContent">
					<text class="otherTitle">模块A</text>
					<text class="otherComment">备注1</text>
				</view>
				<view class="otherContent">
					<text class="otherTitle">模块B</text>
					<text class="otherComment">备注2</text>
				</view>
				<view class="otherContent">
					<text class="otherTitle">模块C</text>
					<text class="otherComment">备注3</text>
				</view>
			</view>
		</view>
		
		
		<view class="section1">
			<!-- <view class="setionTitle1">
				<text decode="true" class="textTitle1">我的业务</text>
			</view> -->
			
			<view class="sectionContent1">
				<view class="content1"  @click="waitDone">
					<image src="/static/user-image/waitDone.png" mode="aspectFit"  ></image>
					<text decode="true" class="text1">待办</text>
				</view>
				
				<view class="content1" @click="haveDone">
					<image src="/static/user-image/haveDone.png" mode="aspectFit"  ></image>
					<text decode="true" class="text1">已办</text>
				</view>
				<view class="content1" @click="waitRead">
					<image src="/static/user-image/waitRead.png" mode="aspectFit"  ></image>
					<text decode="true" class="text1">待阅</text>
				</view>
				<view class="content1"  @click="haveRead">
					<image src="/static/user-image/haveRead.png" mode="aspectFit" style="width:65rpx;height: 65rpx;" ></image>
					<text decode="true" class="text1">已阅</text>
				</view>				
			</view>
		</view>
		
		<view class="section1">			
			<view class="sectionContent1">
				<view class="content1"  @click="collect">
					<image src="/static/user-image/star.png" mode="aspectFit" style="width:65rpx;height: 65rpx;" ></image>
					<text decode="true" class="text1">收藏</text>
				</view>
				
				<view class="content1" @click="myShare">
					<image src="/static/user-image/share.png" mode="aspectFit" style="width:65rpx;height: 65rpx;" ></image>
					<text decode="true" class="text1">我分享的</text>
				</view>
				<view class="content1" @click="shareMine">
					<image src="/static/user-image/shareMine.png" mode="aspectFit" style="width:65rpx;height: 65rpx;" ></image>
					<text decode="true" class="text1">分享我的</text>
				</view>
				<view class="content1"  @click="haveRead">
					<image src="/static/user-image/haveRead.png" mode="aspectFit"  ></image>
					<text decode="true" class="text1">已阅</text>
				</view>				
			</view>
		</view>
		
		<view class="section2">
			<view class="row" v-for="(item,index) in userDataList" :key="item.ID" @click="navToClick(item.ID)" :class="{'lastChild': index===userDataList.length-2}">
				<view class="left">
					<up-icon :name="item.iconName" size="35rpx" color="#111"></up-icon>
					<view class="text">{{item.textName}}</view>
				</view>
				<view class="right">
					<up-icon name="arrow-right" color="#aaa"></up-icon>
				</view>
			</view>	
		</view>		
					
	</view>	
</template>

<script setup>
	import {onMounted, ref} from 'vue';
	import { userDataList } from './userdata.js';
	
	const nickName = ref('')
	const userName = ref('')
	
	onMounted(()=>{
		nickName.value = uni.getStorageSync("nickName")
		userName.value = uni.getStorageSync("UserName")
	})
	
	/***个人信息导航点入中心* PersonalInfo:个人信息* message:消息 * contact:联系人* ...顺序排列 * */
	const navToClick = (ID) => {
		if (ID === "personalInfo") {
			jump('personalInfo');
		} else if (ID === "signature") {
			jump('signature');
		} else if (ID === "about") {
			jump('about');
		} else if (ID === "quit") {
			let oldServerUrl = uni.getStorageSync('serverUrl');
			uni.clearStorageSync();
			uni.setStorageSync('serverUrl', oldServerUrl);
			uni.reLaunch({
				url: '../login/login'
			})
		}
	};
	const jump = (pageName) => {
		/**跳转 */
		uni.navigateTo({
			url: `../subPackages/user/${pageName}`
		});
	}
	
	const moreServices = ref(()=>{
		
	})
	
	const setting = ref(()=>{
		
	})
	
	const headPortrait = ()=>{
		
	}
	
	//待办
	const waitDone = ()=>{
		
	}
	const haveDone = ()=>{
		
	}
	const waitRead = ()=>{
		
	}
	const haveRead = ()=>{
		
	}
	
	//分享和收藏
	const collect = ()=>{
		
	}
	const myShare = ()=>{
		
	}
	const shareMine = ()=>{
		
	}
	
</script>

<style lang="scss" scoped>
	// @import '../../common/style/commonStyle.css';
	.layout{
		background-color: $bg-color-lightGrey;
		min-height: calc(100vh - 50px);		
	}
	text{
		letter-spacing: 2rpx;
	}
	
	.headSection{
		width: 690rpx;
		height: auto;
		padding: 30rpx;
		margin: 0rpx 30rpx ;
		
		// background-color: rgb(255, 226, 150);
		// background: linear-gradient(to right, #bbfff1,rgba(183, 234, 255, 1));
		background: 
			radial-gradient(50% 70% at top left, #bbfff1, transparent),
			radial-gradient(50% 60% at bottom right, #D6A2E8,rgba(183, 234, 255, 1));
			
		border: 1rpx solid rgba(240, 240, 240, 0.9);
		border: 1rpx solid #eee;
		border-radius: 25rpx;
		box-sizing: border-box;
		.userInfo{
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			.headPortrait{
				width: 100rpx;
				height: 100rpx;
				// border: 5rpx solid #eee;
				border-radius: 50%;
				overflow: hidden;
				.iamgeUser{				
					width: 100%;
					height: 100%;				
				}
			}
			.headName{
				// width: auto;
				.headText{
					font-size: 30rpx;
					color: #0c0c0c;
					padding: 0 20rpx;
					box-sizing: border-box;
					display: block;
					
				}
				.userName{
					width: auto;
					height: 40rpx;
					// background-color: rgba(83, 83, 83, 0.5);
					// border-radius: 50rpx;
					.headText2{						
						font-size: 22rpx;
						color: #555;
						padding: 0 20rpx;
						box-sizing: border-box;						
					}
				}				
			}			
		}
		.other{
			width: 100%;
			height: 80rpx;
			margin-top: 30rpx;
			display: flex;
			justify-content: space-between;
			// border: 1rpx solid red;
			.otherContent{
				// flex-direction: column;
				
				.otherTitle{
					display: block;
					font-size: 30rpx;
					color: #0c0c0c;
				}
				.otherComment{
					display: block;
					font-size: 22rpx;
					color: #555;
				}
			}
		}
	}
	
	
	.section1{
		width: 690rpx;
		height: auto;
		margin: 18rpx 30rpx 0 30rpx ;
		background-color: #fff;
		border: 1rpx solid rgba(240, 240, 240, 0.9);
		border-radius: 25rpx;
		// box-shadow: 1rpx 1rpx rgba(0, 0, 5, 0.5);
		// .setionTitle1{
		// 	padding: 25rpx;
		// 	.textTitle1{
		// 		font-size: 30rpx;				
		// 	}
		// }
		.sectionContent1{
			display: flex;
			justify-content: center;
			align-items: center;
			padding:20rpx 0rpx;
			.content1{	
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				width: 120rpx;
				height: 120rpx;
				margin: auto;				
				image{
					width: 70rpx;
					height: 70rpx;
				}
				.text1{
					display: block;
					font-size: 23rpx;
					color: #666;
					padding-top: 10rpx;
				}	
				
			}
			
		}
	}
	
	.section2{
		width: 690rpx;
		margin: 20rpx 30rpx 0 30rpx ;
		border: 1rpx solid rgba(240, 240, 240, 0.9);
		border-radius: 25rpx;
		background-color: #fff;
		.row{
			display: flex;
			justify-content: space-between;
			padding: 25rpx 30rpx;
			height: auto;
			align-items: center;
			// border-bottom: 1rpx solid #eee;
			position: relative;			
			.left{
				display: flex;					
				align-items: center;
				.text{
					margin-left: 25rpx;
					color: #111111;
				}
			}
			.right{
				display: flex;
				align-items: center;
			}
		}
		.row:first-child{
			padding-top: 30rpx;
		}
		.row:last-child{
			padding-bottom: 30rpx;
		}		
		// .lastChild{
		// 	border-bottom: 0rpx;
		// }
		
	}
</style>
