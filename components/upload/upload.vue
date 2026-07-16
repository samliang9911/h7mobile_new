<template>
	<view class="up-cat">
		<view class="up-head">
			<text class="up-name">
				<text v-if="required" class="up-req">*</text>{{ config?.Name || '附件' }}
			</text>
			<text class="up-count">{{ list.length }}{{ config?.QuantityLimit ? '/' + config.QuantityLimit : '' }}</text>
		</view>

		<view class="up-grid">
			<view v-if="canAdd" class="up-cell">
				<view class="up-thumb up-add-thumb" @click="pick">
					<text class="up-plus">＋</text>
				</view>
				<text class="up-fname">{{ addLabel }}</text>
			</view>
			<view class="up-cell" v-for="item in list" :key="item.OID">
				<view class="up-thumb" @click="preview(item)">
					<image v-if="getFileIconUrl(item.FileType)" class="up-icon" :src="iconUrl(item.FileType)"
						mode="aspectFit" />
					<image v-else class="up-img" :src="thumbUrl(item)" mode="aspectFill" />
					<view v-if="loading[item.OID] !== undefined" class="up-ring">
						<template #ifdef MP-WEIXIN>
							<svg class="up-ring-svg" viewBox="0 0 100 100">
								<circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" stroke-width="8"></circle>
								<circle cx="50" cy="50" r="40" fill="none" stroke="#4caf50" stroke-width="8"
									:stroke-dasharray="ringDashArray(item.OID)" stroke-dashoffset="0"
									transform="rotate(-90 50 50)"></circle>
							</svg>
						</template>
						<template #ifndef MP-WEIXIN>
							<view class="up-ring-bar" :style="ringStyle(item.OID)"></view>
						</template>
						<text class="up-ring-txt">{{ loading[item.OID] }}%</text>
					</view>
				</view>
				<text class="up-fname">{{ shortName(item.FileName) }}</text>
				<view v-if="showDelButton && !readonly" class="up-del" @click.stop="del(item)">×</view>
			</view>
		</view>
	</view>

	<filePreview v-if="previewVisible" :file="previewFile" @close="previewVisible = false" />
</template>

