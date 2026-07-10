<template>
  <view class="datree-box">
    <h3 class="datree-box-title">示例7: 单选模式(动态加载)</h3>
    <view class="datree-box-desc">动态加载时，当数据返回 leaf 字段时，将不会有展开图标，否则只在首次点击展开的加载数据后，才会检测是否应该显示</view>
    <view class="datree-test-box">
      <view class="datree-test-item"><text>选中示例</text><button @click="checkedTree('21',true)">操作</button></view>
      <view class="datree-test-item"><text>取消选中示例</text><button @click="checkedTree('21',false)">操作</button></view>
      <view class="datree-test-item"><text>展开示例</text><button @click="expandTree(['2'],true)">操作</button></view>
      <view class="datree-test-item"><text>收起示例</text><button @click="expandTree(['2'],false)">操作</button></view>
    </view>
    <DaTree
      ref="DaTreeRef"
      :data="treeData"
      labelField="name"
      valueField="id"
      defaultExpandAll
      loadMode
      :loadApi="getData"
      :defaultCheckedKeys="defaultCheckedKeysValue"
      @change="handleTreeChange"
      @expand="handleExpandChange"></DaTree>
  </view>
</template>

<script>
import { defineComponent, ref } from 'vue'

import DaTree from '@/components/da-tree/index.vue'
import { basicTreeData, deepClone, GetApiData } from './data'

const treeDataCopy = deepClone(basicTreeData)
export default defineComponent({
  components: { DaTree },
  setup() {
    const treeData = ref(treeDataCopy)
    const DaTreeRef = ref()
    // 单选时默认值为字符串或数值，不能为数组
    const defaultCheckedKeysValue = ref('31')

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

    function getData(currentNode) {
      // 返回接口数据
      const { key } = currentNode

      return GetApiData(key)
    }
    function expandTree(keys, expand) {
      console.log('expandTree ==>', keys, expand)
      DaTreeRef.value?.setExpandedKeys(keys, expand)

      const gek = DaTreeRef.value?.getExpandedKeys()
      console.log('当前已展开的KEY ==>', gek)
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

      getData,
      expandTree,
      checkedTree,
    }
  },
})
</script>

<style lang="scss" src="./demox.scss"></style>
