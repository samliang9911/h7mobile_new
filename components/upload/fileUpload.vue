<template>
	<view class="fu-panel" v-if="showFileUpload">
		<view class="fu-title">附件</view>
		<view class="fu-item" v-for="Config in fileConfig" :key="Config.Pub_FileConfigOID"
			v-show="showFileType(Config)">
			<!-- 必填红星（对齐 A 的 required = Config.Required || flowNodeReq） -->
			<upload v-model="fileListMap[Config.Pub_FileConfigOID]" :config="Config"
				:showUploadButton="showUploadButton(Config)" :showDelButton="showDelButton(Config)"
				:readonly="effectiveReadonly" :iconBase="iconBase" />
		</view>
	</view>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import upload from './upload.vue'

	/**
	 * 多分类「附件」面板（对齐 creatpage src/views/Card/formWidget/file-upload.vue）。
	 * 显隐/上传/删除门控逐字移植 A 的 showFileUpload / showFileType / showUploadButton / showDelButton / flowNodeReq。
	 * 跳过 A 的 PC 专有能力：右键菜单、二维码手机上传、el-upload 回退、OFD 解析。
	 */
	const props = withDefaults(defineProps<{
		/** Pub_FileConfig[] 配置 */
		fileConfig: any[]
		/** 各分类文件列表，key = Pub_FileConfigOID */
		fileListMap?: Record<string, any[]>
		/** 业务状态 BusinessState（1 草稿/3 审批中/4,5 已完成/100,101,102 终态） */
		businessState?: any
		/** 是否业务页（流程页） */
		isBusinessPage?: boolean
		/** 业务页只读 */
		bpReadOnly?: boolean
		/** 整体只读 */
		readonly?: boolean
		/** URL 参数 w（3 = 只读查看） */
		queryW?: string | number
		/** URL 参数 TaskID（流程任务） */
		taskID?: string
		/** URL 参数 ActivityID（当前流程节点） */
		activityID?: string
		/** 图标/缩略图地址前缀，透传给 upload */
		iconBase?: string
	}>(), {
		fileListMap: () => ({}),
		businessState: '',
		isBusinessPage: false,
		bpReadOnly: false,
		readonly: false,
		queryW: '',
		taskID: '',
		activityID: '',
		iconBase: ''
	})

	const DONE_STATES = ['100', '101', '102']
	const inDone = () => DONE_STATES.includes(String(props.businessState))
	const inState = (arr: (string | number)[]) => arr.map(s => String(s)).includes(String(props.businessState))
	/** AllowUploadNode / CanModifyNode / IsRequired_Flow 可能是逗号字符串或数组 */
	const strIncludes = (v: any, key: string) => {
		if (!v || !key) return false
		const arr = Array.isArray(v) ? v : String(v).split(',')
		return arr.map(s => String(s).trim()).includes(String(key))
	}

	const hasFiles = computed(() => Object.values(props.fileListMap).some((a: any) => a && a.length))
	const effectiveReadonly = computed(() => props.readonly || (props.isBusinessPage && props.bpReadOnly))

	/** 整个附件面板是否显示（对齐 A showFileUpload） */
	const showFileUpload = computed(() => {
		if (!props.isBusinessPage) return true
		if (hasFiles.value) return true
		if (String(props.queryW) === '3' || inDone()) return false
		if (props.taskID) return true
		const hv = (props.fileConfig || []).some((c: any) => c.Always_Upload == true)
		if (inState([2, 4, 5]) && !hv) return false
		return true
	})

	/** 单个附件分类是否显示（对齐 A showFileType） */
	function showFileType(Config: any) {
		const oid = Config.Pub_FileConfigOID
		const len = props.fileListMap[oid]?.length || 0
		if ((String(props.queryW) === '3' || inDone()) && len < 1) return false
		if (props.taskID) return true
		if (len < 1) {
			if (inState([2, 100, 101, 102])) return false
			if (inState([4, 5]) && !Config.Always_Upload) return false
			return true
		}
		return true
	}

	/** 上传按钮是否显示（对齐 A showUploadButton） */
	function showUploadButton(Config: any) {
		if (effectiveReadonly.value) return false
		if (!props.queryW) return true
		if (String(props.queryW) === '3' || inDone()) return false
		if (props.taskID) {
			if (String(props.businessState) === '3') return true
			if (strIncludes(Config.AllowUploadNode, props.activityID) || strIncludes(Config.IsRequired_Flow, props.activityID)) return true
			return false
		}
		if (!props.businessState || inState([1, 3])) return true
		if (inState([4, 5]) && Config.Always_Upload) return true
		return false
	}

	/** 删除按钮是否显示（对齐 A showDelButton） */
	function showDelButton(Config: any) {
		if (effectiveReadonly.value) return false
		if (String(props.queryW) === '3' || inDone()) return false
		if (props.taskID) {
			if (String(props.businessState) === '3') return true
			if (strIncludes(Config.CanModifyNode, props.activityID)) return true
			return false
		}
		if (inState([1, 3])) return true
		if (inState([4, 5]) && Config.Always_Upload) return true
		return false
	}
</script>

<style lang="scss" scoped>
	.fu-panel {
		padding: 8rpx 24rpx 24rpx;

		.fu-title {
			font-size: 30rpx;
			font-weight: 600;
			color: #303133;
			padding: 20rpx 0 12rpx;
			border-bottom: 1rpx solid #ebeef5;
			margin-bottom: 8rpx;
		}

		.fu-item {
			padding: 8rpx 0;
		}
	}
</style>
