<template>
  <view class="datree-box">
    <h3 class="datree-box-title">示例6: 可选中禁用节点</h3>
    <view class="datree-box-desc">当有 checkedDisabled 时，节点即使被禁用了，还可以选中。【我也不知道这时候的禁用属性有啥用】</view>
    <view class="datree-test-box">
      <view class="datree-test-item"><text>选中示例</text><button @click="checkedTree(['22','331'],true)">操作</button></view>
      <view class="datree-test-item"><text>取消选中示例</text><button @click="checkedTree(['22','331'],false)">操作</button></view>
    </view>
    <DaTree
      ref="DaTreeRef"
      :data="treeData"
      labelField="name"
      valueField="id"
      defaultExpandAll
      showCheckbox
      checkedDisabled
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
    const defaultCheckedKeysValue = ref([])

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
