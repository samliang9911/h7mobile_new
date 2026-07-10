<template>
	<view class="isignatureBox">
		<view class="isignatureHead">
			<image src="/static/qianming.gif" mode=""></image>
		</view>
		<view class="isignatureImageShow">
			<image style="width: 100%;" :src="signatureFile" mode=""></image>
		</view>
		<view class="isignatureBotton">
			<view @click="popupShow=!popupShow" class="isignatureBody">
				<text>签名设计</text>
			</view>
		</view>
		<up-popup :overlayStyle="{background: 'rgba(0, 0, 0, 0.2)'}" zoom closeOnClickOverlay :show="popupShow" mode="center" round="8">
			<view :style="{'width': windowWidth}">
				<canvasSignature @signature="signatureOn"></canvasSignature>
			</view>
		</up-popup>
	</view>
</template>

<script setup>
	import canvasSignature from '/components/canvasSignature/canvasSignature.vue';
	import {
		onLoad
	} from "@dcloudio/uni-app"
	import {
		ref
	} from "vue"
	let popupShow = ref(false);
	let windowWidth = ref('500rpx');
	let signatureFile = ref('');
	onLoad(() => {
		uni.getSystemInfo({
			success: (res) => {
				windowWidth.value = (res.windowWidth * 1.8) + 'rpx';
			}
		})
	})
	let signatureOn = (msg) => {
		popupShow.value = false;
		signatureFile.value = msg;
	}
</script>

<style lang="scss" scoped>
	.isignatureBox {
		width: 100%;

		.isignatureHead {
			width: 100%;

			image {
				width: 100%;
				height: 450rpx;
			}
		}

		.isignatureBotton {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			margin-bottom: 40rpx;

			.isignatureBody {
				width: 90%;
				margin: 0 5%;
				background-color: rgb(0, 122, 255);
				padding: 35rpx;
				border-radius: 16rpx;
				line-height: 35rpx;
				font-size: 35rpx;
				color: #fff;
				text-align: center;
			}
		}
	}
</style>
