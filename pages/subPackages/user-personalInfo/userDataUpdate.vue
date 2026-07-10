<!-- 修改用户信息页面 -->
<template>
	<view class="layout-nickName bg-color-gradient2">
		<!-- <navigateBar-transparent #navBarName>修改</navigateBar-transparent> -->
		<topArea></topArea>
		<view class="content">
			<view class="title">
				<text>请输入您的{{title}}:</text>
			</view>
			<view class="inputRow">
				<input type="text" placeholder="请输入..." v-model="inputValue"
				:maxlength="key==='nickName' ? 15 :(key==='MobilePhone' ? 11 : (key==='Email'? 20 : 10))" />
				<up-icon name="close-circle-fill" size="15" class="clearIcon" v-if="showClearIcon" @click="clearIcon"></up-icon>
			</view>
			<view class="comment">
				<text>{{inputValueLength}}/{{iptLengthTotalValue}}</text>
			</view>			
		</view>
		<view class="confirmBtn">
			<button  type="primary" :disabled="isDisabled" @click="onConfirm">确定</button>
		</view>
		
		
		
	</view>
	
</template>

<script setup>
	import { onMounted, ref, watch, getCurrentInstance, onBeforeMount, computed } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import { http_request } from '/api/api.js';
	import { getUserJson } from '/api/Json.js';
	
	const inputValue = ref('')
	let inputValueLength = ref(0)
	const clearInputValue = ref('')
	const showClearIcon = ref(false);
	let oldValue = ''
	const { proxy } = getCurrentInstance();
	const key = ref('')
	const title = ref('')
	const isDisabled = ref(true)
	const iptLengthTotalValue = ref(0)
	
	onLoad((e)=>{
		key.value = e.key
		title.value = e.title
		console.log("key: ",key.value)
		inputLengthTotal();
	})
	
	onBeforeMount(()=>{
		const inputOldValue = uni.getStorageSync(key.value)
		oldValue = inputOldValue
		console.log("inputOldValue: ",inputOldValue)
		if (inputOldValue) {
			inputValue.value = inputOldValue
		}else ''
	})	
	
	watch(inputValue, (newValue)=>{
		inputValue.value = newValue
		isDisabled.value = newValue === oldValue
		inputValueLength.value = newValue.length
		if (inputValueLength.value>0){
			showClearIcon.value = true;
		}else
			showClearIcon.value = false;
	})
	
	
	const onConfirm = ()=>{
		uni.showLoading({
			title:"更新中...",
			mask: true
		})
		
		//网络请求
		// const updateUserData = async ()=>{
		// 	let res = await http_request(proxy, {json:getUserJson()})
		// 	console.log("res: ",res)
		// }
		
		uni.setStorageSync(key.value, inputValue.value)		
		uni.$emit("updateKeyName",{keyName:key.value})
		uni.$emit("updateKeyValue",{keyValue:inputValue.value})
		uni.hideLoading()
		 setTimeout( ()=>{
			uni.navigateBack({
				delta:1
			});
		},500)	
	}
	
	const clearIcon = ()=>{
		inputValue.value = '';
		showClearIcon.value = false;
	}
	
	const inputLengthTotal = ()=>{
		if (key.value==='nickName'){
			iptLengthTotalValue.value = 15;
		}else if (key.value==='Email'){
			iptLengthTotalValue.value = 20;
		}else if (key.value==='MobilePhone'){
			iptLengthTotalValue.value = 11;
		}else {
			iptLengthTotalValue.value = 10;
		}
		console.log("keyValue: ",key.value)
		console.log("iptLengthTotalValue: ",iptLengthTotalValue.value)
	}
</script>

<style lang="scss" scoped>
	@import '../../../common/style/commonStyle.css';
	
	.content{
		padding: 50rpx 25rpx;
		.title{
			padding-bottom: 10rpx;
			text{
				font-size: 28rpx;
				color: $row-icon-color;
			}
		}	
		.inputRow{
			height: 90rpx;
			padding: 25rpx 15rpx 25rpx 25rpx;
			border-radius: 10rpx;
			background-color: $bg-color-lightGrey;
			border: 1rpx solid #fff;
			display: flex;
			align-items: center;
			justify-content: space-between;
			.clearIcon{
				padding: 10rpx;
			}
		}
		.comment{
			padding-top: 10rpx;
			text{
				font-size: 24rpx;
				color: $row-icon-color;
			}
		}		
	}
	
	.confirmBtn{		
		display: flex;
		justify-content: center;
		button{
			width: 300rpx;
			height: 60rpx;
			font-size: 30rpx;
			border-radius: 50rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

</style>