<script setup lang="ts">
	import { computed, reactive, onBeforeUnmount, ref } from 'vue'
	import { generateUUID } from '@/utils'
	import { getUrlType } from '@/utils/instrumentType.js'
	import { buildAccept, getFileIconUrl } from './fileType'
	import filePreview from './filePreview.vue'

	const props = withDefaults(defineProps<{
		config: any
		showUploadButton?: boolean
		showDelButton?: boolean
		readonly?: boolean
		iconBase?: string
		onUpload?: (raw: any, oid: string, onProgress: (p: number) => void) => Promise<string | void>
		onDelete?: (oid: string, filePath: string) => Promise<void>
	}>(), {
		showUploadButton: true,
		showDelButton: true,
		readonly: false,
		iconBase: ''
	})

	const list = defineModel<any[]>({ default: () => [] })

	function safeBase(): string {
		try { return getUrlType() || '' } catch { return '' }
	}
	const base = computed(() => props.iconBase || safeBase())

	const required = computed(() => !!props.config?.Required)
	const limit = computed(() => Number(props.config?.LimitSize) || 0)
	const remaining = computed(() => {
		const q = Number(props.config?.QuantityLimit) || 0
		if (!q) return 9
		return Math.max(0, q - list.value.length)
	})
	const canAdd = computed(() => props.showUploadButton && !props.readonly && remaining.value > 0)
	const addLabel = computed(() => {
		const t = props.config?.Type
		if (t === 'image') return '图片'
		if (t === 'video') return '视频'
		if (t === 'model3d') return '3D模型'
		return '文件'
	})

	const loading = reactive<Record<string, number>>({})
	const timers: Record<string, any> = {}
	const previewVisible = ref(false)
	const previewFile = ref<any>(null)

	function iconUrl(ext: string): string {
		const ic = getFileIconUrl(ext)
		return ic ? (base.value + ic) : ''
	}
	function thumbUrl(item: any): string {
		const p = item.FilePath || ''
		if (/^\/static\/|^https?:|^blob:|^wxfile:|^file:|^_doc\//.test(p)) return p
		return base.value + '/' + p
	}
	function shortName(n: string): string {
		if (!n) return ''
		return n.length <= 10 ? n : n.slice(0, 8) + '...'
	}
	function ringStyle(oid: string): string {
		const i = loading[oid] || 0
		return `background: conic-gradient(rgb(76,175,80) ${i}%, rgba(0,0,0,0.08) ${i}%);`
	}
	function ringDashArray(oid: string): string {
		const i = loading[oid] || 0
		const circumference = 2 * Math.PI * 40
		const progress = (i / 100) * circumference
		return `${progress} ${circumference - progress}`
	}

	const toast = (t: string) => uni.showToast({ title: t, icon: 'none' })

	function baseName(p: string): string {
		if (!p) return ''
		return p.split('?')[0].split('/').pop() || p
	}
	function normFile(f: any, fallbackPath = ''): { path: string, name: string, size: number } {
		let path = f?.path || f?.tempFilePath || f?.filePath || fallbackPath || ''
		if (!path && f?.name !== undefined && f?.size !== undefined) {
			try { path = URL.createObjectURL(f) } catch { }
		}
		return {
			path,
			name: f?.name || baseName(path) || 'file',
			size: Number(f?.size ?? f?.tempFileSize ?? f?.length ?? 0)
		}
	}

	function pick() {
		if (props.readonly) return
		const q = props.config?.QuantityLimit
		if (q && list.value.length >= q) return toast(`最多上传${q}个`)
		const Type = props.config?.Type
		const cnt = Math.min(remaining.value, 9)
		if (Type === 'image') {
			uni.chooseImage({
				count: cnt, sizeType: ['original', 'compressed'], sourceType: ['album', 'camera'],
				success: r => (r.tempFilePaths || []).forEach((p, i) => addFile(normFile(r.tempFiles?.[i], p), r.tempFiles?.[i])),
				fail: () => toast('已取消')
			})
		} else if (Type === 'video') {
			uni.chooseVideo({
				sourceType: ['album', 'camera'],
				success: r => addFile(normFile({ path: r.tempFilePath, name: r.name, size: r.size ?? r.tempFileSize }), r),
				fail: () => toast('已取消')
			})
		} else {
			// #ifdef MP-WEIXIN
			wx.chooseMessageFile({
				count: cnt,
				type: 'file',
				success: r => (r.tempFiles || []).forEach((f: any) => addFile(normFile(f), f)),
				fail: () => toast('已取消')
			})
			// #endif
			// #ifndef MP-WEIXIN
			const acc = buildAccept(props.config)
			uni.chooseFile({
				count: cnt,
				extension: acc.extension.length ? acc.extension : undefined,
				success: r => ((r.tempFiles as any[]) || []).forEach((f: any) => addFile(normFile(f), f)),
				fail: () => toast('已取消')
			})
			// #endif
		}
	}

	function addFile(file: { path: string, name: string, size: number }, raw?: any) {
		const ext = (file.name.split('.').pop() || '').toLowerCase()
		const acc = buildAccept(props.config)
		const t = props.config?.Type
		if ((!t || t === 'WJ') && acc.extension.length && !acc.extension.includes(ext)) {
			return toast(`仅允许上传 ${acc.extension.join(',').toUpperCase()} 文件`)
		}
		if (limit.value && file.size / 1024 / 1024 > limit.value) {
			return toast(`文件不能超过 ${limit.value}MB`)
		}
		const oid = generateUUID()
		list.value.push({
			OID: oid,
			FileName: file.name,
			FileType: ext,
			FileSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
			FilePath: file.path
		})
		if (props.onUpload) realUpload(raw, oid)
		else simulateUpload(oid)
	}

	async function realUpload(raw: any, oid: string) {
		loading[oid] = 0
		try {
			const path = await props.onUpload!(raw, oid, p => { loading[oid] = Math.min(99, Math.round(p)) })
			loading[oid] = 100
			if (path) {
				const it = list.value.find(f => f.OID === oid)
				if (it) it.FilePath = path
			}
			setTimeout(() => { delete loading[oid] }, 300)
		} catch (e) {
			delete loading[oid]
			list.value = list.value.filter(f => f.OID !== oid)
			toast('上传失败')
		}
	}

	function simulateUpload(oid: string) {
		loading[oid] = 0
		timers[oid] = setInterval(() => {
			const next = (loading[oid] || 0) + Math.ceil(Math.random() * 12) + 6
			if (next >= 100) {
				loading[oid] = 100
				clearInterval(timers[oid])
				delete timers[oid]
				setTimeout(() => { delete loading[oid] }, 400)
			} else {
				loading[oid] = next
			}
		}, 160)
	}

	function preview(item: any) {
		const p = loading[item.OID]
		if (p !== undefined && p < 100) return toast('正在上传...')
		if (!getFileIconUrl(item.FileType)) {
			const urls = list.value.filter(f => !getFileIconUrl(f.FileType)).map(f => thumbUrl(f))
			uni.previewImage({ current: thumbUrl(item), urls })
		} else {
			previewFile.value = item
			previewVisible.value = true
		}
	}

	async function del(item: any) {
		const p = loading[item.OID]
		if (p !== undefined && p < 100) return toast('正在上传...')
		uni.showModal({
			title: '提示', content: '确定删除当前文件?', confirmText: '删除', cancelText: '取消',
			success: async r => {
				if (!r.confirm) return
				if (props.onDelete) {
					try {
						await props.onDelete(item.OID, item.FilePath)
					} catch (e) {
						return toast('删除失败')
					}
				}
				list.value = list.value.filter(f => f.OID !== item.OID)
			}
		})
	}

	onBeforeUnmount(() => {
		Object.keys(timers).forEach(k => clearInterval(timers[k]))
	})
</script>

<style lang="scss" scoped>
	.up-cat {
		padding: 16rpx 0;
	}

	.up-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8rpx 16rpx;

		.up-name {
			font-size: 28rpx;
			color: #303133;
		}

		.up-req {
			color: #f56c6c;
			margin-right: 6rpx;
		}

		.up-count {
			font-size: 24rpx;
			color: #909399;
		}
	}

	.up-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 18rpx;
	}

	.up-cell {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.up-thumb {
		position: relative;
		width: 100%;
		aspect-ratio: 1 / 1;
		background: #f5f5f5;
		border: 1rpx solid #e4e7ed;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		.up-icon {
			width: 58%;
			height: 58%;
		}

		.up-img {
			width: 100%;
			height: 100%;
		}
	}

	.up-add-thumb {
		border: 1rpx dashed #c0c4cc;
		background: #fafafa;

		.up-plus {
			font-size: 56rpx;
			color: #909399;
			line-height: 1;
		}
	}

	.up-fname {
		font-size: 22rpx;
		color: #909399;
		margin-top: 8rpx;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
	}

	.up-del {
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background: rgba(245, 108, 108, 0.95);
		color: #fff;
		font-size: 28rpx;
		line-height: 36rpx;
		text-align: center;
		z-index: 3;
	}

	.up-ring {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: rgba(255, 255, 255, 0.72);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12rpx;

		.up-ring-bar {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 66%;
			height: 66%;
			border-radius: 50%;

			&::after {
				content: '';
				position: absolute;
				top: 20%;
				right: 20%;
				bottom: 20%;
				left: 20%;
				border-radius: 50%;
				background: #fff;
			}
		}

		.up-ring-svg {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 66%;
			height: 66%;
		}

		.up-ring-txt {
			position: relative;
			z-index: 2;
			font-size: 22rpx;
			color: #4caf50;
		}
	}
</style>