<template>
  <up-form labelPosition="top" :model="data" :rules="rules" labelWidth="auto">
    <!-- 动态表单字段 -->
    <up-form-item 
      v-for="item in config" 
      :label="item.label" 
      :key="item.guid" 
      :prop="item.field"
      :borderBottom="borderBottom({type: item.type, disabled: item.disabled})"
    >
      <control 
        v-model="data[item.field]" 
        :form-data="data" 
        v-bind="item" 
        @onChangeBefore="e => onChangeBefore(e, item)"
        @onPageOpenBefore="onPageOpenBefore(item)"
      />
    </up-form-item>
    
    <!-- 附件图片预览 -->
    <up-form-item label="附件" v-if="imageList.length > 0">
      <view class="image-list-container">
        <view 
          v-for="(image, index) in imageList" 
          :key="index"
          class="image-item-wrapper"
        >
          <!-- 图片卡片 -->
          <view class="image-card" @click="handleImageClick(image, index)">
            <!-- 删除按钮 -->
            <view class="delete-btn" @click.stop="removeImage(index)">
              ×
            </view>
            <!-- 图片 -->
            <!-- <image :src="image.FilePath" mode="aspectFill" class="preview-image" /> -->
			<image :src="getIcon(image)" mode="aspectFill" class="preview-image" />
          </view>
          <!-- 文件名 -->
          <text class="image-filename">{{ getShortName(image.FileName) }}</text>
        </view>
      </view>
    </up-form-item>
	
	<view style="padding: 20px;">
		<up-button type="primary" text="上传" @click="buttonClick"></up-button>
	</view>
  </up-form>
</template>
<script setup lang="ts">
import { ref, computed , onMounted, watch ,reactive} from 'vue'
import control from '../../../control'
import { FieldConfig } from '@/api/autopage/indexTypes'
import { ParseFuntionCode,generateUUID } from '@/utils'
import {getUrlType} from '@/utils/instrumentType.js'
import {previewFile,getFileIconUrl} from '@/pages/subPackages/expense/annex/fileView'

import SparkMD5 from 'spark-md5'
import { http_request } from '@/api/api.js'
import { resolve } from 'dns'
import {deepClone} from '@/utils/index.ts'
import {useModulesStore} from '@/store/modules/autoPage.ts'
const module = useModulesStore()
const fileData = computed(() => {
	const fileList = data.value?.annex.map(item => ({
		OID: item.OID,
		FilePath: item.FilePath,
		FileName: item.FileName,
		FileType: item.FileType
	}))
	console.log('fileList',fileList)
	return fileList
})
const annexConfig = computed(() => {
	return data.value?.annexConfig[2]
})
const tb = annexConfig?.BusinessDataTable || 'Pub_BusinessFile'
const limit = annexConfig?.LimitSize||0
const loading = reactive<{oid:string,i:number}[]>([])
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB


// Props 和 响应式数据
const data = defineModel<Record<string, any>>({ default: () => ({}) })
console.log('data3 ',data)
const { config } = defineProps<{ config: FieldConfig[] }>()
// console.log('data',config)
const imageList = ref<Array<{}>>([])
// console.log('imageList',imageList.value)
// 更新图片列表
const updateImageList = (annexArray: any[]) => {
  if (Array.isArray(annexArray) && annexArray.length > 0) {
    // 获取基础URL
    const baseUrl = getUrlType() + '/'
    imageList.value = annexArray.map((file) => ({
	  ...file
	  // FilePath: baseUrl + (file.FilePath || '')
    }))
  } else {
    imageList.value = []
  }
}
// 监听 data 变化，更新图片列表
watch(() => data.value?.annex, (newAnnex) => {
  updateImageList(newAnnex)
}, { immediate: true })



// 获取简短文件名（限制长度）
const getShortName = (fileName: string) => {
  if (!fileName) return ''
  if (fileName.length <= 10) return fileName
  return fileName.substring(0, 8) + '...'
}

