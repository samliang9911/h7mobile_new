<template>
  <view>
    <hr-table v-model="formattedData" :style="{height: count === 1 ? '75vh':'38vh'}" @row-click="onRowClick" 
              @next-page="nextPage" @checkbox-change="onCheckboxChange" >
      <hr-table-column label="序号" width="50" type="seq" :fixed="true" />
      <hr-table-column v-for="item in columns" :key="item.field" :label="item.label" :field="item.field"
                       :fixed="item.field === 'BillType' ? false : item.fixed" :width="item.width" :isCount="item.isCount" />
    </hr-table>
    <up-action-sheet v-if="editor" :title="title" :show="show" @close="show=false" round="10"
                     :closeOnClickOverlay="false">
      <view class="table-form">
        <hr-form v-model="formData" :config="columns" />
      </view>
      <up-button class="sure" type="primary" @click="sure">确定</up-button>
    </up-action-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue' // 引入 computed
import hrTable from './table/table.vue'
import hrTableColumn from './table/column.ts'
import hrForm from '../../form'
import { FieldConfig } from '@/api/autopage/indexTypes'
import { formatValue, M_calculate } from '@/api/expense/format.ts'
import { previewFile, getFileIconUrl } from '@/pages/subPackages/expense/annex/fileView'
import { getUrlType } from '@/utils/instrumentType.js'
const { columns, title, edit, count } = defineProps<{ columns : FieldConfig[], title ?: string, edit ?: any, count ?: any }>()
const emit = defineEmits(['next-page'])
const editor = ref(typeof edit == 'boolean' ? edit : true)
const data = defineModel<{ [key : string] : any }[]>()

const show = ref(false)
const formData = ref<{ [key : string] : any }>({})

const currentRow = ref<{ [key : string] : any }>({})

const onRowClick = ({ row }) => {
  if (!editor.value || row.isSummary) return; // 合计行不可编辑
  show.value = true
  currentRow.value = row
  formData.value = JSON.parse(JSON.stringify(row))
}

const sure = () => {
  show.value = false
  for (let key in formData.value) {
    if (formData.value[key] !== undefined) {
      currentRow.value[key] = formData.value[key];
    }
  }
}

const nextPage = () => {
  emit('next-page')
}

// 【核心修复】使用计算属性包装整个数据流
const formattedData = computed(() => {
  if (!data.value) return []

  // 1. 找出需要累计的字段
  const countFields = columns
      .filter(col => col.isCount === 'true')
      .map(col => col.field)

  let newData : any[] = [...data.value]

  // 2. 处理合计行逻辑
  if (countFields.length > 0) {
    const countResult : Record<string, number | null> = {}
    countFields.forEach(field => {
      const expr = data.value
          .map(row => row[field])
          .filter(val => val !== undefined && val !== null && val !== '')
          .map(val => typeof val === 'number' ? val : parseFloat(val) || 0)
          .join('+')
      countResult[field] = M_calculate(expr, 2)
    })

    const summaryRow : Record<string, any> = { isSummary: true } // 增加合计行标识
    columns.forEach(col => {
      summaryRow[col.field] = countResult[col.field] ?? ''
    })
    newData = [...data.value, summaryRow]
  }

  // 3. 最终格式化数据
  return newData.map(row => {
    const formattedRow : Record<string, any> = { ...row }
    columns.forEach(col => {
      formattedRow[col.field] = formatValue(col, row)
	  // 处理 Remarks 字段：空字符串转布尔值
	        if (col.field === 'Remarks') {
	          formattedRow[col.field] = formattedRow[col.field] === '' ? false : !!formattedRow[col.field]
	        }
    })
    return formattedRow
  })
})
// console.log('formattedData ',formattedData.value)
// 附件相关
const attachmentList = ref<any[]>([])
// 提取所有行的附件
const extractAllAttachments = (tableData: any[]) => {
  // 使用 reduce 收集所有附件
  const allAttachments = tableData.reduce((acc, row) => {
    // 检查当前行是否有 annex 数组
    if (row?.annex && Array.isArray(row.annex)) {
      // 过滤出有 FilePath 的附件
      const validAttachments = row.annex.filter(item =>
          item && typeof item === 'object' && item.FilePath
      )
      return [...acc, ...validAttachments]
    }
    return acc
  }, [] as any[])
  attachmentList.value = allAttachments
}

// 监听 data 变化，提取所有附件
watch(() => data.value, (newData) => {
  extractAllAttachments(newData)
}, { immediate: true, deep: true })


// 获取简短文件名（限制长度）
const getShortName = (fileName: string) => {
  if (!fileName) return ''
  if (fileName.length <= 10) return fileName
  return fileName.substring(0, 8) + '...'
}

// 图片点击预览（暂时不写代码）
const handleImageClick = (image: any, index: number) => {
  previewFile(image,data.value.annexConfig[3])
}

// 移除图片
const removeImage = (index: number) => {
  if (attachmentList.value.length > 0 && index >= 0 && index < attachmentList.value.length) {
    // 从图片列表中移除
    attachmentList.value.splice(index, 1)

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
}
  // 复选框变化处理
// 新增方法
const onCheckboxChange = (row: any, col: any, event: any) => {
  const checked = event.detail.value
  // 直接更新当前行的 Remarks 字段
  row[col.field] = checked
  console.log(row[col.field]);	
}

</script>

<style lang="scss" scoped>
.table-form {
  max-height: 70vh;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  margin-bottom: 50px;
  overflow: auto;
}

.sure {
  position: absolute !important;
  bottom: 10px;
  width: calc(100% - 40px) !important;
  left: 20px;
}
</style>