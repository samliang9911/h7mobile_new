<template>
  <uni-datetime-picker type="date" :value="data" v-bind="$attrs" :border="false"/>
</template>
<script setup lang="ts">
const data = defineModel()
</script>
<style scoped lang="scss">
:deep(.uni-date-x.uni-date-single){
  margin-bottom: 5px;
  &>.uni-date__x-input{
    height: 22px;
    line-height: 23px;
    text-align: left;
    font-size: 13px;
  }
  &>.uni-icons.uniui-calendar.icon-calendar{
    height: 22px;
    line-height: 22px;
  }
}
</style>