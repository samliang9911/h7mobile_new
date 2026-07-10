<template>
  <view class="content" v-if="data[0]">
    <components v-model="data[0].data" v-bind="data[0]"/>
    <view class="push" style="right: -20rpx;border-radius: 20rpx 0 0 20rpx;" @click="show=true"
    v-if="data[1]"/>
    <up-popup :show="show" mode="right" overlayOpacity="0.2" v-if="data[1]">
        <view class="content" style="width:100vw;">
            <view class="push" style="left: 0;border-radius: 0 20rpx 20rpx 0;" @click="show=false"/>
            <components v-model="data[1].data" v-bind="data[1]"/>
        </view>
		</up-popup>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import components from '../../index'
import {CompConfig} from '/api/autopage/indexTypes'
const data = defineModel<CompConfig[]>({default:[]})
// 创建响应式数据   
const show = ref(false);
</script>
<style scoped lang="scss">
.content{
  width:100%;
  height: 100%;
  position: relative;
  .push{
    position: absolute;
    height: 100rpx;
    width: 40rpx;
    top: calc(50% - 50rpx);
    background: rgb(159.5, 206.5, 255);
    border: 2rpx solid rgb(51.2, 126.4, 204);
  }
}
</style>