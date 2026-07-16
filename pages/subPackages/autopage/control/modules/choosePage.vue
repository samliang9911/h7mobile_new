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
      // 事件名对齐子页 publicChoicePerson 的 emit（修复原 ChoicePerson 断链）
      acceptDataFromChild(payload) {
        // 【回调触发前】返回 false 阻止值改变
        // data 保持为数组(payload.data) 透传给自定义代码(form.vue onChangeBefore)，写回则消费 mergeData（对齐 PC 端 A 契约）
        emit('onChangeBefore',{
          data: payload && payload.data !== undefined ? payload.data : payload,
          callback(change){
            if(!change)return;
            const md = (payload && payload.mergeData) || {}
            storedValueField.forEach((e,i)=>{
              const f = String(returnValueField[i]||'').split('.').pop()  // 对齐 A 的 T1.xxx 前缀截取
              const arr = md[f] || []
              formData[e] = arr.map(v => v == null ? '' : String(v)).join(',')
            })
          }
        })
      }
    },
    success(res: any) {
      // 回显：按 storedValueField/returnValueField 中尾字段为 OID/UOID 的锚点反推选中项
      const idx = storedValueField.findIndex((_, i) => {
        const t = String(returnValueField[i]||'').split('.').pop()
        return t === 'OID' || t === 'UOID'
      })
      const items = [] as any[]
      if (idx >= 0) {
        const tail = String(returnValueField[idx]).split('.').pop()
        String(formData[storedValueField[idx]] || '').split(',').filter(Boolean).forEach(v => {
          const it: any = { OID: v, type: 'Person' }
          if (tail === 'UOID') it.UOID = v
          items.push(it)
        })
      }
      // 无主键锚点时 items 为空，子页打开无预选（不报错）
      res.eventChannel.emit('acceptDataFromOpener', { items })
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