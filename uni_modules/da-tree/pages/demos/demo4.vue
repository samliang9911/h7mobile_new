<template>
  <view class="datree-box">
    <h3 class="datree-box-title">示例4: 选中指定节点</h3>
    <view class="datree-box-desc">当有 expandChecked 时，选中节点会自动展开到当前节点</view>
    <view class="datree-test-box">
      <view class="datree-test-item"><text>【{{ expandChecked ? '关闭' : '开启' }}】自动展开节点功能</text><button @click="swCheckedTree()">操作</button></view>
      <view class="datree-test-item"><text>选中示例</text><button @click="checkedTree(['21','23','31','32'],true)">操作</button></view>
      <view class="datree-test-item"><text>取消选中示例</text><button @click="checkedTree(['21','23','31','32'],false)">操作</button></view>
      <view class="datree-test-item"><text>展开示例</text><button @click="expandTree(['2'],true)">操作</button></view>
      <view class="datree-test-item"><text>收起示例</text><button @click="expandTree(['2'],false)">操作</button></view>
    </view>
    <DaTree
      ref="DaTreeRef"
      :data="treeData"
      labelField="name"
      valueField="id"
      showCheckbox
      :expandChecked="expandChecked"
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
    const expandChecked = ref(false)
    const DaTreeRef = ref()
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

    function swCheckedTree() {
      expandChecked.value = !expandChecked.value
    }

    return {
      DaTreeRef,
      treeData,
      expandChecked,
      defaultCheckedKeysValue,
      handleTreeChange,
      handleExpandChange,

      expandTree,
      checkedTree,
      swCheckedTree,
    }
  },
})
</script>

<style lang="scss" src="./demox.scss"></style>
