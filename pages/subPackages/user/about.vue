<!-- 关于我们 -->
<template>
	<view class="container">
		<view
			style="width: 95%;margin: 0px auto;padding-top: 40rpx;padding-bottom: 10rpx;border-radius: 4rpx;padding-left: 20upx;padding-right: 20upx;"
			class="bg-white">
			<view style="width: 100%;text-align: center;margin-bottom: 50rpx;">
				<image src="https://www.pcm77.com/font/images/static/gzhr.png" style="width: 120rpx;height: 120rpx;" />
			</view>
			<!-- ifdef APP-PLUS -->
			<view style="text-align: center;">
				<view>H7移动项目管理</view>
				<view style="font-size: 22rpx;">Ver 1.0.0</view>
			</view>
			<!-- endif -->
			<!-- ifndef APP-PLUS -->
			<!-- <view style="padding: 10rpx 20rpx 0rpx;line-height: 60rpx;text-indent: 2em;">
				广州汇软信息科技有限公司成立于2005年，是一家专业从事计算机软件开发具有自主知识产权的管理软件，项目管理研究，集项目管理咨询，项目管理培训教育，销售与技术服务为一体的高科技专业公司。汇软拥有一批从事国家级项目管理研发；经验丰富的权威专家做咨询团队及坚实的技术支持
				；拥有接受国际先进项目管理技术培训的学者和丰富的实施经验。
				汇软科技作为中国工程行业领先的专业软件与咨询服务提供商，我们坚持“以客户需求为导向,以技术为本，以质量创品牌，开拓创新，高效协同”时刻敏锐洞悉国际先进技术的发展趋势，深入研究专业理论
			</view> -->
			<!-- endif -->
			<view class="bg-white"
				style="width: 100%;height: 400rpx;display: flex;align-items: center;justify-content: center;">
				<view style="width: 70%;height: 70%;">
					<image style="width: 210rpx; height: 210rpx;"
						src="https://www.pcm77.com/font/images/static/gzhrpcm.png" class="image" />
				</view>
			</view>
			<!-- ifdef APP-PLUS -->
			<view class="Agreement">
				<view style="background-color: #fff; text-align: center;padding: 6rpx 10rpx;">
					<!-- <view class="item">
						<view>个性化推荐</view>
						<view><up-switch size="40" v-model="push" :loading="pushChanging" @change="handlePushChange"></up-switch></view>
					</view> -->
					<view class="item" @tap="handleClickItem(index)" v-for="(item,index) in list" :key="index">
						<view>{{ item }}</view>
						<view><up-icon name="arrow-right"></up-icon></view>
					</view>
				</view>
			</view>
			<!-- endif -->
		</view>
		<view class="footer" style="height: 50rpx;text-align: center;font-size: 10px;">
			<view>
				<text>广州汇软信息科技有限公司</text>
			</view>
			<view>Copyright @ 2009-2020 GuangZhou</view>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return {
				push: true,
				pushChanging: false,
				list: ['隐私政策','使用条款','法律声明']
			}
		},
		onLoad() {
			const Boolean2 = uni.getStorageSync("Boolean2")
			if(Boolean2 === false){
				this.push = false
			}else{
				this.push = true
			}
		},
		methods: {
			handleClickItem(index){
				uni.navigateTo({
					url: './agreement?index=' + index
				})
			},
			handlePushChange(){
				this.pushChanging = true
				let json = {
					UCML_User: [{
						Boolean2: this.push,
						tag: "upd",
						tb: 'UCML_CONTACT',
						wh: "UCML_CONTACTOID='" + uni.getStorageSync('UCML_CONTACTOID') + "'"
					}]
				}
				this.$http_request(this, json, '', (res) => {
					if (res.data.code == 1000) {
						uni.setStorageSync("Boolean2",this.push)
					}
					this.pushChanging = false
				},(err)=>{
					this.pushChanging = false
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.container{
		padding-top: var(--status-bar-height);
	}
	.image {
		width: 75%;
		height: 350rpx;
		padding-left: 150rpx;
	}
	.Agreement{
		.item {
			padding: 20rpx 0;
			border-bottom: 1rpx solid #ccc;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			&:first-child{
				border-top: 1rpx solid #ccc;
			}
			&:active{
				background-color: #f0f0f0;
			}
		}
	}
	.footer{
		/* #ifdef APP-PLUS */
		width: 100%;
		text-align: center;
		position: absolute;
		bottom: 5%;
		/* #endif */
	}
</style>
