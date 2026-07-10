<template>
  <view style="height: 100%;padding-bottom: 80px;">
    <components v-for="item in data" :key="item.guid" v-model="item.data" v-bind="item"/>
  </view>
</template>
<script setup lang="ts">
import {CompConfig} from '/api/autopage/indexTypes'
import components from '@/pages/subPackages/autopage/components';
import {watch} from 'vue'
const data = defineModel<CompConfig[]>()
// console.log('rowData ', data.value)
/* watch(
  () => data.value,
  (newValue, oldValue) => {
    console.log('【watch】data变化:', newValue)
    console.log('长度:', newValue?.length)
  },
  { 
    deep: true,      // ✅ 深度监听数组内部变化
    immediate: true  // ✅ 立即执行，打印当前值
  }
) */
</script>