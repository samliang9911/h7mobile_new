<template>
  <view class="datree-box">
    <h3 class="datree-box-title">示例14: 控制选择图标</h3>
    <view class="datree-box-desc">目前只能隐藏单选的图标，暂时没有做隐藏多选图标的想法</view>
    <view class="datree-test-box">
      <view class="datree-test-item"><text>显示/隐藏图标</text><button @click="swTreeIcon()">操作</button></view>
      <view class="datree-test-item"><text>修改图标位置</text><button @click="swTreeIconPosition()">操作</button></view>
    </view>
    <h3>单选</h3>
    <DaTree
      :data="treeData"
      labelField="name"
      valueField="id"
      defaultExpandAll
      :showRadioIcon="showRadioIcon"
      :checkboxPlacement="checkboxPlacement"
      @change="handleTreeChange"
      @expand="handleExpandChange"></DaTree>

    <h3>多选</h3>
    <DaTree
      :data="treeData"
      labelField="name"
      valueField="id"
      defaultExpandAll
      showCheckbox
      :checkboxPlacement="checkboxPlacement"
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

    const showRadioIcon = ref(true)
    const checkboxPlacement = ref('left')

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

    function swTreeIcon() {
      showRadioIcon.value = !showRadioIcon.value
    }
    function swTreeIconPosition() {
      checkboxPlacement.value = checkboxPlacement.value === 'left' ? 'right' : 'left'
    }

    return {
      DaTreeRef,
      treeData,
      handleTreeChange,
      handleExpandChange,

      showRadioIcon,
      checkboxPlacement,
      swTreeIcon,
      swTreeIconPosition,
    }
  },
})
</script>

<style lang="scss" src="./demox.scss"></style>
