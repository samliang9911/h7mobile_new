<template>
  <view class="datree-box">
    <h3 class="datree-box-title">示例5: 多选模式(互不干扰)</h3>
    <view class="datree-box-desc">互不干扰的情况下，子节点不会继承父节点的禁用状态</view>
    <view class="datree-test-box">
      <view class="datree-test-item"><text>选中示例</text><button @click="checkedTree(['311','322','41'],true)">操作</button></view>
      <view class="datree-test-item"><text>取消选中示例</text><button @click="checkedTree(['311','322','41'],false)">操作</button></view>
    </view>
    <DaTree
      ref="DaTreeRef"
      :data="treeData"
      labelField="name"
      valueField="id"
      showCheckbox
      defaultExpandAll
      checkStrictly
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
    // 多选时默认值为数组
    const defaultCheckedKeysValue = ref(['31', '32', '41', '42'])

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

    function checkedTree(keys, checked) {
      console.log('checkedTree ==>', keys, checked)
      DaTreeRef.value?.setCheckedKeys(keys, checked)

      const gek = DaTreeRef.value?.getCheckedKeys()
      console.log('当前已选中的KEY ==>', gek)
    }

    return {
      DaTreeRef,
      treeData,
      defaultCheckedKeysValue,
      handleTreeChange,
      handleExpandChange,

      checkedTree,
    }
  },
})
</script>

<style lang="scss" src="./demox.scss"></style>
