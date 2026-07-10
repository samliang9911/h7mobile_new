<template>
  <component :is="components[config[current].name]" v-bind="config[current]"
      v-model="config[current].data" :key="current"/>
</template>
<script setup lang="ts">
import {ref} from 'vue'
import components from './index';
const {config} = defineProps<{ config:any[],mainShow:number }>()
const current = ref(0)
</script>