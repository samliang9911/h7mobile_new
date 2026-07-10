<template>
  <view class="datree-box">
    <h3 class="datree-box-title">示例15: 搜索筛选</h3>
    <view class="datree-box-desc">通过改变 filterValue 值来筛选内容</view>
    <view class="datree-box-input">
      <view>当前输入了：{{ filterValue }}</view>
      <input
        type="text"
        :value="filterValue"
        @input="handleFilterChange"
        placeholder="请输入内容筛选" />
    </view>
    <DaTree
      ref="DaTreeRef"
      :data="treeData"
      :filterValue="filterValue"
      labelField="name"
      valueField="id"
      defaultExpandAll
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
    const filterValue = ref('')

    function handleFilterChange(ev) {
      filterValue.value = ev.detail.value
      console.log('handleFilterChange ==>', ev)
    }

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
    function checkedTree(keys, checked) {
      console.log('checkedTree ==>', keys, checked)
      DaTreeRef.value?.setCheckedKeys(keys, checked)

      const gek = DaTreeRef.value?.getCheckedKeys()
      console.log('当前已选中的KEY ==>', gek)
    }

    return {
      DaTreeRef,
      treeData,
      handleTreeChange,
      handleExpandChange,
      filterValue,
      handleFilterChange,

      expandTree,
      checkedTree,
    }
  },
})
</script>

<style lang="scss" src="./demox.scss"></style>
