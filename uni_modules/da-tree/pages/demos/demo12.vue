<template>
  <view class="datree-box">
    <h3 class="datree-box-title">示例12: 渲染禁用节点</h3>
    <view class="datree-box-desc">禁用节点渲染之后，可以通过 packDisabledkey 来获取是否返回禁用节点</view>
    <view class="datree-test-box">
      <view class="datree-test-item"><text>当前<text style="color: #f10;">{{ packDisabledkey ? '' : '不' }}允许</text>返回禁用节点</text><button @click="swCheckedTree()">切换</button></view>
      <view class="datree-test-item"><text>获取节点数据</text><button @click="getCheckedTree()">操作</button></view>
    </view>
    <DaTree
      ref="DaTreeRef"
      :data="treeData"
      labelField="name"
      valueField="id"
      defaultExpandAll
      checkedDisabled
      showCheckbox
      :packDisabledkey="packDisabledkey"
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
    const packDisabledkey = ref(false)
    const DaTreeRef = ref()
    // 多选时默认值为数组
    const defaultCheckedKeysValue = ref(['22', '41', '42'])

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

    function swCheckedTree() {
      packDisabledkey.value = !packDisabledkey.value
    }

    function getCheckedTree() {
      const gek = DaTreeRef.value?.getCheckedKeys()
      console.log('当前已选中的KEY ==>', gek)
    }

    return {
      DaTreeRef,
      treeData,
      packDisabledkey,
      defaultCheckedKeysValue,
      handleTreeChange,
      handleExpandChange,

      swCheckedTree,
      getCheckedTree,
    }
  },
})
</script>

<style lang="scss" src="./demox.scss"></style>
