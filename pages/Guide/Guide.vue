//App引导页
<template>
	<view class="flex-col page">
		<image class="self-center image" src="/static/Guide/yd1.png" />
		<text class="self-start text_2">多重收益</text>
		<view class="self-start section"></view>
		<text class="self-start text_3">智能定投，分散投资更安全</text>
		<view class="flex-row self-stretch divider">
			<view class="section_2"></view>
			<view class="section_3 ml-7"></view>
			<view class="section_2 ml-7"></view>
			<view class="section_2 ml-7"></view>
		</view>
		<button size="mini" type="primary" class="btnclass" hover-class="is-hover">跳&nbsp;过</button>
	</view>
</template>
<style scoped>
	.btnclass {
		color: #ffffff;
		backgroundColor: #1AAD19;
		borderColor: #1AAD19;
		margin-top: 25px;
		width: 80%;
		margin-left: 5%;
	}

	.flex-col {
		display: flex;
		flex-direction: column;
	}

	.page {
		padding: 36rpx 28rpx 362rpx 72rpx;
		background-color: #fff;
		width: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
	}

	.self-end {
		align-self: flex-end;
	}

	.text {
		color: #1a1a1a;
		font-size: 24rpx;
		font-family: SourceHanSansCN;
		line-height: 22.16rpx;
	}

	.self-center {
		align-self: center;
	}

	.image {
		margin-top: 208rpx;
		width: 542rpx;
		height: 630rpx;
	}

	.self-start {
		align-self: flex-start;
	}

	.text_2 {
		margin-top: 100rpx;
		color: #1a1a1a;
		font-size: 48rpx;
		font-family: SourceHanSansCN;
		line-height: 44.78rpx;
	}

	.section {
		margin-top: 32rpx;
		background-color: #ffc168;
		width: 29.5rpx;
		height: 5rpx;
	}

	.text_3 {
		margin-top: 32rpx;
		color: #1a1a1a;
		font-size: 28rpx;
		font-family: SourceHanSansCN;
		line-height: 26.82rpx;
	}

	.flex-row {
		display: flex;
		flex-direction: row;
	}

	.self-stretch {
		align-self: stretch;
	}

	.divider {
		margin-top: 112rpx;
	}

	.section_2 {
		background-color: #11a1ff4d;
		border-radius: 5rpx;
		width: 33rpx;
		height: 10rpx;
		margin-right: 5px;
	}

	.section_3 {
		background-color: #11a1ff;
		border-radius: 5rpx;
		width: 33rpx;
		height: 10rpx;
		margin-right: 5px;
	}

	.ml-70 {
		margin-left: 140rpx;
	}
</style>