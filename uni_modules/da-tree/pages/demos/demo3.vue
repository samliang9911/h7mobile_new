<template>
  <view class="datree-box">
    <h3 class="datree-box-title">示例3: 展开指定节点</h3>
    <view class="datree-test-box">
      <view class="datree-test-item"><text>展开示例</text><button @click="expandTree(['31','32'],true)">操作</button></view>
      <view class="datree-test-item"><text>收起示例</text><button @click="expandTree(['31','32'],false)">操作</button></view>
      <view class="datree-test-item"><text>展开全部</text><button @click="expandTree('all',true)">操作</button></view>
      <view class="datree-test-item"><text>收起全部</text><button @click="expandTree('all',false)">操作</button></view>
    </view>
    <DaTree
      ref="DaTreeRef"
      :data="treeData"
      labelField="name"
      valueField="id"
      :defaultExpandedKeys="defaultExpandedKeysValue"
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
    // 展开节点值为数组
    const defaultExpandedKeysValue = ref(['31', '32'])

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

    function expandTree(keys, expand) {
      console.log('expandTree ==>', keys, expand)
      DaTreeRef.value?.setExpandedKeys(keys, expand)

      const gek = DaTreeRef.value?.getExpandedKeys()
      console.log('当前已展开的KEY ==>', gek)
    }

    return {
      DaTreeRef,
      treeData,
      defaultExpandedKeysValue,
      handleTreeChange,
      handleExpandChange,

      expandTree,
    }
  },
})
</script>

<style lang="scss" src="./demox.scss"></style>
