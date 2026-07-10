<template>
  <up-radio-group v-model="data">
    <up-radio v-for="item in options"  :label="item.label" :key="item.value"
     :name="item.value" :disabled="item.disabled" labelSize="13px">
    </up-radio>
  </up-radio-group>
</template>
<script setup lang="ts">
const data = defineModel()
const {options} = defineProps<{options:{
  /**标签 */
  label:string,
  /**值 */
  value:string,
  /**是否禁用 */
  disabled?:boolean
}[]}>()
</script>
<style lang="scss" scoped>
.u-radio-group{
  gap:0 !important;
}
.u-radio{
  margin: 10rpx;
}
:deep(.u-radio__icon-wrap.cursor-pointer.u-radio__icon-wrap--circle){
  height: 15px !important;
  width: 15px !important;
  & span{
    font-size: 12px !important;
  }
}
</style>