<template>
  <view class="datree-box">
    <h3 class="datree-box-title">示例13: 主题换色</h3>
    <view class="datree-box-desc">通过修改 themeColor 来更改主题色，注意，是十六进制的颜色值</view>
    <view class="datree-test-box">
      <view class="datree-test-item"><text>随机更改主题颜色</text><button @click="swTreeColor()">操作</button></view>
    </view>
    <DaTree
      ref="DaTreeRef"
      :data="treeData"
      labelField="name"
      valueField="id"
      expandChecked
      showCheckbox
      :themeColor="themeColor"
      :defaultCheckedKeys="defaultCheckedKeysValue"
      @change="handleTreeChange"
      @expand="handleExpandChange"></DaTree>
  </view>
</template>

<script>
import { defineComponent, ref } from 'vue'

import DaTree from '@/components/da-tree/index.vue'
import { basicTreeData, deepClone } from './data'

const treeDataCopy = deepClone(basicTreeData)
export default defineComponent({
  components: { DaTree },
  setup() {
    const treeData = ref(treeDataCopy)
    const DaTreeRef = ref()
    const themeColor = ref('#f0ad4e')
    // 多选时默认值为数组
    const defaultCheckedKeysValue = ref(['31', '32'])

    function handleTreeChange(values, currentItem) {
      // 支持修改节点数据
      currentItem.label = `${currentItem.originItem.name}666`
      console.log('handleTreeChange ==>', values, currentItem)
    }
    function handleExpandChange(expand, currentItem) {
      // 支持修改节点数据
      currentItem.label = `${currentItem.originItem.name}333`
      console.log('handleExpandChange ==>', expand, currentItem)
    }

    function swTreeColor() {
      var hex = Math.floor(Math.random() * 16777216).toString(16)
      while (hex.length < 6) {
        hex = `0${hex}`
      }
      themeColor.value = `#${hex}`
    }

    return {
      DaTreeRef,
      treeData,
      defaultCheckedKeysValue,
      handleTreeChange,
      handleExpandChange,

      swTreeColor,
      themeColor,
    }
  },
})
</script>

<style lang="scss" src="./demox.scss"></style>
