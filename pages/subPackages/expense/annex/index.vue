<template>
	<view class="annex">
		<up-empty v-if="!data.length" icon-color="#333333" color="#333333" text="没有文件" mode="list" />
		<template v-else>
			<view v-for="box in data">
				<view class="title">{{ box.title }}</view>
				<view class="item" v-for="(item,index) in box.annex" @click="open(item)">
					<template v-if="defer(index)">
						<image :src="`https://pcm77.com/font/images/img_fileType/${png(item.FileType)}.png`" />
						<view>
							<view>{{ item.FileName }}</view>
							<view class="state">
								<text>{{ state[item.FileType] }}</text>
							</view>
							<view class="user-date">
								<text>{{ item.PersonName }}</text>
								<text>{{ item.SYS_Created }}</text>
							</view>
						</view>
					</template>
				</view>
			</view>
		</template>
		<view class="video" v-if="videoPath">
			<view class="close">
				<view @click="videoPath=null">
					<up-icon name="close" color="#b8b8b8" size="30" />
					<view />
				</view>
			</view>
			<video :src="videoPath" controls></video>
		</view>
	</view>
</template>
<script setup lang="ts">
	import { ref } from 'vue'
	import { useDefer } from '/utils/index'
	import { getComponent } from '@/api/autopage/index.ts'
	import { previewFile } from '@/pages/subPackages/expense/annex/fileView.js'

	const videoPath = ref<null | string>(null)
/* 	const data = defineModel<{
		title : string
		annex : {
			guid : string
			name : string
			path : string
			type : string
			user : string
			date : string
		}[]
	}[]>({ default: [] }) */
	const data = defineModel<{}[]>({ default: [] })
	const defer = useDefer(data.value.reduce((a, b) => a += b.annex.length, 0))
	const category = [
		['png', ['jpg', 'jpeg']],
		['ecel', ['xlsx', 'xls']],
		['ppt', ['ppt', 'pptx']],
		['word', ['docx', 'doc']],
		['video', ['video', 'mp4']]
	]
	const store = [
		['H7_Xmind', ['xmind']],
		['H7_Markdown', ['md', 'markdown', 'txt', 'mkd', 'mdown', 'mkdn']],
		['H7_Office', ['pdf', 'ofd', 'doc', 'docx', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'et']]
	]
	const state = new Proxy({ gif: '图片', png: '图片', video: '影视' }, { get: (t, p) => t[png(p)] || '文档文件' })
	const png = type => category.find(e => e[1].includes(type))?.[0] || type
	// const open = ({ guid, name, path, type }) => {
	// 	const origin = uni.getStorageSync('serverUrl')
	// 	path = origin + '/' + path
	// 	switch (state[type]) {
	// 		case '影视':
	// 			videoPath.value = path
	// 			break
	// 		case '图片':
	// 			uni.previewImage({ current: 0, urls: [path] })
	// 			break
	// 		default: doc(guid, name, path, origin, type)
	// 	}
	// }
	function open(annex) {
		let annexConfig : any
		getComponent('ef5641e1-5eb4-4ae5-81bb-930253611dfe').then(e => {
			annexConfig = e
			previewFile(annex, annexConfig.Pub_FileConfig[2])
			return annexConfig
		})
	}
	const doc = (guid, name, path, origin, type) => {
		const params = JSON.stringify({
			_action: uni.getStorageSync(store.find(e => e[1].includes(type))?.[0] as string),
			urlLink: path,
			"fileName": name,				                        //文件名称
			"filePath": path,                               //文件路径
			"uid": uni.getStorageSync('UserOID'),           //登录用户ID
			"uname": uni.getStorageSync('RealName'),	      //登录用户名称
			"fileID": guid,					                        //文件ID
			"permission": 'write',			                    //权限 read 预览 write 编辑
			"source": origin,                               // 文件来源
			"panel": false,                                 //OnlyOffice 模板预览
		})
		uni.navigateTo({
			url: `/pages/subPackages/form/accessory?params=${params}`
		})
	}
</script>
<style lang="scss" scoped>
	.annex {
		>.u-empty {
			position: fixed;
			top: calc(50vh - 100rpx);
			left: calc(50vw - 70rpx);
		}

		>view {
			margin-bottom: 20rpx;
			margin-left: 20rpx;
			margin-right: 20rpx;
			>.title {
				font-size: 28rpx;
				color: rgb(60, 156, 255);
			}

			>.item {
				font-size: 24rpx;
				height: 170rpx;
				border-bottom: 1rpx solid #bdbdbd;
				display: grid;
				grid-template-columns: 96rpx 1fr;
				gap: 40rpx;
				align-items: center;

				image {
					width: 96rpx;
					height: 96rpx;
				}

				>view {
					height: 100%;
					display: flex;
					flex-direction: column;
					padding-top: 10rpx;
					box-sizing: border-box;

					>* {
						flex: 1;
						display: flex;
						align-items: center;
					}

					.state {
						justify-content: flex-end;

						text {
							background: radial-gradient(rgba(67, 149, 255, 0.32), rgba(204, 27, 27, 0));
						}
					}

					.user-date {
						display: flex;
						justify-content: space-between;
						color: rgb(159, 160, 160);
					}
				}
			}
		}

		>.video {
			position: fixed;
			height: 100vh;
			width: 100vw;
			top: 0;
			left: 0;

			>.close {
				margin-top: var(--status-bar-height);
				position: relative;
				height: 70px;
				width: 100vw;
				background: black;

				>view {
					position: absolute;
					right: 0;
					top: 0;
					width: 70px;
					height: 70px;
					overflow: hidden;

					>view:not(.u-icon) {
						position: absolute;
						right: -100px;
						top: -100px;
						height: 170px;
						width: 170px;
						border-radius: 50%;
						background: #9494948c;
					}

					>.u-icon {
						height: 30px;
						width: 30px;
						position: absolute;
						left: 30px;
						top: 10px;
					}
				}
			}

			>video {
				height: calc(100vh - 70px - var(--status-bar-height));
				width: 100%;
			}
		}
	}
</style>