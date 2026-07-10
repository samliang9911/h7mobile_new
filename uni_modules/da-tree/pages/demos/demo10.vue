<template>
  <view class="datree-box">
    <h3 class="datree-box-title">示例10: 处理末级节点</h3>
    <view class="datree-box-desc">处理数据时，可通过 isLeafFn 函数来自行处理是否为末级节点，更灵活</view>
    <view class="datree-test-box">
      <view class="datree-test-item"><text>选中示例</text><button @click="checkedTree(['31'],true)">操作</button></view>
      <view class="datree-test-item"><text>取消选中示例</text><button @click="checkedTree(['31'],false)">操作</button></view>
      <view class="datree-test-item"><text>展开示例</text><button @click="expandTree(['31'],true)">操作</button></view>
      <view class="datree-test-item"><text>收起示例</text><button @click="expandTree(['31'],false)">操作</button></view>
    </view>
    <DaTree
      ref="DaTreeRef"
      :data="treeData"
      labelField="name"
      valueField="id"
      expandChecked
      showCheckbox
      :isLeafFn="handleLeafData"
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
import { basicTreeData, deepClone } from './data'
import { GetApiData } from './data'

const treeDataCopy = deepClone(basicTreeData)
export default defineComponent({
  components: { DaTree },
  setup() {
    const treeData = ref(treeDataCopy)
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

    function getData(currentNode) {
      // 返回接口数据
      const { key } = currentNode

      return GetApiData(key)
    }

    /**
     * 自定义当前数据是否为末级节点
     * @param item
     */
    function handleLeafData(item) {
      console.log('handleLeafData ==>', item)

      // 已定义末级节点
      if (item.leaf) {
        return true
      }

      // 无下级
      if (!item.children) {
        return true
      }

      // 当指定内容为 行政部 的时候
      if (item.name === '行政部') {
        return true
      }

      // 下级为空数组
      // if (item.children.length === 0) {
      //   return true
      // }

      // 其它，返回非末级数据
      return false
    }

    return {
      DaTreeRef,
      treeData,
      defaultCheckedKeysValue,
      handleTreeChange,
      handleExpandChange,

      expandTree,
      checkedTree,
      getData,
      handleLeafData,
    }
  },
})
</script>

<style lang="scss" src="./demox.scss"></style>
