<template>
  <view v-if="visible" class="preview-mask" @click="close">
    <view class="preview-content" @click.stop>
      <view class="preview-header">
        <text class="preview-title">{{ fileName }}</text>
        <view class="preview-close" @click="close">×</view>
      </view>
      <view class="preview-body">
        <video v-if="isVideo" class="preview-video" :src="previewUrl" controls autoplay></video>
        <web-view v-else-if="isWebView" :src="previewUrl" class="preview-webview"></web-view>
        <view v-else class="preview-unsupported">
          <text class="preview-icon">📄</text>
          <text class="preview-tip">{{ unsupportedTip }}</text>
          <view class="preview-btn" @click="download">下载查看</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getUrlType } from '@/utils/instrumentType.js'

const props = defineProps<{
  visible: boolean
  file: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function safeGetUrlType(): string {
  try { return getUrlType() || '' } catch { return '' }
}

const base = computed(() => safeGetUrlType())

const fileName = computed(() => props.file?.FileName || '文件')
const filePath = computed(() => props.file?.FilePath || '')
const fileType = computed(() => (props.file?.FileType || '').toLowerCase())

const previewUrl = computed(() => {
  const p = filePath.value
  if (/^https?:/.test(p)) return p
  return base.value + (p.startsWith('/') ? '' : '/') + p
})

const streamUrl = computed(() => {
  return base.value + '/api/sysFile/stream?url=' + encodeURIComponent(filePath.value)
})

const isVideo = computed(() => {
  return ['mp4', 'mov', 'wmv', 'avi', 'flv', 'mkv', 'ogv', 'webm'].includes(fileType.value)
})

const isOffice = computed(() => {
  return ['pdf', 'ofd', 'doc', 'docx', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'et'].includes(fileType.value)
})

const isCAD = computed(() => {
  return ['dwg', 'dxf', 'dwf'].includes(fileType.value)
})

const isModel3d = computed(() => {
  return ['3dm', '3ds', '3mf', 'amf', 'bim', 'brep', 'dae', 'fbx', 'fcstd', 'gltf', 'ifc', 'iges', 'step', 'stl', 'obj', 'off', 'ply', 'wrl'].includes(fileType.value)
})

const isMarkdown = computed(() => {
  return ['md', 'markdown', 'txt', 'mkd', 'mdown', 'mkdn'].includes(fileType.value)
})

const isXmind = computed(() => fileType.value === 'xmind')

const isWebView = computed(() => {
  return isOffice.value || isCAD.value || isModel3d.value || isMarkdown.value || isXmind.value
})

const unsupportedTip = computed(() => {
  if (isVideo.value) return '视频预览失败'
  if (isOffice.value) return '文档预览加载中...'
  if (isCAD.value) return 'CAD文件预览中...'
  if (isModel3d.value) return '3D模型预览中...'
  if (isMarkdown.value) return 'Markdown预览中...'
  if (isXmind.value) return 'Xmind预览中...'
  return '该文件类型暂不支持预览'
})

function close() {
  emit('close')
}

function download() {
  // #ifdef H5
    const a = document.createElement('a')
    a.href = streamUrl.value
    a.download = fileName.value
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  // #endif
  // #ifndef H5
    uni.downloadFile({
      url: streamUrl.value,
      success: (res) => {
        if (res.statusCode === 200) {
          uni.openDocument({
            filePath: res.tempFilePath,
            success: () => {},
            fail: () => {
              uni.showToast({ title: '打开文件失败', icon: 'none' })
            }
          })
        }
      },
      fail: () => {
        uni.showToast({ title: '下载失败', icon: 'none' })
      }
    })
  // #endif
}
</script>

<style lang="scss" scoped>
.preview-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  width: 90%;
  max-width: 600px;
  height: 80%;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #f5f5f5;
  border-bottom: 1rpx solid #e4e7ed;
}

.preview-title {
  font-size: 28rpx;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 20rpx;
}

.preview-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #ccc;
  color: #fff;
  font-size: 40rpx;
  line-height: 56rpx;
  text-align: center;
}

.preview-body {
  flex: 1;
  overflow: hidden;
  background: #fafafa;
}

.preview-video {
  width: 100%;
  height: 100%;
}

.preview-webview {
  width: 100%;
  height: 100%;
}

.preview-unsupported {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.preview-tip {
  font-size: 28rpx;
  color: #909399;
  margin-bottom: 40rpx;
}

.preview-btn {
  padding: 20rpx 60rpx;
  background: #409eff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}
</style>