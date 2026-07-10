<template>
  <view>
    <view style="width:100%;display: flex;justify-content: center;">
        <u-tabs class="u-tabs" :list="options" :current="current" @change="(index)=>current=index"
        style="width:400rpx;" ></u-tabs>
    </view>
    <component :is="components[config[current].name]" v-bind="config[current]"
      v-model="data" :key="config[current].guid"/>
  </view>
</template>
<script setup lang="ts">
import { ref,computed } from 'vue'
import components from './index'
const {config} = defineProps<{config:any[]}>()
const options = computed(()=>config.map(e=>({name:e.title,guid:e.guid})))
const current = ref(0)
const data = computed(()=>config[current.value].data)
</script>