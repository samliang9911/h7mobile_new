<template>
  <!-- <up-textarea v-model="data" :placeholder="$attrs.placeholder||''" v-bind="$attrs" 
  :maxlength="-1"/> -->
  <uni-easyinput type="textarea" v-model="data" />
</template>
<script setup lang="ts">
const data = defineModel()
</script>