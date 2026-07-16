<template>
	<view class="demo">
		<!-- 演示门控的控制器 -->
		<view class="card">
			<view class="row">
				<text class="lab">业务状态</text>
				<view class="segs">
					<text v-for="s in states" :key="s.v" class="seg" :class="{ on: businessState === s.v }"
						@click="businessState = s.v">{{ s.t }}</text>
				</view>
			</view>
			<view class="row">
				<text class="lab">业务页</text>
				<up-switch v-model="isBusinessPage" />
			</view>
			<view class="row">
				<text class="lab">只读</text>
				<up-switch v-model="readonly" />
			</view>
			<view class="tip">
				提示：删除某分类全部文件后切到「已完成」，可观察非 Always_Upload 分类自动隐藏、Always_Upload 分类（3D模型）保留。
			</view>
		</view>

		<!-- 多分类附件面板 -->
		<fileUpload :fileConfig="fileConfig" :fileListMap="fileListMap" :businessState="businessState"
			:isBusinessPage="isBusinessPage" :readonly="readonly" :iconBase="ICON_BASE" />
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive } from 'vue'
	import fileUpload from '@/components/upload/fileUpload.vue'

	/**
	 * 上传组件 P1 渲染 demo 页。
	 * 用 mock 的 Pub_FileConfig（4 类）+ mock 预置文件驱动 <fileUpload> 渲染，
	 * 并提供 BusinessState / 业务页 / 只读 切换器演示 A 的显隐门控。
	 * 不接真实传输/store/版本控制（P3+）。
	 */

	// 图标/缩略图地址前缀。生产期为 getUrlType()；demo 直接指向后端静态资源根，
	// getFileIconUrl 返回的 /Images/img_fileType/<TYPE>.png 会拼到此基下。
	// 若当前网络不可达，改此常量即可（不影响布局渲染）。
	const ICON_BASE = 'https://new.pcm77.com:4481'

	// 4 类 mock 配置（对齐 Pub_FileConfig 行结构）
	const fileConfig = ref([
		{ Pub_FileConfigOID: 'cfg-image', Name: '图片附件', Type: 'image', QuantityLimit: 6, LimitSize: 20, Required: true },
		{ Pub_FileConfigOID: 'cfg-video', Name: '视频附件', Type: 'video', QuantityLimit: 2, LimitSize: 100 },
		{ Pub_FileConfigOID: 'cfg-model3d', Name: '3D模型', Type: 'model3d', QuantityLimit: 3, LimitSize: 200, Always_Upload: true },
		{
			Pub_FileConfigOID: 'cfg-wj', Name: '其他文件', Type: 'WJ', QuantityLimit: 5, LimitSize: 50,
			AllowTypes: 'pdf,doc,docx,xls,xlsx,zip'
		}
	])

	// mock 预置文件（图片用本地 static 资源走缩略图；其余由图标渲染）
	const fileListMap = reactive<Record<string, any[]>>({
		'cfg-image': [
			{ OID: 'f1', FileName: 'sea.jpg', FileType: 'jpg', FilePath: '/static/user-image/sea.jpg' }
		],
		'cfg-video': [
			{ OID: 'f2', FileName: 'demo.mp4', FileType: 'mp4', FilePath: '/upload/demo.mp4' }
		],
		'cfg-model3d': [
			{ OID: 'f3', FileName: 'engine.fbx', FileType: 'fbx', FilePath: '/upload/engine.fbx' }
		],
		'cfg-wj': [
			{ OID: 'f4', FileName: 'report.pdf', FileType: 'pdf', FilePath: '/upload/report.pdf' },
			{ OID: 'f5', FileName: 'quote.xlsx', FileType: 'xlsx', FilePath: '/upload/quote.xlsx' }
		]
	})

	const businessState = ref('1')
	const isBusinessPage = ref(true)
	const readonly = ref(false)

	const states = [
		{ v: '1', t: '草稿' },
		{ v: '3', t: '审批中' },
		{ v: '4', t: '已完成' },
		{ v: '5', t: '已归档' }
	]
</script>

<style lang="scss" scoped>
	.demo {
		min-height: 100vh;
		background: #f2f3f5;
	}

	.card {
		background: #fff;
		margin: 20rpx;
		padding: 24rpx;
		border-radius: 16rpx;

		.row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16rpx 0;

			.lab {
				font-size: 28rpx;
				color: #303133;
			}

			.segs {
				display: flex;
				background: #f2f3f5;
				border-radius: 8rpx;
				overflow: hidden;

				.seg {
					padding: 8rpx 20rpx;
					font-size: 24rpx;
					color: #606266;

					&.on {
						background: #2979ff;
						color: #fff;
					}
				}
			}
		}

		.tip {
			margin-top: 12rpx;
			font-size: 22rpx;
			color: #909399;
			line-height: 1.6;
		}
	}
</style>
