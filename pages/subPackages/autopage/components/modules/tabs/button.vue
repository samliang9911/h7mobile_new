<template>
  <view v-if="fixed" class="tabs-buttons">
   <up-button type="primary" v-for="item in button[0]" @click="click(item)" :key="item.guid" :color="item.color">
      <i v-if="item.icon" :class="'iconfont mainIcon H7_PC-'+item.icon"/>
      {{ item.name }}
    </up-button>
    <view class="more" v-if="button[1]">
      <view class="hide" :style="{height:expand?button[1].length*50-10+'px':'0px',bottom:expand?'70px':'50px'}">
        <view>
          <up-button type="primary" v-for="item in button[1]" @click="()=>{click(item);expand=false}"
            :key="item.guid" :color="item.color">
            <i v-if="item.icon" :class="'iconfont mainIcon H7_PC-'+item.icon"/>
            {{ item.name }}
          </up-button>
        </view>
      </view>
      <up-button type="primary" @click="expand=!expand">
        {{`${expand?'收起':'更多'}`}}
        <i class="iconfont H7_PC-jia" :class="{expand,buttonIcon:true}"/>
      </up-button>
    </view>
  </view>
  <view v-else class="tabs-buttons-text">
    <text v-for="item in data" @click="click(item)">{{ item.name }}</text>
  </view>
</template>
<script setup lang="ts">
/* import { ref,computed } from 'vue' */
import { ref, computed, inject } from 'vue' 
import {Button} from './types'
import {event,eventBefore,eventAfter} from './buttonEvent'
/**展开更多按钮 */
const pageComponents = inject('pageComponents')
const expand = ref(false)
const data = defineModel<Button[]>({default:[]})
const {fixed,component} = defineProps<{fixed?:boolean,component:any}>()
const button = computed(()=>{
  if(data.value.length<4)return [data.value]
  return [data.value.slice(0,2),data.value.slice(2)]
})
function click(button:Button){
 eventBefore(button.function)
   const params = {
      button,
      component,
      pageComponents // ← 新增
    }
    if (event[button.function]) {
      event[button.function](params)
    } else {
      uni.showToast({ title: `未定义【${button.function}】功能`, icon: 'none' })
    }
  eventAfter(button.function)
/*    eventBefore(button.function)
    event[button.function]?event[button.function]({button,component}):
    uni.showToast({title:`未定义【${button.function}】功能`,icon: 'none'})
    eventAfter(button.function) */
}



</script>
<style lang="scss" scoped>
.tabs-buttons-text{
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  gap: 10px;
  padding: 5px 10px;
  &>text{
    color:rgb(51, 122, 188);
    white-space: nowrap;
    font-size: 13px;
  }
}
.tabs-buttons{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); /* 自动适应列数 */
  gap: 10px;
  position: fixed;
  height: 60px;
  width: calc(100% - 40rpx);
  z-index: 10;
  bottom: 0;
  .more{
    position: relative;
    .hide{
      position: absolute;
      right: 0;
      width: 100%;
      overflow: hidden;
      transition: height 0.2s ease, bottom 0.3s cubic-bezier(0, 0, 0.8, 1);
      &>view{
        display: grid;
        gap: 10px;
      }
    }
    .expand{
      transform:rotate(215deg)
    }
    &>.u-button>.buttonIcon{
      transition: transform 0.3s ease;
      margin-left: 5px;
      font-size: 14px;
    }
  }
  .mainIcon{
    font-size: 14px;width:30px;margin-left: -10px;
  }
}
</style>