// 图片点击预览（暂时不写代码）
const handleImageClick = (image: any, index: number) => {
	if(data.value.annexConfig){
		previewFile(image,data.value.annexConfig[3])
	}else{
		previewFile(image)
	}

}

// 移除图片
const removeImage = (index: number) => {
  if (imageList.value.length > 0 && index >= 0 && index < imageList.value.length) {
    // 从图片列表中移除
    imageList.value.splice(index, 1)
    
    // 同时更新 data 中的 annex 数组
    if (data.value?.annex && Array.isArray(data.value.annex)) {
      data.value.annex.splice(index, 1)
    }
  }
}

//获取图标
function getIcon(image){
	if(getFileIconUrl(image.FileType)){
		return getUrlType() + getFileIconUrl(image.FileType)
	}
	return getUrlType() + '/' + image.FilePath
}

// 表单相关方法
const rules = computed(() => 
  config
    .filter(e => e.required)
    .reduce((acc, item) => {
      data.value[item.field] ??= ''
      acc[item.field] = {
        type: 'string',
        required: true,
        message: `请填写${item.label}`,
        trigger: ['blur', 'change']
      }
      return acc
    }, {})
)

const borderBottom = ({ type, disabled }: { type: string; disabled: boolean }) => 
  !(['textarea'].includes(type) || (['input', 'inputNumber'].includes(type) && disabled))

const onChangeBefore = (e: any, item: FieldConfig) => {
  let change = true
  const value = item.event?.onChangeBefore && ParseFuntionCode.call(
    { _paramLabel: ['fieldInfo', 'data'] },
    item.event.onChangeBefore,
    item,
    e.data
  )
  if (item.event?.onChangeBefore && !value) change = false
  e.callback(change)
}

const onPageOpenBefore = (e: FieldConfig) => {
  e.event?.onPageOpenBefore && ParseFuntionCode.call(
    { _paramLabel: ['fieldInfo'] },
    e.event.onPageOpenBefore,
    { urlParams: {}, selectedData: [], layerOptions: {} }
  )
}






// 点击上传事件
function buttonClick() {
  uni.chooseImage({
    count: 1, // 默认1张
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: (res) => {
      // tempFilePath可以作为img标签的src属性显示图片
      const tempFilePaths = res.tempFilePaths
	  console.log('res',res)
      console.log('选择的文件:', tempFilePaths)
      
      // 这里可以处理上传逻辑
      // uploadFile(tempFilePaths[0])
	  change(res.tempFiles[0])
    },
    fail: (err) => {
      uni.showToast({
        title: '选择文件失败',
        icon: 'none'
      })
    }
  })
}

function change(files){
	let reject:string[] = []
	    const info = createInfo(files)
	    fileData.value.push(info[0])
	    module.addCurrentData(tb,deepClone(info[0]),false)
	    module.addFileData(tb,info[1] ,false)
	    upload(files,info[0].OID)
}

/** 创建上传基础信息 */
const createInfo = ({name,size})=>{
  const guid = generateUUID()
  return [
    //附件表数据
    {
      OID: guid,
      [tb + 'OID']: guid,
      FileName: name,
      FileType: name.substring(name.lastIndexOf('.') + 1).toLocaleLowerCase(),
      FileSize:(size / (1024 * 1024)).toFixed(2)+'MB',
      FileSizeKb: (size / 1024).toFixed(2),
      Mark: data.value?.annexConfig[2].Mark||null,
      Type: data.value?.annexConfig[2].Type,
      // ...params
    },
    //{tag:'add',fileList:{这里的参数}}
    {
      Id: guid,
      Fp: 'FilePath',
      Bf: data.value?.annexConfig[2].DestinationFolder,
    }
  ]
}

