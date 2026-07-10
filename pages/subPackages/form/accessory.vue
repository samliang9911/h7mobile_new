<template>
  <web-view :src="url" :webview-styles="style"/>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
const url = ref('');
const style = ref<any>({})
onLoad((opt = {}) => {
  const { screenHeight:height = 0, statusBarHeight:barHeight = 0} = uni.getSystemInfoSync()
  style.value = {
    top:barHeight+'px',
    height:(height - barHeight)+'px'
  }
  url.value = '/static/redirected.html#' + encodeURIComponent(opt.params);
})
</script>