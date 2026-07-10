<template>
  <view class="hr-table">
    <scroll-view scroll-y scroll-x @scrolltolower="scrolltolower" lower-threshold="150">
      <table>
        <thead>
        <tr>
          <th v-for="(col,index) in columns" :key="col.key"
              :class="{fixed:col.fixed,['column'+index]:true}" :field="col.field" align="center" :style="{
                left: thLeft[index],
                width: (col.width) + 'rpx',
                maxWidth: (col.maxWidth || col.width) + 'rpx'
              }">
            {{ col.label }}
          </th>
        </tr>
        </thead>
        <tbody>
          <tr v-for="(row,index) in data" :key="index" 
              :class="{stripe:index%2==0, 'summary-row': row.isSummary}">
            <td v-for="(col,rowIndex) in columns" :key="col.field">
              <view v-if="col.field === 'Remarks'" style="display: flex; justify-content: center; align-items: center;">
                <checkbox 
                    :checked="!!row[col.field]" 
                    @change="handleCheckboxChange(row, col, $event)"
					color="#52c41a"
					class="custom-checkbox"				
				/>
              </view>
              <template v-else>
                <view @click="onRowClick({row,index})" style="width: 100%; height: 100%;">
                  {{ render({ row, col, index }) }}
                </view>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <view v-if="!data.length" class="no-data">暂无数据</view>
      <view v-else class="fill"></view>
    </scroll-view>
  </view>
</template>
<script setup lang="ts">
import { reactive, computed, useSlots, defineEmits, onMounted, ref } from 'vue'
import { getRect } from '../tool'
import { defineModel } from '../model'

const data = defineModel<{ [key : string] : any }[]>({ default: [] })
const emit = defineEmits(['row-click', 'next-page','checkbox-change'])

const columns = computed(() => {
  const child = useSlots().default?.()?.reduce((a, b) => {
    a.push(...(Array.isArray(b.children) ? b.children : [b]).filter((e) => e?.['type']?.name == 'column'))
    return a
  }, [] as any[]) || []
  return child.map((e) => e.props)
})

const thLeft = reactive<any[]>([])
onMounted(() => {
  columns.value.forEach(async (e, i) => {
    thLeft[i] = ''
    if (e.fixed) {
      const rect = await getRect('.column' + (i - 1))
      thLeft[i] = i ? (rect.width || 1.7) - 1.7 + 'px' : '-1px'
    }
  })
})

function render({ row, col, index }) {
  if (col.type === 'seq') {
    // 修改判断逻辑：使用 isSummary 标识，不再依赖数组长度
    if (row.isSummary) return '合计'
    return index + 1
  }
 // console.log({ row, col, index });
  return row[col.field] ?? ''
}

function onRowClick(obj) { emit('row-click', obj) }
function scrolltolower() { emit('next-page') }
//fjj 新增方法
function handleCheckboxChange(row: any, col: any, event: any) {
  const checked = event.detail.value
  // 发送事件给父组件
  emit('checkbox-change', row, col, event)
}
</script>
<style lang="scss" scoped>
.summary-row {
  background-color: #fff7e6 !important;
  font-weight: bold;
}

.hr-table {
  border: 1px solid #dfe2e5;
  overflow: auto;
  position: relative;

  scroll-view {
    height: 100%;
  }

  thead {
    position: sticky;
    top: -1px;
    background-color: white;
    box-shadow: 0px 1px 0px 0px #dfe2e5;
    z-index: 2;
  }

  .fixed {
    position: sticky;
    left: -1px;
    background-color: white;
    z-index: 1;
    box-shadow: inset -1px 0px 0px 0px #e9e9e9;
  }

  table {
    border-collapse: collapse;
    white-space: nowrap;
    margin: -1px;

    th {
      color: #909399;
      font-size: 13px;
      font-weight: 600;
    }

    .stripe {
      background-color: #f9fff9;
    }

    td {
      font-weight: 400;
      color: #606266;
      font-size: 12px;
    }

    th,
    td {
      border: 1px solid #dfe2e5;
      padding: 6px 10px;
    }

    .no-data {
      width: 100%;
      position: absolute;
      justify-content: center;
      display: flex;
      height: 60px;
      line-height: 60px;
      font-size: 12px;
      color: #909399;
    }

    .fill {
      height: 15px;
    }
  }


  // 自定义复选框样式 - 红绿配色
  .custom-checkbox {
    transform: scale(0.6);
    transform-origin: center;  
    // 强制覆盖未选中状态的边框颜色为红色
    :deep(.uni-checkbox-input) {
      width: 32rpx !important;
      height: 32rpx !important;
      border-radius: 4px !important;
      border: 2px solid #cdd9d7 !important; // 红色边框
      box-sizing: border-box !important;
    }
    // 选中状态 - 绿色背景和边框
    :deep(.uni-checkbox-input:checked) {
      border-color: #52c41a !important; // 绿色边框
    }
  }
}
</style> 