/** 上传文件 */
async function upload(file,oid){
  const curLoading = reactive({oid,i:0})
  loading.push(curLoading)
  const timer = file.size>200000?setInterval(()=>curLoading.i++,file.size/200000):void 0
  const hash = await calculateHash(file)
  clearInterval(timer)
  /**分片数量 */
  const chunkCount = Math.ceil(file.size / CHUNK_SIZE)
  /**每片的进度条数量 */
  const scheduleCount = 1/(chunkCount/(100 - curLoading.i))
  await Promise.all(Array.from({length:chunkCount},async(_,i)=>{
    await fetch(createFormData(file,i,hash,oid,chunkCount),'/api/sysFile/fileSave')
    curLoading.i = parseFloat((curLoading.i + scheduleCount).toFixed(2))
  }))
  loading.splice(loading.findIndex(e=>e.oid==oid),1)
  const jsonData = [{
	  tag:'sel',
	  tb,
	  field:'FilePath',
	  wh:{Filter:tb+'OID = {oid}',Param:{oid}}
  }]
  const res = await fetch({json: jsonData})
  // const res = await fetch({json:[{tag:'sel',tb,field:'FilePath',wh:{Filter:tb+'OID = {oid}',Param:{oid}}}]})
  console.log('bbbb',res)
  const path = res.fileData[tb].Items[0].FilePath
  fileData.value.find(e=>e.OID==oid)!.FilePath = path?.indexOf('/') == 0 || path?.indexOf('http') == 0 ? path : `/${path}`
}

/** 计算文件Hash */
async function calculateHash(file):Promise<string>{
  return new Promise((resolve, reject) => {
    const chunkSize = CHUNK_SIZE;
    const chunks = Math.ceil(file.size / chunkSize);
    const spark = new SparkMD5.ArrayBuffer();
    let currentChunk = 0;
    const fileReader = new FileReader();
    fileReader.onload = function (e:any) {
      spark.append(e.target.result);
      currentChunk++;
      if (currentChunk < chunks) {
        loadNext();
      } else {
        const hash = spark.end();
        resolve(hash);
      }
    };
    fileReader.onerror = function () {
      reject('文件读取失败');
    };
    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }
    loadNext();
  })
}

function fetch(body,url=''):Promise<any>{
	console.log('body',body)
    return new Promise((resolve, reject)=>http_request('',body,url,(res)=>{
		if(res.code == '1000'){
			console.log('res',res)
			console.log('成功')
			resolve(res.data)
		}else{
			console.log('失败')
			reject(res.data)
		}
	}))
}

/** 创建分片数据 */
const createFormData = (file,i,hash,oid,count)=>{
  const start = i * CHUNK_SIZE
  const end = Math.min(file.size, start + CHUNK_SIZE)
  const formData = new FormData()
  formData.append('id', oid)
  formData.append('HashId', hash)
  formData.append('index', String(i))
  formData.append('count', count)
  formData.append('bs', file.slice(start, end))
  formData.append('sf', file.name.match(/\.[^.]+$/)?.[0])
  
/* for (let [key, value] of formData) {
    console.log(key, ':', value);
  } */
  return formData
}
</script>
<style lang="less" scoped>
	.u-form {
		padding-top: 10px;
	}
	.u-form-item {
		margin-bottom: 20px;

		&>:deep(.u-form-item__body) {
			padding: 0;
		}
	}

	:deep(.u-form-item__body__left__content__label) {
		font-size: 14px;
	}
/* 图片列表容器 - 移动端一排三个 */
.image-list-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5rpx;
  width: 100%;
}

/* 单个图片项 */
.image-item-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* 图片卡片 */
.image-card {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
}

/* 图片 */
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 删除按钮 */
.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(255, 77, 79, 0.9);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #ff4d4f;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

/* 文件名 */
.image-filename {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .image-list-container {
    grid-template-columns: repeat(4, 1fr);
    gap: 15rpx;
  }
  
  .image-card {
    width: 100rpx;
    height: 180rpx;
  }
}

@media (max-width: 480px) {
  .image-list-container {
    grid-template-columns: repeat(4, 1fr);
    gap: 12rpx;
  }
  
  .image-card {
    width: 160rpx;
    height: 160rpx;
  }
  
  .delete-btn {
    width: 36rpx;
    height: 36rpx;
    font-size: 28rpx;
  }
  
  .image-filename {
    font-size: 20rpx;
  }
}

</style>