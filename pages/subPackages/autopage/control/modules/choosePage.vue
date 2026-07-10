<template>
  <view @click="chooseFrame">
    <text>{{ data }}</text>
  </view>
</template>
<script setup lang="ts">
import {defineModel,defineEmits,defineProps} from 'vue'
const data = defineModel()
const { formData,config: { url,storedValueField,returnValueField} } = defineProps<{
  /**表单数据 */
  formData:{
    /**字段名称:字段值 */
    [key:string]:any}
  config: {
    /**跳转路径 */
    url: string,
    /**存值字段 */
    storedValueField: string[],
    /**返回值字段 */
    returnValueField: string[]
  }
}>()
const emit = defineEmits<{
  /**选择回调赋值前触发  */
  onChangeBefore: [param:{
    /**选择页回调数据 */
    data:any,
    /**回调前判断是否更改数据 */
    callback:(change:boolean)=>void
  }]
  /**选择页面打开前触发(可修改选择页面参数) */
  onPageOpenBefore: []
}>()
const chooseFrame = () => {
  emit('onPageOpenBefore')
  uni.navigateTo({
    url,
    events: {
      ChoicePerson(res) {
        // 【回调触发前】返回 false 阻止值改变
        emit('onChangeBefore',{
          data:res,
          callback(change){
            if(!change)return;
            storedValueField.forEach((e,i)=>{
              formData[e] = res.reduce((a,b)=>a+=(b[returnValueField[i]]||'')+',','').replace(/,$/,'')
            })
          }
        })
      }
    },
    success() {
      //回显数据中必须包含主键OID
      // let echo = item.xuanrenArr.filter(f => f.checked).map(e=> ({...e,OID:e.ExecutorOID}) );
      // res.eventChannel.emit('echoChoicePerson', echo)
    }
  });
}
</script>
<style scoped>
view {
  min-height: 17px;
  width: 100%;
  padding-bottom: 5px;
}
text {
  font-size: 12px;
  color: rgb(96, 98, 102);
}
</style>