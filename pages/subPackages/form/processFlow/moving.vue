<template>
  <view class="moving" v-if="propsNodeSelPerson['length'] > 0">
    <view class="nodeMoving">
      <view style="width: 25%;">
        <text>流转节点:</text>
      </view>
      <view style="width: 75%;">
        <view v-if="flowAllData.SplitMode === 'AND'">
          <up-checkbox-group>
            <view style="width: 100%;display: flex;flex-wrap: wrap;">
              <view v-for="(item, indexCheckL) in  propsNodeSelPerson" :key="indexCheckL">
                <up-checkbox @change="nodeFn(item, indexCheckL, 'checkbox')" v-model="item['checked']"
                  :name="item['nodeName']">
                  <text :style="{ paddingRight: '15rpx', color: randomColor(item, indexCheckL) }">{{ item['nodeName']
                    }}</text>
                </up-checkbox>
              </view>
            </view>
          </up-checkbox-group>
        </view>
        <view v-else>
          <up-radio-group v-model="selectNode" style="justify-content: end;">
            <up-radio v-for="item in flowAllData.ActivityInfo" :key="item.ActivityID" :label="item.ActivityName"
              :name="item.ActivityID" :disabled="item.disabled">
            </up-radio>
          </up-radio-group>
        </view>
      </view>
    </view>
    <view v-if="selectNode">
      <up-radio-group v-model="aaa" style="justify-content: end;">
        <up-radio
          v-for="(item, index) in parseArray(flowAllData.ActivityInfo.find(e => e.ActivityID == selectNode)?.Executors_FK)"
          :key="item" :name="item"
          :label="parseArray(flowAllData.ActivityInfo.find(e => e.ActivityID == selectNode)?.ExecutorNames)?.[index]">
        </up-radio>
      </up-radio-group>
    </view>
    <up-button type="primary" size="small" style="width:30px;float: right;">选人</up-button>
  </view>
</template>
<script setup lang="ts">
import {ref} from 'vue'
const selectNode = ref('')
const aaa = ref('')
const coordinateIndex = defineModel<null|number>()
const {propsNodeSelPerson,flowAllData} = defineProps<{
  propsNodeSelPerson:any
  flowAllData:any
}>()
//随机颜色
const randomColor = (item, indexID) => {
  if (!item.color) {
    let color = '#4395ff';
    switch (indexID) {
      case 0:
        break;
      case 1:
        color = '#6666CC'
        break;
      case 2:
        color = '#003399'
        break;
      case 3:
        color = '#6633FF'
        break;
      case 4:
        color = '#000066'
        break;
      case 5:
        color = '#000099'
        break;
      case 6:
        color = '#333399'
        break;
      case 7:
        color = '#3300FF'
        break;
      case 8:
        color = '#0033CC'
        break;
      case 9:
        color = '#0033FF'
        break;
      case 10:
        color = '#330066'
        break;
      default:
        color = "#3366FF"
        break;
    }
    item.color = color;
  }
  return item.color;
}
//流转节点
const nodeFn = (item, coordinate, chooseType) => {
  if (chooseType == 'radio') {
    item.checked = true;
    if (coordinateIndex.value != null && coordinateIndex.value != undefined)
      propsNodeSelPerson.value[coordinateIndex.value].checked = false;
    coordinateIndex.value = coordinate;
  } else if (chooseType == 'checkbox') {
    item.checked = !item.checked;
  }
}

/**字符串转数组 */
const parseArray = (str:string)=>str?str.split(','):[]
</script>
<style scoped lang="scss">
.moving {
  padding: 0 10px;
  .nodeMoving {
    display: flex;
    justify-content: space-between;
  }
}

</style>